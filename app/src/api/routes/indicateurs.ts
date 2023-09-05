import api from "../config"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import type { Indicator1, Indicator2, Indicator3, IndicatorMetaData } from "../types"
import { addArrayParams } from "../../helpers/format"
import { motivesCodeDict } from "../../helpers/filters"

type Indicateur1Params = {
  id: number
  startDate?: string
  endDate?: string
  signal?: AbortSignal
}

type Filters = {
  mergedPostesIds?: number[][]
  motives?: number[]
  natures?: string[]
  openDaysCodes?: string[]
  postesIds?: number[]
}

type Indicateur2Params = Indicateur1Params & Omit<Filters, "natures">

type Indicateur3Params = Indicateur1Params & Omit<Filters, "postesIds">

export async function getIndicateur1({
  id,
  startDate,
  endDate,
  signal,
}: Indicateur1Params) {
  try {
    let params = `etablissement_id=${id}`
    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`

    let config = {}
    if (signal) config = { signal }

    const response = await api.get(`indicateurs/1?${params}`, config)
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
  mergedPostesIds,
  motives,
  postesIds,
  openDaysCodes,
  signal,
}: Indicateur2Params) {
  try {
    let params = `etablissement_id=${id}`
    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`
    if (motives && motives.length > 0) {
      const motivesCodes = motives
        .map((motive) => motivesCodeDict[motive])
        .filter(Boolean)
        .flat()
      const motivesParam = motivesCodes
        .map((motive) => `motif_recours_ids=${motive}`)
        .join("&")
      params += `&${motivesParam}`
    }
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")
    params = addArrayParams(params, postesIds, "poste_ids")

    let body = {}
    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = { merged_poste_ids: mergedPostesIds }

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
  mergedPostesIds,
  natures,
  motives,
  signal,
}: Indicateur3Params) {
  try {
    let params = `etablissement_id=${id}`

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`
    if (motives && motives.length > 0) {
      const motivesCodes = motives
        .map((motive) => motivesCodeDict[motive])
        .filter(Boolean)
        .flat()
      const motivesParam = motivesCodes
        .map((motive) => `motif_recours_ids=${motive}`)
        .join("&")
      params += `&${motivesParam}`
    }
    params = addArrayParams(params, natures, "nature_contrat_ids")
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")

    let body = {}
    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = { merged_poste_ids: mergedPostesIds }

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
