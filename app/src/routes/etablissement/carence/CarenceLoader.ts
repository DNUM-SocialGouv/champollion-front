import ls from "localstorage-slim"
import { LoaderFunctionArgs, defer } from "react-router-dom"
import {
  getCarencesIdcc,
  getEtablissementsDefaultPeriod,
  getEtablissementsType,
  postCarences,
  postPostes,
} from "../../../api"
import { errorWording, isAppError } from "../../../helpers/errors"
import { getQueryDates } from "../../../helpers/filters"
import {
  camelToSnakeCase,
  formatLocalClosedPublicHolidays,
  formatLocalExceptionalDates,
  formatLocalMerges,
  formatLocalOpenDays,
  getQueryAsNumberArray,
  getQueryAsString,
} from "../../../helpers/format"
import { formatCorrectedDates } from "../../../helpers/contrats"

export async function CarenceLoader({ params, request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url)

  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)
  const idccData = await getCarencesIdcc()

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: etabType.messageFr ?? errorWording.etab,
    })
  }
  const etabDefaultPeriod = await getEtablissementsDefaultPeriod(etabType.id)

  const { queryStartDate, queryEndDate } = getQueryDates({
    etabDefaultPeriod,
    searchParams,
  })
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryLegislation = getQueryAsString(searchParams, "legislation") || "droitCommun"

  // Get user modifications from localStorage

  const localMergesIds = ls.get(`etab.${params.siret}.merges`) as number[][] | null
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)
  const localOpenDays = ls.get(`etab.${params.siret}.openDays`)
  const formattedOpenDays = formatLocalOpenDays(localOpenDays)
  const localOpenDates = ls.get(`etab.${params.siret}.openDates`)
  const formattedOpenDates = formatLocalExceptionalDates(localOpenDates)
  const localClosedDates = ls.get(`etab.${params.siret}.closedDates`)
  const formattedClosedDates = formatLocalExceptionalDates(localClosedDates)
  const localClosedPublicHolidays = ls.get(`etab.${params.siret}.closedPublicHolidays`)
  const formattedClosedPublicHolidays = formatLocalClosedPublicHolidays(
    localClosedPublicHolidays
  )

  const deferredCallsController = new AbortController()

  const carences = postCarences({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    legislation: camelToSnakeCase(queryLegislation),
    correctedDates,
    mergedPostesIds: formattedMergesIds,
    openDaysCodes: formattedOpenDays,
    openDates: formattedOpenDates,
    closedDates: formattedClosedDates,
    closedPublicHolidays: formattedClosedPublicHolidays,
    postesIds: queryJobs,
    signal: deferredCallsController.signal,
  })

  const [postes, postesWithoutMerges] = await Promise.all([
    postPostes(etabType.id, formattedMergesIds),
    postPostes(etabType.id),
  ])

  const jobListWithoutMerges = isAppError(postesWithoutMerges) ? [] : postesWithoutMerges

  return {
    deferredCalls: defer({
      carences,
    }),
    // deferredCalls:carences,
    deferredCallsController,
    idccData,
    legislationCode: queryLegislation,
    postes,
    queryEndDate,
    queryJobs,
    queryStartDate,
    raisonSociale: etabType.raisonSociale,
    jobListWithoutMerges,
    formattedMergesIds,
  }
}
