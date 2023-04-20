import api from "../config"
import { Effectif, EffectifUnit, LastEffectif } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"

type EffectifsParams = {
  id: number
  startMonth: string
  endMonth: string
  unit: EffectifUnit
  postes?: string[]
}

export const getEffectifs = async ({
  id,
  startMonth,
  endMonth,
  unit,
  postes,
}: EffectifsParams) => {
  try {
    let params = `etablissement_id=${id}&start_date=${startMonth}&end_date=${endMonth}&unit=${unit}`

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
