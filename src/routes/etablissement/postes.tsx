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

import { getEtablissementsType, getPostes } from "../../api"
import { errorWording, isAppError } from "../../helpers/errors"
import { getJobListWithMerge } from "../../helpers/postes"

import { Alert, AlertProps } from "@codegouvfr/react-dsfr/Alert"
import { Badge } from "@codegouvfr/react-dsfr/Badge"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Tile } from "@codegouvfr/react-dsfr/Tile"
import AppMultiSelect, { Option } from "../../components/AppMultiSelect"

type EtabPostesAction = {
  message?: string
  severity: AlertProps.Severity
  title: string
}

type EtabPostesLoader = {
  jobListWithMerge: {
    label: string
    isMergeResult: boolean
    isRedundant: boolean
  }[]
  options: Option[]
  savedMerges: MergeOptionObject[]
}

type MergeOptionObject = {
  id: number | string
  mergeLabels: Option[]
}

export async function action({
  params,
  request,
}: ActionFunctionArgs): Promise<EtabPostesAction> {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const duplicatedPostes = Object.values(data)
    .map((x) => (typeof x === "string" ? x.split(",") : ""))
    .filter((x) => x.length > 1)
    .flat()
    .filter((item, index, array) => array.indexOf(item) !== index)
  if (duplicatedPostes.length > 0)
    return {
      message: `Vous ne pouvez pas sélectionner un même libellé dans des fusions différentes :
      ${duplicatedPostes.toString().replace(",", ", ")}`,
      severity: "error",
      title: "Erreur",
    }
  const mergesLabelsArr = Object.values(data)
    .map((merge) => (typeof merge === "string" && merge.split(",")) || [])
    .filter((merge) => Array.isArray(merge) && merge.length > 1)
  ls.set(`etab.${params.siret}.merges`, mergesLabelsArr)
  return {
    title: "Sauvegardé",
    severity: "success",
  }
}

export async function loader({ params }: LoaderFunctionArgs): Promise<EtabPostesLoader> {
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      statusText: errorWording.etab,
    })
  }

  const etabPostes = await getPostes(etabType.id)

  if (isAppError(etabPostes)) {
    const responseParams: ResponseInit = {
      statusText: errorWording.etab,
    }
    if (etabPostes.status) responseParams.status = etabPostes.status
    if (etabPostes.status == 404) responseParams.statusText = "Postes introuvables."
    throw new Response("", responseParams)
  }
  const options = etabPostes.map(
    (poste, index) => ({ value: index, label: poste.libelle } as Option)
  )

  const localMergesLabels = ls.get(`etab.${params.siret}.merges`) as string[][] | null
  const jobListWithMerge = getJobListWithMerge(etabPostes, localMergesLabels)

  const savedMerges: MergeOptionObject[] = Array.isArray(localMergesLabels)
    ? localMergesLabels.map(
        (merge): MergeOptionObject => ({
          id: uuid(),
          mergeLabels: merge
            .map(
              (label) =>
                options.find((option) => option.label === label) || ({} as Option)
            )
            .filter((option) => Object.keys(option).length > 0),
        })
      )
    : []

  return { jobListWithMerge, options, savedMerges }
}

export default function EtabPostes() {
  const savedState = useActionData() as EtabPostesAction
  const { jobListWithMerge, options, savedMerges } = useLoaderData() as EtabPostesLoader
  const [merges, setMerges] = useState(savedMerges)
  const { PostesListModal, postesListModalButtonProps } = createModal({
    name: "PostesList",
    isOpenedByDefault: false,
  })

  const handleAddMerge = () => setMerges([...merges, { id: uuid(), mergeLabels: [] }])
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
            {jobListWithMerge.map((poste) => {
              return (
                <Fragment key={poste.label}>
                  {!poste.isRedundant && (
                    <li className="list-none">
                      {poste.label}
                      {poste.isMergeResult && (
                        <Badge severity="new" className={"fr-ml-1w"} small>
                          Fusionné
                        </Badge>
                      )}
                    </li>
                  )}
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
                            ? { ...savedMerge, mergeLabels: newValue as Option[] }
                            : savedMerge
                      )
                      setMerges(newMerges)
                    }}
                    options={options}
                    value={merge.mergeLabels}
                  />
                  <input
                    type="hidden"
                    name={`merge-${merge.id}`}
                    value={merge.mergeLabels.map((x) => x.label)}
                  />
                  <div className="fr-mt-1w fr-mb-2w md:fr-mb-0">
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
                  {merge.mergeLabels.length > 0 && (
                    <span className="fr-text--sm fr-mb-0 fr-mr-1w italic">
                      {merge.mergeLabels[0].label || ""}
                      <Badge severity="new" className="fr-ml-1w" small>
                        Fusionné
                      </Badge>
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

        <h2 className="fr-text--xl fr-mb-1w">Actions</h2>
        <hr />
        <Tile
          className="w-full md:w-1/3"
          desc="Lancer le diagnostic d'emploi permanent"
          enlargeLink
          linkProps={{
            to: "../recours-abusif",
          }}
          title="Recours abusif"
        />
      </div>
    </>
  )
}
