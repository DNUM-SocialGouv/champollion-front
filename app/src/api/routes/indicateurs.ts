import api from "../config"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import type { Indicator1, IndicatorMetaData } from "../types"

type Indicateur1Params = {
  id: number
  startDate?: string
  endDate?: string
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
