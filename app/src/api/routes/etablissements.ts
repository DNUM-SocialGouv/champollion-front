import api from "../config"
import type {
  EtablissementDefaultPeriod,
  EtablissementInfo,
  EtablissementType,
} from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"

export const getEtablissementsType = async (input: string) => {
  try {
    const response = await api.get(`/etablissements/type?siret=${input}`)
    return (
      (response.data?.data as EtablissementType) ??
      handleUndefinedData("/etablissements/type")
    )
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getEtablissementsInfo = async (id: string | number) => {
  try {
    const response = await api.get(`/etablissements/info?etablissement_id=${id}`)
    return (
      (response.data?.data as EtablissementInfo) ??
      handleUndefinedData("/etablissements/info")
    )
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getEtablissementsDefaultPeriod = async (id: string | number) => {
  try {
    const response = await api.get(
      `/etablissements/default_period?etablissement_id=${id}`
    )
    return (
      (response.data?.data as EtablissementDefaultPeriod) ??
      handleUndefinedData("/etablissements/default_period")
    )
  } catch (err) {
    return handleEndpointError(err)
  }
}
