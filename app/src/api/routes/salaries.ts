import api from "../config"
import { Salarie } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"

export const getSalaries = async (id: number) => {
  try {
    const response = await api.get(`/salaries/?etablissement_id=${id}`)

    return (response.data?.data as Salarie[]) ?? handleUndefinedData("/salaries/")
  } catch (err) {
    return handleEndpointError(err)
  }
}
