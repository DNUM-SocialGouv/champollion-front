import axios from "axios"
import type { AxiosError, AxiosInstance, AxiosResponse } from "axios"
import { type AppError, defaultAxiosError, getErrorMessage } from "../helpers/errors"
import { keysToCamel } from "../helpers/format"

const baseURL: string = import.meta.env.VITE_API_BASE_URL as string
const isDevMode = import.meta.env.DEV

const api = axios.create({
  baseURL,
  // timeout: 5000, //todo set another timeout or remove altogether?
}) as AxiosInstance

api.interceptors.response.use(
  (response) =>
    ({
      ...response,
      data: response.data instanceof Blob ? response.data : keysToCamel(response.data),
    } as AxiosResponse<unknown, unknown>),
  (error: Error | AxiosError) => {
    const err: AppError = { ...defaultAxiosError }

    if (axios.isAxiosError(error)) {
      if (error.code) err.code = error.code
      if (error.message) err.message = error.message
      if (error.response) {
        if (error.response.status) err.status = error.response.status
        const { message, messageFr } = getErrorMessage(error.response.data[0])
        err.message = message
        err.messageFr = messageFr
      } else if (error.request) {
        if (error.request?.status) err.status = error.request.status

        if (!error.code) err.code = "ENO_RESPONSE"
      } else {
        if (!error.code) err.code = "ENO_REQUEST"
      }
      if (!err.status) err.status = 503
    }
    if (isDevMode) console.warn("Axios error interceptor: ", error.message, err)
    return Promise.reject(err)
  }
)

export default api
