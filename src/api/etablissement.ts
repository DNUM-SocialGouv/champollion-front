import api from "./config"
import { AxiosError } from "axios"
import { EtablissementType, ResponseError } from "./types"

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
