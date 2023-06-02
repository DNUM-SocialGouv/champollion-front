import { handleEndpointError } from "../../helpers/errors"
import api from "../config"

export const getCgu = async () => {
  try {
    const response = await api.get(`/juridiques/cgu`)
    return response.data as string
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getPersonalData = async () => {
  try {
    const response = await api.get(`/juridiques/personal_data`)
    return response.data as string
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getTerms = async () => {
  try {
    const response = await api.get(`/juridiques/terms`)
    return response.data as string
  } catch (err) {
    return handleEndpointError(err)
  }
}
