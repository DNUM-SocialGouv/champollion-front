import { handleEndpointError } from "../../helpers/errors"
import api from "../config"

export const getFaq = async () => {
  try {
    const response = await api.get(`/faqs/`)
    return response.data as string
  } catch (err) {
    return handleEndpointError(err)
  }
}
