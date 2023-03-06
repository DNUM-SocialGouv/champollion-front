import api from "../config"
import { AxiosError } from "axios"
import { EtablissementInfo, EtablissementType, ResponseError } from "../types"

export const getEtablissementsType = async (input: string) => {
  try {
    const response = await api.get(`/etablissements/type?siret=${input}`)
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

export const getEtablissementsInfo = async (id: string | number) => {
  try {
    const response = await api.get(`/etablissements/info?etablissement_id=${id}`)
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
