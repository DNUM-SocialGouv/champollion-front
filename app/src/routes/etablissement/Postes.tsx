import { type FormEvent, Fragment, useState, useEffect } from "react"
import { defer, useLoaderData } from "react-router-typesafe"
import { useNavigation, type LoaderFunctionArgs, useAsyncValue } from "react-router-dom"
import ls from "localstorage-slim"
import { v4 as uuid } from "uuid"

import {
  getEtablissementsDefaultPeriod,
  getEtablissementsType,
  getPostesMerges,
  postIndicateur3,
  postIndicateur5,
  postPostes,
} from "../../api"
import type { Indicator5, IndicatorMetaData } from "../../api/types"
import { errorWording, isAppError } from "../../helpers/errors"
import { formatDate } from "../../helpers/date"
import { getQueryDates } from "../../helpers/filters"
import {
  createFiltersQuery,
  formatLocalClosedPublicHolidays,
  formatLocalExceptionalDates,
  formatLocalMerges,
  formatLocalOpenDays,
  formatNumber,
  getQueryAsArray,
  getQueryAsNumberArray,
} from "../../helpers/format"
import { formatCorrectedDates } from "../../helpers/contrats"
import {
  parseAndFilterMergeStr,
  type MergeOptionObject,
  filteredOptions,
} from "../../helpers/postes"
import { trackEvent } from "../../helpers/analytics"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import type { AlertProps } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Tag } from "@codegouvfr/react-dsfr/Tag"

