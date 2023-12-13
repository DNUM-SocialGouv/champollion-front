import { LoaderFunctionArgs } from "react-router-dom"
import { errorWording, isAppError } from "../../../helpers/errors"
import {
  getEtablissementsDefaultPeriod,
  getEtablissementsType,
  getSalaries,
  postContratsEtu,
  postPostes,
} from "../../../api"
import { getQueryDates } from "../../../helpers/filters"
import {
  formatLocalMerges,
  getQueryAsArray,
  getQueryAsNumber,
  getQueryAsNumberArray,
  getQueryPage,
} from "../../../helpers/format"
import { formatCorrectedDates } from "../../../helpers/contrats"
import ls from "localstorage-slim"

export async function ContratsLoader({ params, request }: LoaderFunctionArgs) {
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
  const queryNature = getQueryAsArray(searchParams, "nature")
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryEmployee = getQueryAsNumber(searchParams, "salarie")
  const page = getQueryPage(searchParams)

  const localMergesIds = ls.get(`etab.${params.siret}.merges`) as number[][] | null
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

  const [postes, postesWithoutMerges] = await Promise.all([
    postPostes(etabType.id, formattedMergesIds),
    postPostes(etabType.id),
  ])

  const queryMotives = getQueryAsNumberArray(searchParams, "motif")
  const jobListWithoutMerges = isAppError(postesWithoutMerges) ? [] : postesWithoutMerges

  const employeesList = await getSalaries(etabType.id)
  const contratsData = await postContratsEtu({
    startDate: queryStartDate,
    endDate: queryEndDate,
    natures: queryNature,
    motives: queryMotives,
    id: etabType.id,
    postesIds: queryJobs,
    employeesIds: queryEmployee ? [queryEmployee] : undefined,
    page,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
  })

  return {
    companyName: etabType.raisonSociale,
    contratsData,
    employeesList,
    etabId: etabType.id,
    mergedPostesIds: formattedMergesIds,
    page,
    postes,
    queryEmployee,
    queryEndDate,
    queryJobs,
    queryNature,
    queryStartDate,
    raisonSociale: etabType.raisonSociale,
    siret,
    jobListWithoutMerges,
    queryMotives,
    formattedMergesIds,
    correctedDates,
  }
}
