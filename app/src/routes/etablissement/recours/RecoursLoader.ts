import { type LoaderFunctionArgs } from "react-router-dom"
import { defer } from "react-router-typesafe"
import ls from "localstorage-slim"

import {
  postEffectifs,
  postPostes,
  getEtablissementsType,
  getEtablissementsDefaultPeriod,
  postIndicateur2,
} from "../../../api"
import type { EffectifUnit } from "../../../api/types"
import { isEffectifUnit } from "../../../api/types"

import { formatCorrectedDates } from "../../../helpers/contrats"
import { errorWording, isAppError } from "../../../helpers/errors"
import { getQueryDates } from "../../../helpers/filters"
import {
  formatLocalClosedPublicHolidays,
  formatLocalExceptionalDates,
  formatLocalMerges,
  formatLocalOpenDays,
  getQueryAsNumberArray,
  getQueryAsString,
} from "../../../helpers/format"

export async function RecoursLoader({ params, request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url)

  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

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
  const queryMotives = getQueryAsNumberArray(searchParams, "motif")
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryUnit = getQueryAsString(searchParams, "unit")

  const unit: EffectifUnit = isEffectifUnit(queryUnit) ? queryUnit : "avg"

  // Get user modifications from localStorage
  const localMergesIds = ls.get(`etab.${params.siret}.merges`) as number[][] | null
  const formattedMergesIds = formatLocalMerges(localMergesIds)
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
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

  const [postes, postesWithoutMerges] = await Promise.all([
    postPostes(etabType.id, formattedMergesIds),
    postPostes(etabType.id),
  ])
  const jobListWithoutMerges = isAppError(postesWithoutMerges) ? [] : postesWithoutMerges

  // AbortController to abort all deferred calls on route change
  const deferredCallsController = new AbortController()
  const effectifsData = postEffectifs({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    unit,
    motives: queryMotives,
    postesIds: queryJobs,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
    openDaysCodes: formattedOpenDays,
    openDates: formattedOpenDates,
    closedDates: formattedClosedDates,
    closedPublicHolidays: formattedClosedPublicHolidays,
    signal: deferredCallsController.signal,
  })
  const contractNatureIndicator = postIndicateur2({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: queryMotives,
    postesIds: queryJobs,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
    openDaysCodes: formattedOpenDays,
    openDates: formattedOpenDates,
    closedDates: formattedClosedDates,
    closedPublicHolidays: formattedClosedPublicHolidays,
    signal: deferredCallsController.signal,
  })

  return {
    deferredCalls: defer({
      contractNatureIndicator,
      effectifsData,
    }),
    deferredCallsController,
    jobListWithoutMerges,
    formattedMergesIds,
    postes,
    queryEndDate,
    queryJobs,
    queryMotives,
    queryStartDate,
    raisonSociale: etabType.raisonSociale,
    unit,
  }
}
