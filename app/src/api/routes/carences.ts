import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
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

    if (postesIds && postesIds.length > 0) {
      const postesParam = postesIds.map((poste) => `poste_ids=${poste}`).join("&")
      params += `&${postesParam}`
    }
    if (openDaysCodes && openDaysCodes.length > 0) {
      const openDaysParam = openDaysCodes
        .map((day) => `jour_ouverture_ids=${day}`)
        .join("&")
      params += `&${openDaysParam}`
    }

    if (startDate) params += `&start_date=${startDate}`
    if (endDate) params += `&end_date=${endDate}`
    if (legislation) params += `&legistation_carence=${legislation}`

    let body = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = Object.assign(body, { merged_poste_ids: mergedPostesIds })

    const response = await api.post(`/carences/?${params}`, body)
    return (response.data.data as Infractions) ?? handleUndefinedData("/effectifs")
  } catch (err) {
    return handleEndpointError(err)
  }
}
