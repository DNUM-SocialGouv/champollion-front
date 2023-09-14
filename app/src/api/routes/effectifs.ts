import api from "../config"
import type {
  Effectif,
  EffectifUnit,
  IndicatorMetaData,
  LastEffectif,
  ModificationsBody,
} from "../types"
import type { CorrectedDates } from "../../helpers/contrats"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { motivesCodeDict } from "../../helpers/filters"

type EffectifsParams = {
  id: number
  startDate: string
  endDate: string
  unit: EffectifUnit
  motives?: number[]
  openDaysCodes?: string[]
  postesIds?: number[]
  correctedDates?: CorrectedDates
  mergedPostesIds?: number[][]
  signal?: AbortSignal
}

export const postEffectifs = async ({
  id,
  startDate,
  endDate,
  unit,
  motives,
  postesIds,
  openDaysCodes,
  correctedDates,
  mergedPostesIds,
  signal,
}: EffectifsParams) => {
  try {
    let params = `etablissement_id=${id}&start_date=${startDate}&end_date=${endDate}&unit=${unit}`

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

    if (openDaysCodes && openDaysCodes.length > 0) {
      const openDaysParam = openDaysCodes
        .map((day) => `jour_ouverture_ids=${day}`)
        .join("&")
      params += `&${openDaysParam}`
    }
    if (postesIds && postesIds.length > 0) {
      const postesParam = postesIds.map((poste) => `poste_ids=${poste}`).join("&")
      params += `&${postesParam}`
    }

    const body: ModificationsBody = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

    let config = {}
    if (signal) config = { signal }

    const response = await api.post(`/effectifs/?${params}`, body, config)
    const effectifs = response.data?.data as Effectif[]
    const meta = response.data?.meta as IndicatorMetaData

    if (effectifs && meta) return { effectifs, meta }
    else return handleUndefinedData("/effectifs/")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const postEffectifsLast = async (id: number, correctedDates?: CorrectedDates) => {
  try {
    const body: ModificationsBody = {}
    if (correctedDates) body.corrected_dates = correctedDates

    const response = await api.post(`/effectifs/last?etablissement_id=${id}`, body)
    return (response.data?.data as LastEffectif) ?? handleUndefinedData("/effectifs/last")
  } catch (err) {
    return handleEndpointError(err)
  }
}
