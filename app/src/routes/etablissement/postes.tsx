import { Fragment, useState } from "react"
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  useActionData,
  useLoaderData,
} from "react-router-dom"
import ls from "localstorage-slim"
import { v4 as uuid } from "uuid"

import { getEtablissementsType, postPostes } from "../../api"
import { errorWording, isAppError } from "../../helpers/errors"

import { Alert, AlertProps } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Tile } from "@codegouvfr/react-dsfr/Tile"
import AppMultiSelect, { Option } from "../../components/AppMultiSelect"
import { findDuplicates, formatLocalMerges } from "../../helpers/format"
import { EtablissementPoste } from "../../api/types"
import { JobMergedBadge } from "../../helpers/contrats"

type EtabPostesAction = {
  message?: string
  severity: AlertProps.Severity
  title: string
}

type EtabPostesLoader = {
  jobList: EtablissementPoste[]
  options: Option[]
  savedMerges: MergeOptionObject[]
}

type MergeOptionObject = {
  id: number | string
  mergedOptions: Option[]
}

export async function action({
  params,
  request,
}: ActionFunctionArgs): Promise<EtabPostesAction> {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const formattedJobMergesList = Object.values(data).map(
    (merge) => (typeof merge === "string" && merge.split(",").map(Number)) || []
  )
  const validJobMergesList = formattedJobMergesList.filter((merge) => merge.length > 1)

  let message = ""
  if (formattedJobMergesList.some((merge) => merge.length === 1))
    message = "Les fusions ne contenant qu'un seul libellé ne sont pas prises en compte."

  const duplicatedPostes = findDuplicates(validJobMergesList.flat())
  if (duplicatedPostes.length > 0)
    return {
      message: `Vous ne pouvez pas sélectionner un même libellé dans des fusions différentes :
      ${duplicatedPostes.join(", ")}`,
      severity: "error",
      title: "Erreur",
    }

  ls.set(`etab.${params.siret}.merges`, validJobMergesList)
  return {
    title: "Sauvegardé",
    severity: "success",
    message,
  }
}

export async function loader({ params }: LoaderFunctionArgs): Promise<EtabPostesLoader> {
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: errorWording.etab,
    })
  }

  const etabPostes = await postPostes(etabType.id)

  if (isAppError(etabPostes)) {
    const responseParams: ResponseInit = {
      statusText: errorWording.etab,
    }
    if (etabPostes.status) responseParams.status = etabPostes.status
    if (etabPostes.status == 404) responseParams.statusText = "Postes introuvables."
    throw new Response("", responseParams)
  }

  const options = etabPostes.map(
    (poste) => ({ value: poste.posteId, label: poste.libellePoste } as Option)
  )

  const localMergesIds = ls.get(`etab.${params.siret}.merges`)
  const formattedMergesIds = formatLocalMerges(localMergesIds)

  const savedMerges: MergeOptionObject[] = Array.isArray(formattedMergesIds)
    ? formattedMergesIds.map(
        (merge): MergeOptionObject => ({
          id: uuid(),
          mergedOptions: merge
            .map(
              (id) =>
                options.find((option) => option.value === Number(id)) || ({} as Option)
            )
            .filter((option) => Object.keys(option).length > 0),
        })
      )
    : []

  const jobListWithMerge = await postPostes(etabType.id, formattedMergesIds)

  if (isAppError(jobListWithMerge)) {
    const responseParams: ResponseInit = {
      statusText: errorWording.etab,
    }
    if (jobListWithMerge.status) responseParams.status = jobListWithMerge.status
    if (jobListWithMerge.status == 404) responseParams.statusText = "Postes introuvables."
    throw new Response("", responseParams)
  }

  return {
    jobList: jobListWithMerge,
    options,
    savedMerges,
  }
}

