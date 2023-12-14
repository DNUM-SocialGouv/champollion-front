import ls from "localstorage-slim"
import { type LoaderFunctionArgs } from "react-router-dom"
import { defer } from "react-router-typesafe"

import {
  getEtablissementsInfo,
  getEtablissementsType,
  getPublicHolidays,
  postEffectifsLast,
  postIndicateur1,
  postIndicateur2,
  postIndicateur3,
} from "../../../api"

import { formatCorrectedDates } from "../../../helpers/contrats"
import { errorWording, isAppError } from "../../../helpers/errors"
import { minDateWithData, oneYearLater } from "../../../helpers/date"
import {
  formatLocalClosedPublicHolidays,
  formatLocalExceptionalDates,
  formatLocalMerges,
  formatLocalOpenDays,
} from "../../../helpers/format"

export async function SyntheseLoader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: etabType.messageFr ?? errorWording.etab,
    })
  }

  const etabId = etabType.id

  // Get user modifications from localStorage
  const localOpenDays = ls.get(`etab.${params.siret}.openDays`)
  const savedOpenDaysCodes = formatLocalOpenDays(localOpenDays)
  const localOpenDates = ls.get(`etab.${params.siret}.openDates`)
  const savedOpenDates = formatLocalExceptionalDates(localOpenDates)
  const localClosedDates = ls.get(`etab.${params.siret}.closedDates`)
  const savedClosedDates = formatLocalExceptionalDates(localClosedDates)
  const localClosedPublicHolidays = ls.get(`etab.${params.siret}.closedPublicHolidays`)
  const savedClosedPublicHolidays = formatLocalClosedPublicHolidays(
    localClosedPublicHolidays
  )
  const localMergesIds = ls.get(`etab.${params.siret}.merges`)
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

  const [info, lastEffectif, publicHolidays] = await Promise.all([
    getEtablissementsInfo(etabId),
    postEffectifsLast(etabId, correctedDates),
    getPublicHolidays({ startDate: minDateWithData, endDate: oneYearLater }),
  ])

  // AbortController to abort all deferred calls on route change
  const deferredCallsController = new AbortController()

  const headcountIndicator = postIndicateur1({
    id: etabId,
    correctedDates,
    signal: deferredCallsController.signal,
  })
  const contractNatureIndicator = postIndicateur2({
    id: etabId,
    openDaysCodes: savedOpenDaysCodes,
    openDates: savedOpenDates,
    closedDates: savedClosedDates,
    closedPublicHolidays: savedClosedPublicHolidays,
    correctedDates,
    signal: deferredCallsController.signal,
  })
  const jobProportionIndicator = postIndicateur3({
    id: etabId,
    openDaysCodes: savedOpenDaysCodes,
    openDates: savedOpenDates,
    closedDates: savedClosedDates,
    closedPublicHolidays: savedClosedPublicHolidays,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
    signal: deferredCallsController.signal,
  })

  return {
    deferredCalls: defer({
      contractNatureIndicator,
      headcountIndicator,
      jobProportionIndicator,
    }),
    deferredCallsController,
    info,
    lastEffectif,
    raisonSociale: etabType.raisonSociale,
    publicHolidays,
    savedClosedDates,
    savedClosedPublicHolidays,
    savedOpenDates,
    savedOpenDaysCodes,
    siret,
  }
}
