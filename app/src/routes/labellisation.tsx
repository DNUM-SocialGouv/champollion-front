import { Fragment, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Form, type ActionFunctionArgs } from "react-router-dom"
import { useActionData, useLoaderData } from "react-router-typesafe"
import { v4 as uuid } from "uuid"

import {
  getLabellisations as getRandomJobs,
  postLabellisations as postLabellisationsMerges,
} from "../api"
import { getErrorMessage, isAppError } from "../helpers/errors"
import {
  parseAndFilterMergeStr,
  type MergeOptionObject,
  filteredOptions,
} from "../helpers/postes"
import { findDuplicates } from "../helpers/format"

import { Alert, type AlertProps } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"

import AppMultiSelect from "../components/AppMultiSelect"
import type { Option } from "../components/AppMultiSelect"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const etabId = Number(formData.get("etablissement-id"))
  const data = Object.fromEntries(formData)

  const likelyMerges = parseAndFilterMergeStr(data, "likely")
  const unclearMerges = parseAndFilterMergeStr(data, "unclear")

  const result = await postLabellisationsMerges({
    etablissementId: etabId,
    mergedPostesIds: likelyMerges,
    unclearMergedPostesIds: unclearMerges,
  })

  let severity: AlertProps.Severity = "success"
  let message
  let title = `Les fusions ont bien été sauvegardées pour l'établissement ${etabId}, voici un nouvel établissement à labelliser.`

  if (isAppError(result)) {
    severity = "error"
    ;(message = getErrorMessage(result).messageFr),
      (title = `Une erreur est survenue sur l'établissement ${etabId}`)
  }

  const alertData: { title: string; message?: string; severity: AlertProps.Severity } = {
    title,
    message,
    severity,
  }

  return alertData
}

export async function loader() {
  const jobs = await getRandomJobs()

  if (isAppError(jobs)) {
    throw new Response("", {
      status: jobs.status ?? undefined,
      statusText:
        "Une erreur s'est produite, veuillez recharger la page ou réessayer plus tard.",
    })
  }

  const etabId = jobs.meta.etablissementId

  return {
    etabId,
    jobList: jobs.data,
  }
}

const modal = createModal({
  id: "job-list-modal",
  isOpenedByDefault: false,
})

export default function Labellisation() {
  const savedState = useActionData<typeof action>()
  const { etabId, jobList } = useLoaderData<typeof loader>()

  const options = jobList.map(
    (poste) => ({ value: poste.posteId, label: poste.libellePoste } as Option)
  )

  return (
    <>
      <div className="flex w-full flex-col items-center">
        <div className="fr-pt-3w fr-pb-2w fr-mb-1v w-full bg-bg-contrast-info">
          <div className="fr-container mx-auto">
            <h1 className="fr-h3 fr-mb-3v">Labellisation de postes</h1>
            <p className="fr-mb-1v">
              <span className="font-bold">ID Etablissement : </span>
              {etabId}
            </p>
          </div>
        </div>
        <div className="fr-container fr-py-4w flex flex-col">
          {savedState && Object.keys(savedState).length > 0 && (
            <Alert
              className="fr-mb-2w"
              description={savedState?.message}
              severity={savedState.severity}
              title={savedState.title}
            />
          )}

          <p className="fr-mb-2w">
            Voici une liste de libellés d'un nouvel établissement à labelliser.
          </p>

          <Button onClick={() => modal.open()} className="fr-mb-4w">
            Consulter la liste des libellés de poste
          </Button>
          <modal.Component title="Liste des postes de l'établissement">
            <ul className="fr-pl-0">
              {jobList.map((job) => {
                return (
                  <Fragment key={job.posteId}>
                    <li className="list-none">{job.libellePoste}</li>
                  </Fragment>
                )
              })}
            </ul>
          </modal.Component>
          <p className="italic">
            ⚠️ Les modifications seront perdues en cas de rechargement de la page ou en
            l'absence de validation.
          </p>

          <LabellisationForm key={etabId} etabId={etabId} options={options} />
        </div>
      </div>
    </>
  )
}

