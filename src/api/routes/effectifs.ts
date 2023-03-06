import api from "../config"
import { AxiosError } from "axios"
import { Effectif, EffectifUnit, LastEffectif, ResponseError } from "../types"

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

    return response.data?.data as Effectif[]
  } catch (err) {
    let status
    if (err instanceof AxiosError) status = err?.request?.status
    let message = String(err)
    if (err instanceof AxiosError && status && String(status).startsWith("4")) {
      message = err?.response?.data[0]?.message
    }
    return Promise.reject({
      status,
      message,
    } as ResponseError)
  }
}

export const getEffectifsLast = async (id: number) => {
  try {
    const response = await api.get(`/effectifs/last?etablissement_id=${id}`)
    return response.data?.data as LastEffectif
  } catch (err) {
    let status
    if (err instanceof AxiosError) status = err?.request?.status
    let message = String(err)
    if (err instanceof AxiosError && status && String(status).startsWith("4")) {
      message = err?.response?.data[0]?.message
    }

    return Promise.reject({
      status,
      message,
    } as ResponseError)
  }
}
