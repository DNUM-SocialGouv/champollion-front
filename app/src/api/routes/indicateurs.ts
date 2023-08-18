import api from "../config"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import type { Indicator1, Indicator2, IndicatorMetaData } from "../types"
import { addArrayParams } from "../../helpers/format"

type Indicateur1Params = {
  id: number
  startDate?: string
  endDate?: string
}

type Indicateur2Params = Indicateur1Params & {
  openDaysCodes?: string[]
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

export async function getIndicateur2({
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

    const response = await api.get(`indicateurs/2?${params}`)
    const workedDays = response.data?.data as Indicator2
    const meta = response.data?.meta as IndicatorMetaData

    if (workedDays && meta) return { workedDays, meta }
    else return handleUndefinedData("indicateurs/2")
  } catch (err) {
    return handleEndpointError(err)
  }
}