// Separate Form in another component to reset form state by changing component key
function LabellisationForm({ etabId, options }: { etabId: number; options: Option[] }) {
  const initialEmptyLikelyMerges: MergeOptionObject[] = Array(3)
    .fill(null)
    .map(() => ({
      id: uuid(),
      mergedOptions: [],
    }))
  const [likelyMerges, setLikelyMerges] = useState(initialEmptyLikelyMerges)

  const handleAddLikelyMerge = () =>
    setLikelyMerges([...likelyMerges, { id: uuid(), mergedOptions: [] }])
  const handleDeleteLikelyMerge = (id: number | string) =>
    setLikelyMerges(likelyMerges.filter((merge) => merge.id !== id))

  const initialEmptyUnclearMerges: MergeOptionObject[] = Array(3)
    .fill(null)
    .map(() => ({
      id: uuid(),
      mergedOptions: [],
    }))
  const [unclearMerges, setUnclearMerges] = useState(initialEmptyUnclearMerges)
  const [duplicatedJobs, setDuplicatedJobs] = useState([] as string[])

  const handleAddUnclearMerge = () =>
    setUnclearMerges([...unclearMerges, { id: uuid(), mergedOptions: [] }])
  const handleDeleteUnclearMerge = (id: number | string) =>
    setUnclearMerges(unclearMerges.filter((merge) => merge.id !== id))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <Form
      className="flex flex-col"
      method="post"
      onSubmit={(event: FormEvent) => {
        const duplicatedPostes = findDuplicates(
          likelyMerges
            .map((merge) => merge.mergedOptions)
            .concat(unclearMerges.map((merge) => merge.mergedOptions))
            .flat()
        )
        if (duplicatedPostes.length > 0) {
          event.preventDefault()
          setDuplicatedJobs(duplicatedPostes.map((poste) => poste.label))
        }
      }}
    >
      <input type="hidden" name="etablissement-id" value={etabId} />
      <h2 className="fr-text--xl">Fusions très probables</h2>
      <p>
        Si certains libellés décrivent le même poste de manière certaine (ex: coquille,
        abbréviation, majuscules...), ajoutez les fusions correspondantes.
      </p>

      {likelyMerges.length > 0 &&
        likelyMerges.map((merge) => (
          <MergeItem
            currentMerge={merge}
            mergeName="likely"
            key={merge.id}
            merges={likelyMerges}
            setMerges={setLikelyMerges}
            options={filteredOptions({
              options,
              currentMergeId: merge.id,
              allMerges: [...likelyMerges, ...unclearMerges],
            })}
            handleDeleteMerge={handleDeleteLikelyMerge}
          />
        ))}

      <Button
        className="fr-mt-2w fr-mb-6w"
        iconId="fr-icon-add-line"
        type="button"
        onClick={handleAddLikelyMerge}
        priority="secondary"
      >
        Créer une autre fusion très probable
      </Button>
      <h2 className="fr-text--xl">Fusions possibles</h2>
      <p>
        Si certains libellés semblent décrire le même poste mais que ce n'est pas aussi
        sûr, ajoutez les fusions ici.
      </p>
      <p className="italic">
        ⚠️ Un libellé ne peut appartenir qu'à une seule fusion, peu importe la catégorie
        (très probable ou possible).
      </p>

      {unclearMerges.length > 0 &&
        unclearMerges.map((merge) => (
          <MergeItem
            currentMerge={merge}
            mergeName="unclear"
            key={merge.id}
            merges={unclearMerges}
            setMerges={setUnclearMerges}
            options={filteredOptions({
              options,
              currentMergeId: merge.id,
              allMerges: [...likelyMerges, ...unclearMerges],
            })}
            handleDeleteMerge={handleDeleteUnclearMerge}
          />
        ))}

      <Button
        className="fr-mt-2w fr-mb-6w"
        iconId="fr-icon-add-line"
        type="button"
        onClick={handleAddUnclearMerge}
        priority="secondary"
      >
        Créer une autre fusion possible
      </Button>

      <div className="fr-mt-4w fr-mb-2w self-end">
        <Button type="submit">Valider et envoyer les fusions</Button>
      </div>

      {duplicatedJobs.length > 0 && (
        <Alert
          className="fr-mb-2w"
          description={`Vous ne pouvez pas sélectionner un même libellé dans des fusions différentes :
              ${duplicatedJobs.join(", ")}`}
          severity="error"
          title="Erreur"
        />
      )}
    </Form>
  )
}

function MergeItem({
  currentMerge,
  mergeName,
  merges,
  setMerges,
  options,
  handleDeleteMerge,
}: {
  currentMerge: MergeOptionObject
  mergeName: string
  merges: MergeOptionObject[]
  setMerges: (merge: MergeOptionObject[]) => void
  options: Option[]
  handleDeleteMerge: (mergeId: string | number) => void
}) {
  return (
    <div className="fr-pt-2w fr-px-2w fr-mb-2w border border-solid border-bd-default-grey bg-bg-alt-grey">
      <div className="flex flex-initial flex-col items-center md:flex-row">
        <AppMultiSelect
          className="fr-mr-2w w-full"
          label="Fusionner les postes suivants :"
          onChange={(newValue) => {
            const newMerges = merges.map(
              (savedMerge): MergeOptionObject =>
                savedMerge.id === currentMerge.id
                  ? { ...savedMerge, mergedOptions: newValue as Option[] }
                  : savedMerge
            )
            setMerges(newMerges)
          }}
          options={options}
          value={currentMerge.mergedOptions}
        />
        <input
          type="hidden"
          name={`merge-${mergeName}-${currentMerge.id}`}
          value={currentMerge.mergedOptions.map((x) => String(x.value))}
        />
        <div className="fr-mt-1w fr-mb-2w fr-mb-md-0">
          <Button
            iconId="fr-icon-delete-line"
            type="button"
            onClick={() => handleDeleteMerge(currentMerge.id)}
            priority="secondary"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  )
}
