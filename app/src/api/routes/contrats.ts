import api from "../config"
import type { EttContrat, EtuContrat, PaginationMetaData } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { type CorrectedDates, motivesCodeDict } from "../../helpers/contrats"
import { addArrayParams } from "../../helpers/format"

type Common = {
  employeesIds?: number[]
  endDate?: string
  id: number
  mergedPostesIds?: number[][]
  motives?: number[]
  natures?: string[]
  page?: number
  per?: number
  postesIds?: number[]
  startDate?: string
}
type ContratsParams = Common & {
  page?: number
  per?: number
}

type ExportParams = Common & {
  isEtu?: boolean
  companyName: string
  correctedDates?: CorrectedDates
  siret: string
}

type Body = {
  corrected_dates?: CorrectedDates
  merged_poste_ids?: number[][]
}

export const postContratsEtu = async ({
  id,
  startDate,
  endDate,
  motives,
  natures,
  postesIds,
  employeesIds,
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

    params = addArrayParams(params, natures, "nature_contrat_ids")
    params = addArrayParams(params, postesIds, "poste_ids")
    params = addArrayParams(params, employeesIds, "salarie_ids")

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

    let body = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = Object.assign(body, { merged_poste_ids: mergedPostesIds })

    const response = await api.post(`/contrats/etu?${params}`, body)
    const contrats = response.data?.data as EtuContrat[]
    const meta = response.data?.meta as PaginationMetaData

    if (contrats && meta) {
      return {
        contrats,
        meta,
      }
    } else return handleUndefinedData("/contrats/etu")
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
    const meta = response.data?.meta as PaginationMetaData

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

export const postContratsExport = async ({
  companyName,
  correctedDates,
  employeesIds,
  endDate,
  id,
  isEtu = true,
  mergedPostesIds,
  motives,
  natures,
  postesIds,
  siret,
  startDate,
}: ExportParams) => {
  try {
    let params = `etablissement_id=${id}&etu=${isEtu}`

    const fileName = "Contrats_" + companyName.replace(" ", "_") + "_" + siret + ".ods"

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`

    if (motives && motives.length > 0) {
      const motivesCodes = motives
        .map((motive) => motivesCodeDict[motive])
        .filter(Boolean)
        .flat()
      params = addArrayParams(params, motivesCodes, "motif_recours_ids")
    }

    params = addArrayParams(params, natures, "nature_contrat_ids")
    params = addArrayParams(params, postesIds, "poste_ids")
    params = addArrayParams(params, employeesIds, "salarie_ids")

    const body: Body = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

    const response = await api.post(`/contrats/export?${params}`, body, {
      responseType: "blob",
    })

    const odsBlob = new Blob([response.data], {
      type: "application/vnd.oasis.opendocument.spreadsheet",
    })

    const tempUrl = URL.createObjectURL(odsBlob)

    const downloadLink = document.createElement("a")
    downloadLink.href = tempUrl
    downloadLink.download = fileName
    downloadLink.click()

    URL.revokeObjectURL(tempUrl)
  } catch (err) {
    return handleEndpointError(err)
  }
}
