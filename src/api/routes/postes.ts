import api from "../config"
import { AxiosError } from "axios"
import { EtablissementPoste, ResponseError } from "../types"

export const getPostes = async (id: number) => {
  try {
    const response = await api.get(`/postes/?etablissement_id=${id}`)
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
