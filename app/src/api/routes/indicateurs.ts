import api from "../config"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import type {
  Indicator1,
  Indicator2,
  Indicator3,
  Indicator5,
  IndicatorMetaData,
  ModificationsBody,
} from "../types"
import type { CorrectedDates } from "../../helpers/contrats"
import { PublicHolidaysClosed, addArrayParams } from "../../helpers/format"
import { addMotivesEndpointParam } from "../../helpers/filters"

type Indicateur1Params = {
  id: number
  startDate?: string
  endDate?: string
  correctedDates?: CorrectedDates
  signal?: AbortSignal
}

type Filters = {
  mergedPostesIds?: number[][]
  motives?: number[]
  natures?: string[]
  openDaysCodes?: string[]
  openDates?: string[]
  closedDates?: string[]
  closedPublicHolidays?: PublicHolidaysClosed
  postesIds?: number[]
}

type Indicateur2Params = Indicateur1Params & Omit<Filters, "natures">

type Indicateur3Params = Indicateur1Params & Omit<Filters, "postesIds">

type Indicateur5Params = Indicateur1Params & Omit<Filters, "natures" | "postesIds">

export async function postIndicateur1({
  id,
  startDate,
  endDate,
  correctedDates,
  signal,
}: Indicateur1Params) {
  try {
    let params = `etablissement_id=${id}`
    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`

    let config = {}
    if (signal) config = { signal }

    const body: ModificationsBody = {}
    if (correctedDates) body.corrected_dates = correctedDates

    const response = await api.post(`indicateurs/1?${params}`, body, config)
    const headcount = response.data?.data as Indicator1
    const meta = response.data?.meta as IndicatorMetaData

    if (headcount && meta) return { headcount, meta }
    else return handleUndefinedData("indicateurs/1")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export async function postIndicateur2({
  id,
  startDate,
  endDate,
  correctedDates,
  mergedPostesIds,
  motives,
  postesIds,
  openDaysCodes,
  openDates,
  closedDates,
  closedPublicHolidays,
  signal,
}: Indicateur2Params) {
  try {
    let params = `etablissement_id=${id}`
    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`
    params = addMotivesEndpointParam(params, motives)
    params = addArrayParams(params, postesIds, "poste_ids")
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")
    params = addArrayParams(params, openDates, "jour_ouverture_dates")
    params = addArrayParams(params, closedDates, "jour_fermeture_dates")
    if (closedPublicHolidays === "no") params += `&jour_ferie_bool=${false}`

    const body: ModificationsBody = {}
    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

    let config = {}
    if (signal) config = { signal }

    const response = await api.post(`indicateurs/2-7?${params}`, body, config)
    const workedDaysByNature = response.data?.data as Indicator2
    const meta = response.data?.meta as IndicatorMetaData

    if (workedDaysByNature && meta) return { workedDaysByNature, meta }
    else return handleUndefinedData("indicateurs/2-7")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export async function postIndicateur3({
  id,
  startDate,
  endDate,
  openDaysCodes,
  openDates,
  closedDates,
  closedPublicHolidays,
  correctedDates,
  mergedPostesIds,
  natures,
  motives,
  signal,
}: Indicateur3Params) {
  try {
    let params = `etablissement_id=${id}`

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`
    params = addMotivesEndpointParam(params, motives)
    params = addArrayParams(params, natures, "nature_contrat_ids")
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")
    params = addArrayParams(params, openDates, "jour_ouverture_dates")
    params = addArrayParams(params, closedDates, "jour_fermeture_dates")
    if (closedPublicHolidays === "no") params += `&jour_ferie_bool=${false}`

    const body: ModificationsBody = {}
    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

    let config = {}
    if (signal) config = { signal }

    const response = await api.post(`indicateurs/3-4?${params}`, body, config)
    const workedDaysByJob = response.data?.data as Indicator3
    const meta = response.data?.meta as IndicatorMetaData

    if (workedDaysByJob && meta) return { workedDaysByJob, meta }
    else return handleUndefinedData("indicateurs/3-4")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export async function postIndicateur5({
  id,
  startDate,
  endDate,
  openDaysCodes,
  openDates,
  closedDates,
  closedPublicHolidays,
  correctedDates,
  mergedPostesIds,
  motives,
  signal,
}: Indicateur5Params) {
  try {
    let params = `etablissement_id=${id}`

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`
    params = addMotivesEndpointParam(params, motives)
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")
    params = addArrayParams(params, openDates, "jour_ouverture_dates")
    params = addArrayParams(params, closedDates, "jour_fermeture_dates")
    if (closedPublicHolidays === "no") params += `&jour_ferie_bool=${false}`

    const body: ModificationsBody = {}
    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

    let config = {}
    if (signal) config = { signal }

    const response = await api.post(`indicateurs/5?${params}`, body, config)
    const precariousJobs = response.data?.data as Indicator5
    const meta = response.data?.meta as IndicatorMetaData

    if (precariousJobs && meta) return { precariousJobs, meta }
    else return handleUndefinedData("indicateurs/5")
  } catch (err) {
    return handleEndpointError(err)
  }
}
