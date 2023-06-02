import api from "../config"
import { EttContrat, EtuContrat, MetaData } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { motivesCodeDict } from "../../helpers/contrats"

type ContratsParams = {
  id: number
  startMonth: string
  endMonth: string
  motives?: number[]
  natures?: string[]
  postes?: string[]
  page?: number
  per?: number
  mergedPostes?: string[][]
}

export const getContratsEtu = async ({
  id,
  startMonth,
  endMonth,
  motives,
  natures,
  postes,
  page,
  per,
}: ContratsParams) => {
  try {
    let params = `etablissement_id=${id}&start_date=${startMonth}&end_date=${endMonth}`

    if (motives && motives.length > 0) {
      const motivesCodes = motives
        .map((motive) => motivesCodeDict[motive])
        .filter(Boolean)
        .flat()
      const motivesParam = motivesCodes
        .map((motive) => `motifs_recours=${motive}`)
        .join("&")
      params += `&${motivesParam}`
    }

    if (natures && natures.length > 0) {
      const naturesParam = natures.map((nature) => `natures_contrat=${nature}`).join("&")
      params += `&${naturesParam}`
    }

    if (postes && postes.length > 0) {
      const postesParam = postes.map((poste) => `postes=${poste}`).join("&")
      params += `&${postesParam}`
    }

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

    const response = await api.get(`/contrats/etu?${params}`)
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
  startMonth,
  endMonth,
  postes,
  page,
  per,
}: ContratsParams) => {
  try {
    let params = `etablissement_id=${id}&start_date=${startMonth}&end_date=${endMonth}`

    if (postes && postes.length > 0) {
      const postesParam = postes.map((poste) => `postes=${poste}`).join("&")
      params += `&${postesParam}`
    }

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

    const response = await api.get(`/contrats/ett?${params}`)
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

export const postContratsAta = async ({
  id,
  startMonth,
  endMonth,
  postes,
  page,
  per,
  mergedPostes = [],
}: ContratsParams) => {
  try {
    let params = `etablissement_id=${id}&start_date=${startMonth}&end_date=${endMonth}`

    if (postes && postes.length > 0) {
      const postesParam = postes.map((poste) => `postes=${poste}`).join("&")
      params += `&${postesParam}`
    }

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

    const response = await api.post(`/contrats/ata?${params}`, {
      merged_postes: mergedPostes,
    })
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
