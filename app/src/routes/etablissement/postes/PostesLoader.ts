import { defer } from "react-router-typesafe"
import ls from "localstorage-slim"
import { v4 as uuid } from "uuid"
import { type LoaderFunctionArgs } from "react-router-dom"

import {
  getEtablissementsDefaultPeriod,
  getEtablissementsType,
  getPostesMerges,
  postIndicateur3,
  postIndicateur5,
  postPostes,
} from "../../../api"
import { errorWording, isAppError } from "../../../helpers/errors"
import { getQueryDates } from "../../../helpers/filters"
import {
  formatLocalClosedPublicHolidays,
  formatLocalExceptionalDates,
  formatLocalMerges,
  formatLocalOpenDays,
  getQueryAsArray,
  getQueryAsNumberArray,
} from "../../../helpers/format"
import { formatCorrectedDates } from "../../../helpers/contrats"
import { MergeOptionObject } from "../../../helpers/postes"
import { type Option } from "../../../components/MultiSelect"

export async function PostesLoader({ params, request }: LoaderFunctionArgs) {
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
