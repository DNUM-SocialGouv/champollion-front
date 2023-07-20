import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { addArrayParams } from "../../helpers/format"
import api from "../config"
import { Infractions } from "../types"

type CarenceParams = {
  id: number
  startDate?: string
  endDate?: string
  postesIds?: number[]
  openDaysCodes?: string[]
  legislation?: string
  mergedPostesIds?: number[][]
}

export const postCarences = async ({
  id,
  startDate,
  endDate,
  postesIds,
  openDaysCodes,
  legislation,
  mergedPostesIds,
}: CarenceParams) => {
  try {
    let params = `etablissement_id=${id}`

    if (startDate) params += `&start_date=${startDate}`
    if (endDate) params += `&end_date=${endDate}`
    if (legislation) params += `&legislation_carence=${legislation}`
    params = addArrayParams(params, postesIds, "poste_ids")
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")

    let body = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = Object.assign(body, { merged_poste_ids: mergedPostesIds })

    const response = await api.post(`/carences/?${params}`, body)
    return (response.data.data as Infractions) ?? handleUndefinedData("/effectifs")
  } catch (err) {
    return handleEndpointError(err)
  }
}
