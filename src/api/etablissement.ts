import api from "./config"
import { AxiosError } from "axios"
import {
  Effectif,
  EffectifUnit,
  EtablissementContrat,
  EtablissementInfo,
  EtablissementPoste,
  EtablissementType,
  MetaData,
  ResponseError,
} from "./types"

export const getEtablissementType = async (input: string) => {
  try {
    const response = await api.get(`/get-etablissement-type?siret=${input}`)
    return response.data?.data as EtablissementType
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

export const getEtablissementInfo = async (id: string | number) => {
  try {
    const response = await api.get(`/get-etablissement-infos?etablissement_id=${id}`)
    return response.data?.data as EtablissementInfo
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

export const getEtablissementPostesList = async (id: number) => {
  try {
    const response = await api.get(
      `/get-etablissement-postes-list?etablissement_id=${id}`
    )
    return response.data?.data as EtablissementPoste[]
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

type EtablissementContratsListParams = {
  id: number
  startMonth: string
  endMonth: string
  postes?: string[]
  page?: number
  per?: number
}

export const getEtablissementContratsList = async ({
  id,
  startMonth,
  endMonth,
  postes,
  page,
  per,
}: EtablissementContratsListParams) => {
  try {
    let params = `etablissement_id=${id}&date_begin=${startMonth}&date_end=${endMonth}`

    if (postes && postes.length > 0) {
      const postesParam = postes.map((poste) => `postes=${poste}`).join("&")
      params += `&${postesParam}`
    }

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

    const response = await api.get(`/get-etablissement-contrats-list?${params}`)
    const data = response.data?.data as EtablissementContrat[]
    const meta = response.data?.meta as MetaData
    return {
      data,
      meta,
    }
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
    let params = `etablissement_id=${id}&start_month=${startMonth}&end_month=${endMonth}&unit=${unit}`

    if (postes && postes.length > 0) {
      const postesParam = postes.map((poste) => `postes=${poste}`).join("&")
      params += `&${postesParam}`
    }

    const response = await api.get(`/get-effectifs?${params}`)

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