export default function EtabPostes() {
  const savedState = useActionData() as EtabPostesAction
  const { jobList, options, savedMerges } = useLoaderData() as EtabPostesLoader
  const [merges, setMerges] = useState(savedMerges)

  const { PostesListModal, postesListModalButtonProps } = createModal({
    name: "PostesList",
    isOpenedByDefault: false,
  })

  const handleAddMerge = () => setMerges([...merges, { id: uuid(), mergedOptions: [] }])
  const handleDeleteMerge = (id: number | string) =>
    setMerges(merges.filter((merge) => merge.id !== id))

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mb-1w">Etat des lieux des postes</h2>
        <hr />
        <Button {...postesListModalButtonProps} className="fr-mb-4w" type="button">
          Consulter la liste des libellés de poste
        </Button>
        <PostesListModal
          title="Liste des postes de l'établissement"
          buttons={[
            {
              children: "Fermer",
            },
          ]}
        >
          <ul className="fr-pl-0">
            {jobList.map((job) => {
              return (
                <Fragment key={job.posteId}>
                  <li className="list-none">
                    {job.libellePoste}
                    <JobMergedBadge merged={Boolean(job.merged)} />
                  </li>
                </Fragment>
              )
            })}
          </ul>
        </PostesListModal>
        <h2 className="fr-text--xl fr-mb-1w">Fusion de postes</h2>
        <hr />
        <Form className="flex flex-col" method="post">
          <p>
            Vous pouvez choisir de fusionner certains libellés de postes correspondant à
            la même identité de poste.
          </p>
          {merges.length > 0 &&
            merges.map((merge) => (
              <div
                key={merge.id}
                className="fr-pt-2w fr-px-2w fr-mb-2w border border-solid border-bd-default-grey bg-bg-alt-grey"
              >
                <div className="flex flex-initial flex-col items-center md:flex-row">
                  <AppMultiSelect
                    className="fr-mr-2w w-full"
                    label="Fusionner les postes suivants :"
                    onChange={(newValue) => {
                      const newMerges = merges.map(
                        (savedMerge): MergeOptionObject =>
                          savedMerge.id === merge.id
                            ? { ...savedMerge, mergedOptions: newValue as Option[] }
                            : savedMerge
                      )
                      setMerges(newMerges)
                    }}
                    options={options}
                    value={merge.mergedOptions}
                  />
                  <input
                    type="hidden"
                    name={`merge-${merge.id}`}
                    value={merge.mergedOptions.map((x) => String(x.value))}
                  />
                  <div className="fr-mt-1w fr-mb-2w fr-mb-md-0">
                    <Button
                      iconId="fr-icon-delete-line"
                      type="button"
                      onClick={() => handleDeleteMerge(merge.id)}
                      priority="secondary"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
                <div className="fr-mb-3w flex flex-wrap">
                  <p className="fr-text--sm fr-mb-0 fr-mr-1v italic">
                    Le nouveau nom du poste ainsi constitué est le 1e libellé sélectionné
                    :
                  </p>
                  {merge.mergedOptions.length > 0 && (
                    <span className="fr-text--sm fr-mb-0 fr-mr-1w italic">
                      {merge.mergedOptions[0].label || ""}
                      <JobMergedBadge merged />
                    </span>
                  )}
                </div>
              </div>
            ))}

          <Button
            className="fr-mt-2w fr-mb-8w"
            iconId="fr-icon-add-line"
            type="button"
            onClick={handleAddMerge}
            priority="secondary"
          >
            Ajouter une fusion
          </Button>
          {savedState && Object.keys(savedState).length > 0 && (
            <Alert
              className="fr-mb-2w"
              description={savedState?.message}
              severity={savedState.severity}
              title={savedState.title}
            />
          )}
          <div className="fr-mt-4w self-end">
            <Button type="submit">Sauvegarder</Button>
          </div>
        </Form>

        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
        <hr />
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <Tile
              desc="Lancer le diagnostic d'emploi permanent"
              enlargeLink
              linkProps={{
                to: "../recours-abusif",
              }}
              title="Recours abusif"
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Tile
              desc="Lancer le diagnostic d'anomalie des délais de carence"
              enlargeLink
              linkProps={{
                to: { pathname: "../carence" },
              }}
              title="Délai de carence"
            />
          </div>
        </div>
      </div>
    </>
  )
}