import IndicatorWrapper from "../../components/indicators/IndicatorWrapper"
import MultiSelect, { type Option } from "../../components/MultiSelect"
import Rebound from "../../components/Rebound"
import Deferring from "../../components/Deferring"
import EstablishmentFilters from "../../components/establishment/EstablishmentFilters"
import JobProportionIndicator from "../../components/indicators/JobProportionIndicator"
import PrecariousJobsBarChart from "../../components/indicators/PrecariousJobsBarChart"
import JobMergedBadge from "../../components/job/JobMergedBadge"

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

  const [etabDefaultPeriod, etabPostes, suggestedJobMerges] = await Promise.all([
    getEtablissementsDefaultPeriod(etabType.id),
    postPostes(etabType.id),
    getPostesMerges(etabType.id),
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

  // Get user modifications from localStorage
  const localOpenDays = ls.get(`etab.${params.siret}.openDays`)
  const formattedOpenDaysCodes = formatLocalOpenDays(localOpenDays)
  const localOpenDates = ls.get(`etab.${params.siret}.openDates`)
  const formattedOpenDates = formatLocalExceptionalDates(localOpenDates)
  const localClosedDates = ls.get(`etab.${params.siret}.closedDates`)
  const formattedClosedDates = formatLocalExceptionalDates(localClosedDates)
  const localClosedPublicHolidays = ls.get(`etab.${params.siret}.closedPublicHolidays`)
  const formattedClosedPublicHolidays = formatLocalClosedPublicHolidays(
    localClosedPublicHolidays
  )
  const localMergesIds = ls.get(`etab.${params.siret}.merges`)
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

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

  let suggestedMerges: MergeOptionObject[] = []

  if (!isAppError(suggestedJobMerges))
    suggestedMerges = suggestedJobMerges.postes.map(
      (merge): MergeOptionObject => ({
        id: uuid(),
        mergedOptions: merge
          .map(
            (job) =>
              options.find((option) => option.value === Number(job.posteId)) ||
              ({} as Option)
          )
          .filter((option) => Object.keys(option).length > 0),
      })
    )

  const jobListWithMerge = await postPostes(etabType.id, formattedMergesIds)

  // AbortController to abort deferred calls on route change
  const indicatorController = new AbortController()

  const jobProportionIndicator = postIndicateur3({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    openDaysCodes: formattedOpenDaysCodes,
    openDates: formattedOpenDates,
    closedDates: formattedClosedDates,
    closedPublicHolidays: formattedClosedPublicHolidays,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
    natures: queryNatures,
    motives: queryMotives,
    signal: indicatorController.signal,
  })
  const precariousJobIndicator = postIndicateur5({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    openDaysCodes: formattedOpenDaysCodes,
    openDates: formattedOpenDates,
    closedDates: formattedClosedDates,
    closedPublicHolidays: formattedClosedPublicHolidays,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
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
    correctedDates,
    deferredCalls: defer({
      jobProportionIndicator,
      precariousJobIndicator,
    }),
    etabId: etabType.id,
    indicatorController,
    jobList: jobListWithMerge,
    openDaysCodes: formattedOpenDaysCodes,
    openDates: formattedOpenDates,
    closedDates: formattedClosedDates,
    closedPublicHolidays: formattedClosedPublicHolidays,
    options,
    queryEndDate,
    queryMotives,
    queryNatures,
    queryStartDate,
    raisonSociale: etabType.raisonSociale,
    savedMerges,
    siret,
    suggestedMerges,
  }
}

const modal = createModal({
  id: "job-list-modal",
  isOpenedByDefault: false,
})

export default function Postes() {
  const {
    correctedDates,
    deferredCalls,
    etabId,
    indicatorController,
    jobList: initialJobList,
    openDaysCodes,
    openDates,
    closedDates,
    closedPublicHolidays,
    options,
    queryEndDate,
    queryMotives,
    queryNatures,
    queryStartDate,
    raisonSociale,
    savedMerges,
    siret,
    suggestedMerges,
  } = useLoaderData<typeof loader>()
  const [merges, setMerges] = useState(savedMerges)
  const [jobList, setJobList] = useState(initialJobList)
  const [jobProportionIndicator, setJobProportionIndicator] = useState(
    deferredCalls.data.jobProportionIndicator
  )
  const [precariousJobIndicator, setPrecariousJobIndicator] = useState(
    deferredCalls.data.precariousJobIndicator
  )
  const [alertState, setAlertState] = useState<{
    message?: string
    severity: AlertProps.Severity
    title: string
  } | null>(null)
  const [showSavedAlert, setShowSavedAlert] = useState(false)

  const [areOptionsFiltered, setAreOptionsFiltered] = useState(false)

  const navigation = useNavigation()
  if (navigation.state === "loading") {
    indicatorController.abort()
  }

  const mergesJobIds = merges.map((mergeObject) => {
    return mergeObject.mergedOptions.map((option) => option.value)
  })
  const alreadyMergedJobs = new Set(mergesJobIds.flat())

  const filtersQuery = createFiltersQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: queryMotives,
    natures: queryNatures,
  })

  const handleAddMerge = () => {
    setMerges([...merges, { id: uuid(), mergedOptions: [] }])
    trackEvent({ category: "Postes", action: "Fusion ajoutée" })
  }
  const handleDeleteMerge = (id: number | string) =>
    setMerges(merges.filter((merge) => merge.id !== id))

  const addSuggestionToMerges = (suggestedMerge: MergeOptionObject) => {
    setMerges([...merges, { ...suggestedMerge }])
  }

  const handleSaveAllMerges = async (event: FormEvent<HTMLFormElement>) => {
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
      openDates,
      closedDates,
      closedPublicHolidays,
      correctedDates,
      mergedPostesIds: merges,
      natures: queryNatures,
      motives: queryMotives,
      signal: indicatorController.signal,
    })
    setJobProportionIndicator(newJobProportionIndicator)
    const newPrecariousJobIndicator = postIndicateur5({
      id: etabId,
      startDate: queryStartDate,
      endDate: queryEndDate,
      correctedDates,
      openDaysCodes,
      openDates,
      closedDates,
      closedPublicHolidays,
      mergedPostesIds: merges,
      motives: queryMotives,
      signal: indicatorController.signal,
    })
    setPrecariousJobIndicator(newPrecariousJobIndicator)

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
      trackEvent({
        category: "Postes",
        action: "Fusions sauvegardées",
        value: merges.length,
      })
    }

    setAlertState({ severity, title, message })
    setShowSavedAlert(true)
    setTimeout(() => setShowSavedAlert(false), 4000)
  }

  useEffect(() => {
    document.title = `Postes - ${raisonSociale}`
  }, [])

  return (
    <>
      <div className="fr-mb-3w">
        {/******* FILTERS *******/}
        <h2 className="fr-text--xl fr-mb-1w">Module de filtres</h2>
        <hr />
        <EstablishmentFilters
          startDate={queryStartDate}
          endDate={queryEndDate}
          natures={queryNatures}
          motives={queryMotives}
          disabledFilters={{ jobs: true }}
        />
        <h2 className="fr-text--xl fr-mb-1w">Etat des lieux des postes</h2>
        <hr />

        {/******* LIST OF JOB TITLES *******/}
        <Button
          onClick={() => {
            modal.open()
            trackEvent({
              category: "Postes",
              action: "Liste de libellés ouverte",
            })
          }}
          className="fr-mb-4w"
        >
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

        {/******* FIRST INDICATOR: PROPRORTION OF DAYS WORKED BY JOB TITLE *******/}
        <h3 className="fr-text--md underline underline-offset-4">
          Postes les plus occupés
        </h3>
        <Deferring deferredPromise={jobProportionIndicator}>
          <JobProportionIndicator
            collapseReadingNote
            hasMotives={queryMotives.length > 0}
            natures={queryNatures}
            tracking={{ category: "Postes" }}
          />
        </Deferring>

        {/******* SECOND INDICATOR: JOBS WITH MOST PRECARIOUS WORKERS *******/}
        <h3 className="fr-text--md fr-mt-2w underline underline-offset-4">
          Postes les plus occupés en CDD et CTT
        </h3>
        <Deferring deferredPromise={precariousJobIndicator}>
          <PrecariousJobsIndicator hasMotives={queryMotives.length > 0} />
        </Deferring>

        <h2 className="fr-text--xl fr-mb-1w fr-mt-2w">Fusion de postes</h2>
        <hr />

        {/******* SAVED MERGES *******/}
        <form className="flex flex-col" method="post" onSubmit={handleSaveAllMerges}>
          <p>
            Vous pouvez choisir de fusionner certains libellés de postes correspondant à
            la même identité de poste.
          </p>
          <h3 className="fr-text--md underline underline-offset-4">Fusions manuelles</h3>
          {/******* Filter out merged jobs from job options *******/}

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
                  onChange: (event) => {
                    const checked = event.target.checked
                    trackEvent({
                      category: "Postes",
                      action: "Checkbox filtrer libellés des fusions cochée",
                      properties: checked ? "oui" : "non",
                    })
                    setAreOptionsFiltered(checked)
                  },
                },
              },
            ]}
          />

          {/******* List of manual merges *******/}
          {merges.length > 0 &&
            merges.map((merge) => (
              <div
                key={merge.id}
                className="fr-pt-2w fr-px-2w fr-mb-2w border border-solid border-bd-default-grey bg-bg-alt-grey"
              >
                <div className="flex flex-initial flex-col items-center md:flex-row">
                  {/******* Select job labels in the same merge *******/}
                  <MultiSelect
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

                  {/******* Delete this merge *******/}
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

                {/******* Job label representing all other labels from the merge *******/}
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

          {/******* Add another merge *******/}
          <Button
            className="fr-mb-3w"
            iconId="fr-icon-add-line"
            type="button"
            onClick={handleAddMerge}
            priority="secondary"
          >
            Créer une nouvelle fusion
          </Button>

          {/******* Display success or error message after submitting merges *******/}
          {showSavedAlert && alertState !== null && (
            <Alert
              className="fr-mb-2w"
              description={alertState?.message}
              severity={alertState.severity}
              title={alertState.title}
            />
          )}

          {/******* Save merges and submit the form *******/}
          <div className="fr-mt-3w fr-mb-5w self-end">
            <Button type="submit">Sauvegarder</Button>
          </div>

          {/******* SUGGESTED MERGES *******/}
          {suggestedMerges.length > 0 && (
            <>
              <h3 className="fr-text--md underline underline-offset-4">
                Suggestions automatiques
              </h3>
              <p>
                Vous trouverez ci-dessous des suggestions de fusions automatiques. Elles
                ne sont prises en compte que si vous les ajoutez. Vous pourrez les
                modifier après les avoir ajoutées.
              </p>
              <p>
                Un libellé de poste ne pouvant pas apparaître dans plusieurs fusions, les
                suggestions contenant des libellés déjà fusionnés ne peuvent pas être
                ajoutées.
              </p>

              {/******* Suggested merges list *******/}
              {suggestedMerges.map((merge) => (
                <div
                  key={merge.id}
                  className="fr-py-1w fr-px-2w fr-mb-2w border border-dashed border-bd-default-grey bg-bg-alt-grey"
                >
                  <div className="fr-mb-1v flex flex-initial flex-col items-center justify-between md:flex-row">
                    <div>
                      {/******* List of job labels *******/}
                      {merge.mergedOptions.map((job) => (
                        <Tag
                          small
                          key={job.value}
                          className={`fr-m-1v ${
                            alreadyMergedJobs.has(job.value)
                              ? "bg-bg-action-low-pink-tuile text-tx-action-high-pink-tuile"
                              : "bg-bg-action-low-blue-france text-tx-action-high-blue-france"
                          }`}
                        >
                          {job.label}
                        </Tag>
                      ))}
                    </div>
                    {/******* Add current suggestion to merges *******/}
                    <div className="fr-mt-1w fr-mb-2w fr-mb-md-0">
                      <Button
                        iconId="fr-icon-add-line"
                        type="button"
                        onClick={() => addSuggestionToMerges(merge)}
                        priority="secondary"
                        disabled={merge.mergedOptions.some((job) =>
                          alreadyMergedJobs.has(job.value)
                        )}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {/******* Duplicated jobs message *******/}
                  {merge.mergedOptions.some((job) =>
                    alreadyMergedJobs.has(job.value)
                  ) && (
                    <p className="fr-text--sm fr-mb-0 italic">
                      Cette suggestion ne peut être ajoutée car un ou plusieurs de ses
                      libellés (en orange ici) sont contenus dans une des fusions
                      manuelles ci-dessus.
                    </p>
                  )}
                </div>
              ))}
            </>
          )}
        </form>

        {/******* ACTIONS REBOUND LINKS TO OTHER PAGES *******/}
        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
        <hr />
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Lancer le diagnostic d'emploi permanent"
              linkProps={{
                to: {
                  pathname: "../recours-abusif",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Recours abusif"
              tracking={{ category: "Postes" }}
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Lancer le diagnostic d'anomalie des délais de carence"
              linkProps={{
                to: {
                  pathname: "../carence",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Délai de carence"
              tracking={{ category: "Postes" }}
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Consulter les contrats correspondants aux filtres"
              linkProps={{
                to: {
                  pathname: "../contrats",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Contrats"
              tracking={{ category: "Postes" }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

type PrecariousJobsIndicatorDeferred = {
  precariousJobs: Indicator5
  meta: IndicatorMetaData
}

type PrecariousJobsIndicatorProps = {
  hasMotives?: boolean
}

function PrecariousJobsIndicator({ hasMotives = false }: PrecariousJobsIndicatorProps) {
  const deferredData = useAsyncValue() as PrecariousJobsIndicatorDeferred
  if (!deferredData) {
    console.error(
      "PrecariousJobsIndicator must be used in a <Await> component but didn't receive async data"
    )
    return null
  }

  const { precariousJobs, meta } = deferredData
  const start = formatDate(meta.startDate, "MMMM YYYY")
  const end = formatDate(meta.endDate, "MMMM YYYY")

  const filters = hasMotives ? " et les motifs de recours sélectionnés, " : ", "

  const data = Object.values(precariousJobs)
    .map((jobData) => {
      return {
        label: jobData.libellePoste,
        merged: jobData.merged,
        nbCddCtt: jobData.absNbCdd + jobData.absNbCtt,
        nbCdi: jobData.absNbCdi,
        ratio: jobData.relNbCdd + jobData.relNbCtt,
      }
    })
    .sort((a, b) => b.nbCddCtt - a.nbCddCtt)
    .slice(0, 10)

  const headers = [
    "Libellé de poste",
    "Jours travaillés en CDD et CTT",
    "Jours travaillés en CDI",
    "Part de jours travaillés en CDD et CTT",
  ]
  const tableData = data.map((job) => {
    const jobName = (
      <>
        {job.label}
        <JobMergedBadge merged={job.merged === 1} />
      </>
    )
    const ratio = formatNumber(job.ratio) + " %"

    return [jobName, formatNumber(job.nbCddCtt), formatNumber(job.nbCdi), ratio]
  })

  const firstJob = data[0]
  const firstJobLabel = firstJob.label

  const cddCttShare = firstJob.ratio.toLocaleString("fr-FR")
  const nbCdi = firstJob.nbCdi.toLocaleString("fr-FR")
  const nbCddCtt = firstJob.nbCddCtt.toLocaleString("fr-FR")

  const title =
    "Les dix libellés de poste comptant le plus de jours travaillés en CDD et CTT :"
  const readingNote = `
    De ${start} à ${end}, pour le libellé de poste "${firstJobLabel}"${filters}
    les jours travaillés en CDD et CTT représentent ${cddCttShare}% des jours
    travaillés en CDI, CDD et CTT soit ${nbCdi} jours travaillés en CDI pour
    ${nbCddCtt} en CDD et CTT.
  `
  const subReadingNote = hasMotives
    ? "Les CDI n'ont pas de motifs de recours : tous les CDI sont comptabilisés."
    : ""

  return (
    <IndicatorWrapper
      id="precarious-jobs"
      title={title}
      readingNote={readingNote}
      subReadingNote={subReadingNote}
      table={{ headers, data: tableData }}
      tracking={{ category: "Postes" }}
    >
      <div className="h-[28rem] w-full">
        <PrecariousJobsBarChart data={data} />
      </div>
    </IndicatorWrapper>
  )
}
