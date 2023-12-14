import { redirect } from "react-router-dom"

import type { LoaderFunctionArgs } from "react-router-dom"
import ls from "localstorage-slim"

import {
  getEtablissementsInfo,
  getEtablissementsType,
  getContratsEtt,
  postEffectifsLast,
  getEtablissementsDefaultPeriod,
  postPostes,
  getSalaries,
} from "../../api"
import { errorWording, isAppError } from "../../helpers/errors"
import { formatCorrectedDates } from "../../helpers/contrats"
import { getQueryDates } from "../../helpers/filters"
import { initEmployeeOptions, initJobOptions } from "../../helpers/postes"
import {
  getQueryAsArray,
  getQueryAsNumber,
  getQueryAsNumberArray,
  getQueryPage,
} from "../../helpers/format"

export async function ETTLoader({ params, request }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const { searchParams } = new URL(request.url)
  const page = getQueryPage(searchParams)
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    const responseParams: ResponseInit = {
      statusText: etabType.messageFr ?? errorWording.etab,
    }
    if (etabType.status) responseParams.status = etabType.status
    if (etabType.status == 404) responseParams.statusText = "SIRET introuvable."
    throw new Response("", responseParams)
  }

  if (!etabType.ett) {
    return redirect(`/etablissement/${siret}`)
  }

  const etabDefaultPeriod = await getEtablissementsDefaultPeriod(etabType.id)

  const { queryStartDate, queryEndDate } = getQueryDates({
    etabDefaultPeriod,
    searchParams,
  })
  const queryNature = getQueryAsArray(searchParams, "nature")
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryEmployee = getQueryAsNumber(searchParams, "salarie")

  const queryMotives = getQueryAsNumberArray(searchParams, "motif")

  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

  const [postes, info, lastEffectif, data, employeesList] = await Promise.all([
    postPostes(etabType.id),
    getEtablissementsInfo(etabType.id),
    postEffectifsLast(etabType.id, correctedDates),
    getContratsEtt({
      id: etabType.id,
      page,
      startDate: queryStartDate,
      endDate: queryEndDate,
      motives: queryMotives,
      employeesIds: queryEmployee ? [queryEmployee] : undefined,
      postesIds: queryJobs,
      natures: queryNature,
    }),
    getSalaries(etabType.id),
  ])
  const options = initJobOptions(postes)
  const employeesOptions = initEmployeeOptions(employeesList)

  return {
    info,
    lastEffectif,
    page,
    raisonSociale: etabType.raisonSociale,
    siret,
    data,
    queryStartDate,
    queryEndDate,
    queryNature,
    queryJobs,
    queryEmployee,
    queryMotives,
    options,
    employeesOptions,
    etabType,
    correctedDates,
  }
}
