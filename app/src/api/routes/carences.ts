import api from "../config"
import type { IDCC, Infractions } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { addArrayParams } from "../../helpers/format"

type CarenceParams = {
  id: number
  startDate?: string
  endDate?: string
  postesIds?: number[]
  openDaysCodes?: string[]
  legislation?: string
  mergedPostesIds?: number[][]
  signal?: AbortSignal
}

export const postCarences = async ({
  id,
  startDate,
  endDate,
  postesIds,
  openDaysCodes,
  legislation,
  mergedPostesIds,
  signal,
}: CarenceParams) => {
  try {
    let params = `etablissement_id=${id}`

    if (startDate) params += `&start_date=${startDate}`
    if (endDate) params += `&end_date=${endDate}`
    if (legislation) params += `&legislation_carence=${legislation}`
    params = addArrayParams(params, postesIds, "poste_ids")
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")

    let body = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = { merged_poste_ids: mergedPostesIds }

    let config = {}
    if (signal) config = { signal }

    const response = await api.post(`/carences/?${params}`, body, config)
    return (response.data.data as Infractions) ?? handleUndefinedData("/effectifs")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getCarencesIdcc = async () => {
  try {
    const response = await api.get(`/carences/idcc`)
    return response.data.data as Record<string, IDCC>
  } catch (err) {
    return handleEndpointError(err)
  }
}
