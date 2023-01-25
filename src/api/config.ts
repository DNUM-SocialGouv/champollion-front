/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosInstance, AxiosResponse } from "axios"
import { keysToCamel } from "../helpers/format"

const baseURL: string = import.meta.env.VITE_API_BASE_URL as string

const api = axios.create({
  baseURL,
  timeout: 3000,
}) as AxiosInstance

api.interceptors.response.use(
  (response) =>
    ({
      headers: response.headers,
      data: keysToCamel(response.data),
    } as AxiosResponse<any, any>),
  (error) => {
    return Promise.reject(error)
  }
)

export default api
