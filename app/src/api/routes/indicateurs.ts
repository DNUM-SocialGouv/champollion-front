import api from "../config"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import type { Indicator1, Indicator2, Indicator3, IndicatorMetaData } from "../types"
import { addArrayParams } from "../../helpers/format"

type Indicateur1Params = {
  id: number
  startDate?: string
  endDate?: string
}

type Indicateur2Params = Indicateur1Params & {
  openDaysCodes?: string[]
}

type Indicateur3Params = Indicateur2Params & {
  mergedPostesIds?: number[][]
}

export async function getIndicateur1({ id, startDate, endDate }: Indicateur1Params) {
  try {
    let params = `etablissement_id=${id}`
    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`

    const response = await api.get(`indicateurs/1?${params}`)
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
  openDaysCodes,
}: Indicateur2Params) {
  try {
    let params = `etablissement_id=${id}`
    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")

    const response = await api.post(`indicateurs/2?${params}`)
    const workedDaysByNature = response.data?.data as Indicator2
    const meta = response.data?.meta as IndicatorMetaData

    if (workedDaysByNature && meta) return { workedDaysByNature, meta }
    else return handleUndefinedData("indicateurs/2")
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
}: Indicateur3Params) {
  try {
    let params = `etablissement_id=${id}`

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")

    let body = {}
    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = Object.assign(body, { merged_poste_ids: mergedPostesIds })

    const response = await api.post(`indicateurs/3?${params}`, body)
    const workedDaysByJob = response.data?.data as Indicator3
    const meta = response.data?.meta as IndicatorMetaData

    if (workedDaysByJob && meta) return { workedDaysByJob, meta }
    else return handleUndefinedData("indicateurs/3")
  } catch (err) {
    return handleEndpointError(err)
  }
}
