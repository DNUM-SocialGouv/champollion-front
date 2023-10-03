import api from "../config"
import type { IDCC, Infractions, MetaCarences, ModificationsBody } from "../types"
import type { CorrectedDates } from "../../helpers/contrats"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { addArrayParams } from "../../helpers/format"

type CarenceParams = {
  id: number
  startDate?: string
  endDate?: string
  postesIds?: number[]
  openDaysCodes?: string[]
  legislation?: string
  correctedDates?: CorrectedDates
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
  correctedDates,
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

    const body: ModificationsBody = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

    let config = {}
    if (signal) config = { signal }

    const response = await api.post(`/carences/?${params}`, body, config)
    const infractions = response.data.data as Infractions
    const meta = response.data.meta as MetaCarences

    if (infractions && meta) return { infractions, meta }
    else handleUndefinedData("/carences")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getCarencesIdcc = async () => {
  try {
    const response = await api.get(`/carences/idcc`)
    return (
      (response.data.data as Record<string, IDCC>) ??
      handleUndefinedData("/carences/idcc")
    )
  } catch (err) {
    return handleEndpointError(err)
  }
}
