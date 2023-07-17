import api from "../config"
import { EttContrat, EtuContrat, MetaData } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { motivesCodeDict } from "../../helpers/contrats"

type ContratsParams = {
  id: number
  startDate?: string
  endDate?: string
  motives?: number[]
  natures?: string[]
  postesIds?: number[]
  page?: number
  per?: number
  mergedPostesIds?: number[][]
}

export const postContratsEtu = async ({
  id,
  startDate,
  endDate,
  motives,
  natures,
  postesIds,
  mergedPostesIds,
  page = 1,
  per = 20,
}: ContratsParams) => {
  try {
    let params = `etablissement_id=${id}`

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`

    if (motives && motives.length > 0) {
      const motivesCodes = motives
        .map((motive) => motivesCodeDict[motive])
        .filter(Boolean)
        .flat()
      const motivesParam = motivesCodes
        .map((motive) => `motif_recours_ids=${motive}`)
        .join("&")
      params += `&${motivesParam}`
    }

    if (natures && natures.length > 0) {
      const naturesParam = natures
        .map((nature) => `nature_contrat_ids=${nature}`)
        .join("&")
      params += `&${naturesParam}`
    }

    if (postesIds && postesIds.length > 0) {
      const postesParam = postesIds.map((poste) => `poste_ids=${poste}`).join("&")
      params += `&${postesParam}`
    }

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

    let body = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = Object.assign(body, { merged_poste_ids: mergedPostesIds })

    const response = await api.post(`/contrats/etu?${params}`, body)
    const contrats = response.data?.data as EtuContrat[]
    const meta = response.data?.meta as MetaData

    if (contrats && meta) {
      return {
        contrats,
        meta,
      }
    } else return handleUndefinedData("/contrats/ett")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getContratsEtt = async ({
  id,
  startDate,
  endDate,
  postesIds: postes,
  page = 1,
  per = 20,
}: ContratsParams) => {
  try {
    let params = `etablissement_id=${id}`

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`
    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`
    if (postes && postes.length > 0) {
      const postesParam = postes.map((poste) => `poste_ids=${poste}`).join("&")
      params += `&${postesParam}`
    }

    const response = await api.post(`/contrats/ett?${params}`)
    const contrats = response.data?.data as EttContrat[]
    const meta = response.data?.meta as MetaData

    if (contrats && meta) {
      return {
        contrats,
        meta,
      }
    } else return handleUndefinedData("/contrats/ett")
  } catch (err) {
    return handleEndpointError(err)
  }
}
