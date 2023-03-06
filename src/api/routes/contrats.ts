import api from "../config"
import { AxiosError } from "axios"
import { EttContrat, EtuContrat, MetaData, ResponseError } from "../types"

type EtabContratsListParams = {
  id: number
  startMonth: string
  endMonth: string
  postes?: string[]
  page?: number
  per?: number
}

export const getContratsEtu = async ({
  id,
  startMonth,
  endMonth,
  postes,
  page,
  per,
}: EtabContratsListParams) => {
  try {
    let params = `etablissement_id=${id}&start_date=${startMonth}&end_date=${endMonth}`

    if (postes && postes.length > 0) {
      const postesParam = postes.map((poste) => `postes=${poste}`).join("&")
      params += `&${postesParam}`
    }

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

    const response = await api.get(`/contrats/etu?${params}`)
    const data = response.data?.data as EtuContrat[]
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

export const getContratsEtt = async ({
  id,
  startMonth,
  endMonth,
  postes,
  page,
  per,
}: EtabContratsListParams) => {
  try {
    let params = `etablissement_id=${id}&start_date=${startMonth}&end_date=${endMonth}`

    if (postes && postes.length > 0) {
      const postesParam = postes.map((poste) => `postes=${poste}`).join("&")
      params += `&${postesParam}`
    }

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

    const response = await api.get(`/contrats/ett?${params}`)
    const data = response.data?.data as EttContrat[]
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
    if (message === "data not found") return { data: {}, meta: {} }
    return Promise.reject({
      status,
      message,
    } as ResponseError)
  }
}
