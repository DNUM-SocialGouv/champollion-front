import api from "../config"
import type { ExternalLink } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"

export const getCgu = async () => {
  try {
    const response = await api.get(`/contents/cgu`)
    return response.data as string
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getPersonalData = async () => {
  try {
    const response = await api.get(`/contents/personal_data`)
    return response.data as string
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getLegalNotice = async () => {
  try {
    const response = await api.get(`/contents/legal_notice`)
    return response.data as string
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getFaq = async () => {
  try {
    const response = await api.get(`/contents/faq`)
    return response.data as string
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getExternalLinks = async () => {
  try {
    const response = await api.get(`/contents/external_links`)
    return (
      (response.data.data as ExternalLink[]) ??
      handleUndefinedData("/contents/external_links")
    )
  } catch (err) {
    return handleEndpointError(err)
  }
}
