/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios"
import { AppError, defaultAxiosError, getErrorMessage } from "../helpers/errors"
import { keysToCamel } from "../helpers/format"

const baseURL: string = import.meta.env.VITE_API_BASE_URL as string
const isDevMode = import.meta.env.DEV

const api = axios.create({
  baseURL,
  // timeout: 5000, //todo set another tieout or remove altogether?
}) as AxiosInstance

api.interceptors.response.use(
  (response) =>
    ({
      headers: response.headers,
      data: keysToCamel(response.data),
    } as AxiosResponse<any, any>),
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
