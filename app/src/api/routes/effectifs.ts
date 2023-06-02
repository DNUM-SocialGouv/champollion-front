import api from "../config"
import { Effectif, EffectifUnit, LastEffectif } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { motivesCodeDict } from "../../helpers/contrats"

type EffectifsParams = {
  id: number
  startMonth: string
  endMonth: string
  unit: EffectifUnit
  motives?: number[]
  postes?: string[]
}

export const getEffectifs = async ({
  id,
  startMonth,
  endMonth,
  unit,
  motives,
  postes,
}: EffectifsParams) => {
  try {
    let params = `etablissement_id=${id}&start_date=${startMonth}&end_date=${endMonth}&unit=${unit}`

    if (motives && motives.length > 0) {
      const motivesCodes = motives
        .map((motive) => motivesCodeDict[motive])
        .filter(Boolean)
        .flat()
      const motivesParam = motivesCodes
        .map((motive) => `motifs_recours=${motive}`)
        .join("&")
      params += `&${motivesParam}`
    }

    if (postes && postes.length > 0) {
      const postesParam = postes.map((poste) => `postes=${poste}`).join("&")
      params += `&${postesParam}`
    }
    const response = await api.get(`/effectifs/?${params}`)
    return (response.data.data as Effectif[]) ?? handleUndefinedData("/effectifs")
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
