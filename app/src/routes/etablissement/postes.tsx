import { type FormEvent, Fragment, useState } from "react"
import { defer, useLoaderData } from "react-router-typesafe"
import { useNavigation, type LoaderFunctionArgs } from "react-router-dom"
import ls from "localstorage-slim"
import { v4 as uuid } from "uuid"

import {
  getEtablissementsDefaultPeriod,
  getEtablissementsType,
  postIndicateur3,
  postPostes,
} from "../../api"
import { errorWording, isAppError } from "../../helpers/errors"
import { getQueryDates } from "../../helpers/filters"
import {
  createFiltersQuery,
  formatLocalMerges,
  formatLocalOpenDays,
  getQueryAsArray,
  getQueryAsNumberArray,
} from "../../helpers/format"
import { JobMergedBadge } from "../../helpers/contrats"
import {
  parseAndFilterMergeStr,
  type MergeOptionObject,
  filteredOptions,
} from "../../helpers/postes"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import type { AlertProps } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"
import { createModal } from "@codegouvfr/react-dsfr/Modal"

import AppMultiSelect, { type Option } from "../../components/AppMultiSelect"
import AppRebound from "../../components/AppRebound"
import Deferring from "../../components/Deferring"
import EtabFilters from "../../components/EtabFilters"
import JobProportionIndicator from "../../components/JobProportionIndicator"

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url)

  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: etabType.messageFr ?? errorWording.etab,
    })
  }

  const [etabDefaultPeriod, etabPostes] = await Promise.all([
    getEtablissementsDefaultPeriod(etabType.id),
    postPostes(etabType.id),
  ])
  const { queryStartDate, queryEndDate } = getQueryDates({
    etabDefaultPeriod,
    searchParams,
  })
  const queryMotives = getQueryAsNumberArray(searchParams, "motif")
  const queryNatures = getQueryAsArray(searchParams, "nature")

  if (isAppError(etabPostes)) {
    const responseParams: ResponseInit = {
      statusText: etabPostes.messageFr ?? errorWording.etab,
    }
    if (etabPostes.status) responseParams.status = etabPostes.status
    if (etabPostes.status == 404) responseParams.statusText = "Postes introuvables."
    throw new Response("", responseParams)
  }

  const options = etabPostes.map(
    (poste) => ({ value: poste.posteId, label: poste.libellePoste } as Option)
  )

  const localOpenDays = ls.get(`etab.${params.siret}.openDays`)
  const savedOpenDaysCodes = formatLocalOpenDays(localOpenDays)
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

  // AbortController to abort deferred calls on route change
  const indicatorController = new AbortController()

  const jobProportionIndicator = postIndicateur3({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    openDaysCodes: savedOpenDaysCodes,
    mergedPostesIds: formattedMergesIds,
    natures: queryNatures,
    motives: queryMotives,
    signal: indicatorController.signal,
  })

  if (isAppError(jobListWithMerge)) {
    const responseParams: ResponseInit = {
      statusText: jobListWithMerge.messageFr ?? errorWording.etab,
    }
    if (jobListWithMerge.status) responseParams.status = jobListWithMerge.status
    if (jobListWithMerge.status == 404) responseParams.statusText = "Postes introuvables."
    throw new Response("", responseParams)
  }

  return {
    deferredCalls: defer({
      jobProportionIndicator,
    }),
    etabId: etabType.id,
    indicatorController,
    jobList: jobListWithMerge,
    openDaysCodes: savedOpenDaysCodes,
    options,
    queryEndDate,
    queryMotives,
    queryNatures,
    queryStartDate,
    savedMerges,
    siret,
  }
}

