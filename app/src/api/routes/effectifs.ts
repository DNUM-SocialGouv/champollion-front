import api from "../config"
import type { Effectif, EffectifUnit, IndicatorMetaData, LastEffectif } from "../types"
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
  mergedPostesIds?: number[][]
}

export const postEffectifs = async ({
  id,
  startDate,
  endDate,
  unit,
  motives,
  postesIds,
  openDaysCodes,
  mergedPostesIds,
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

    let body = {}
    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = Object.assign(body, { merged_poste_ids: mergedPostesIds })

    const response = await api.post(`/effectifs/?${params}`, body)
    const effectifs = response.data?.data as Effectif[]
    const meta = response.data?.meta as IndicatorMetaData

    if (effectifs && meta) {
      return {
        effectifs,
        meta,
      }
    } else return handleUndefinedData("/effectifs/")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getEffectifsLast = async (id: number) => {
  try {
    const response = await api.get(`/effectifs/last?etablissement_id=${id}`)
    return (response.data?.data as LastEffectif) ?? handleUndefinedData("/effectifs/last")
  } catch (err) {
    return handleEndpointError(err)
  }
}