export default function EtabPostes() {
  const {
    etabId,
    jobList: initialJobList,
    deferredCalls,
    openDaysCodes,
    options,
    queryEndDate,
    queryMotives,
    queryNatures,
    queryStartDate,
    savedMerges,
    siret,
    indicatorController,
  } = useLoaderData<typeof loader>()
  const [merges, setMerges] = useState(savedMerges)
  const [jobList, setJobList] = useState(initialJobList)
  const [jobProportionIndicator, setJobProportionIndicator] = useState(
    deferredCalls.data.jobProportionIndicator
  )
  const [alertState, setAlertState] = useState<{
    message?: string
    severity: AlertProps.Severity
    title: string
  } | null>(null)
  const [areOptionsFiltered, setAreOptionsFiltered] = useState(false)

  const navigation = useNavigation()
  if (navigation.state === "loading") {
    indicatorController.abort()
  }

  const filtersQuery = createFiltersQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: queryMotives,
    natures: queryNatures,
  })
  const modal = createModal({
    id: "job-list-modal",
    isOpenedByDefault: false,
  })

  const handleAddMerge = () => setMerges([...merges, { id: uuid(), mergedOptions: [] }])
  const handleDeleteMerge = (id: number | string) =>
    setMerges(merges.filter((merge) => merge.id !== id))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // it would probably be better to use state for formData instead of getting a FormData and parsing it,
    // but it was the code inside the former route action so quicker to keep it as is
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const data = Object.fromEntries(formData)

    const merges = parseAndFilterMergeStr(data, "merge")

    const jobListWithMerge = await postPostes(etabId, merges)

    const newJobProportionIndicator = postIndicateur3({
      id: etabId,
      startDate: queryStartDate,
      endDate: queryEndDate,
      openDaysCodes,
      mergedPostesIds: merges,
      natures: queryNatures,
      motives: queryMotives,
      signal: indicatorController.signal,
    })
    setJobProportionIndicator(newJobProportionIndicator)

    let message = "Une erreur s'est produite, vos fusions n'ont pas pu être sauvegardées."
    let severity: AlertProps.Severity = "error"
    let title = "Erreur"

    if (isAppError(jobListWithMerge)) {
      if (jobListWithMerge?.context && jobListWithMerge.context?.poste_ids) {
        const duplicatedJobsIds = jobListWithMerge.context?.poste_ids
        const duplicatedJobsLabels = duplicatedJobsIds
          .map((jobId) => options.find((job) => job.value === jobId)?.label)
          .filter(Boolean)
        message = `Vous ne pouvez pas sélectionner un même libellé dans des fusions différentes :
        ${duplicatedJobsLabels.join(", ")}`
      }
      const responseParams: ResponseInit = {
        statusText: jobListWithMerge.messageFr ?? errorWording.etab,
      }
      if (jobListWithMerge.status) responseParams.status = jobListWithMerge.status
      if (jobListWithMerge.status == 404)
        responseParams.statusText = "Postes introuvables."
    } else {
      ls.set(`etab.${siret}.merges`, merges)
      setJobList(jobListWithMerge)
      severity = "success"
      title = "Sauvegardé"
      message = "Les fusions ont bien été prises en compte."
    }

    setAlertState({ severity, title, message })
  }

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mb-1w">Module de filtres</h2>
        <hr />
        <EtabFilters
          startDate={queryStartDate}
          endDate={queryEndDate}
          natures={queryNatures}
          motives={queryMotives}
          disabledFilters={{ jobs: true }}
        />
        <h2 className="fr-text--xl fr-mb-1w">Etat des lieux des postes</h2>
        <hr />
        <Button onClick={() => modal.open()} className="fr-mb-4w">
          Consulter la liste des libellés de poste
        </Button>
        <modal.Component title="Liste des postes de l'établissement">
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
        </modal.Component>
        <h3 className="fr-text--md underline underline-offset-4">
          Postes les plus occupés
        </h3>

        <Deferring deferredPromise={jobProportionIndicator}>
          <JobProportionIndicator
            collapseReadingNote
            hasMotives={queryMotives.length > 0}
            natures={queryNatures}
          />
        </Deferring>

        <h2 className="fr-text--xl fr-mb-1w">Fusion de postes</h2>
        <hr />
        <form className="flex flex-col" method="post" onSubmit={handleSubmit}>
          <p>
            Vous pouvez choisir de fusionner certains libellés de postes correspondant à
            la même identité de poste.
          </p>
          <Checkbox
            className="fr-mb-2w"
            options={[
              {
                label: "Filtrer les libellés déjà fusionnés",
                hintText:
                  "Si vous cochez cette case, une fois un libellé ajouté à une fusion, il n'apparaîtra plus dans le menu de sélection des libellés d'une autre fusion.",
                nativeInputProps: {
                  name: "filtered-options",
                  checked: areOptionsFiltered,
                  onChange: (event) => setAreOptionsFiltered(event.target.checked),
                },
              },
            ]}
          />
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
                    options={
                      areOptionsFiltered
                        ? filteredOptions({
                            options,
                            currentMergeId: merge.id,
                            allMerges: merges,
                          })
                        : options
                    }
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
          {alertState &&
            typeof alertState === "object" &&
            Object.keys(alertState).length > 0 && (
              <Alert
                className="fr-mb-2w"
                description={alertState?.message}
                severity={alertState.severity}
                title={alertState.title}
              />
            )}

          <div className="fr-mt-4w self-end">
            <Button type="submit">Sauvegarder</Button>
          </div>
        </form>
        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
        <hr />
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <AppRebound
              desc="Lancer le diagnostic d'emploi permanent"
              linkProps={{
                to: {
                  pathname: "../recours-abusif",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Recours abusif"
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <AppRebound
              desc="Lancer le diagnostic d'anomalie des délais de carence"
              linkProps={{
                to: {
                  pathname: "../carence",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Délai de carence"
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <AppRebound
              desc="Consulter les contrats correspondants aux filtres"
              linkProps={{
                to: {
                  pathname: "../contrats",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Contrats"
            />
          </div>
        </div>
      </div>
    </>
  )
}
