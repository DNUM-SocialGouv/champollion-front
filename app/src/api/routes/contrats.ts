import api from "../config"
import type {
  EttContrat,
  EtuContrat,
  FileExtension,
  ModificationsBody,
  PaginationMetaData,
} from "../types"
import type { CorrectedDates } from "../../helpers/contrats"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { addMotivesEndpointParam } from "../../helpers/filters"
import { addArrayParams } from "../../helpers/format"

type Common = {
  correctedDates?: CorrectedDates
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
  format: FileExtension
  companyName: string
  siret: string
}

export const postContratsEtu = async ({
  id,
  startDate,
  endDate,
  motives,
  natures,
  postesIds,
  employeesIds,
  correctedDates,
  mergedPostesIds,
  page = 1,
  per = 20,
}: ContratsParams) => {
  try {
    let params = `etablissement_id=${id}`

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`

    params = addMotivesEndpointParam(params, motives)
    params = addArrayParams(params, natures, "nature_contrat_ids")
    params = addArrayParams(params, postesIds, "poste_ids")
    params = addArrayParams(params, employeesIds, "salarie_ids")

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

    const body: ModificationsBody = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

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
  postesIds,
  employeesIds,
  motives,
  natures,
  page = 1,
  per = 20,
}: ContratsParams) => {
  try {
    let params = `etablissement_id=${id}`

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`

    params = addArrayParams(params, postesIds, "poste_ids")
    params = addMotivesEndpointParam(params, motives)
    params = addArrayParams(params, employeesIds, "salarie_ids")
    params = addArrayParams(params, natures, "nature_contrat_ids")

    if (page) params += `&page=${page}`
    if (per) params += `&per_page=${per}`

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
  format = "ods",
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
    let params = `etablissement_id=${id}&etu=${isEtu}&format=${format}`

    const fileName = `Contrats_${companyName.replace(" ", "_")}_${siret}.${format}`

    if (endDate) params += `&end_date=${endDate}`
    if (startDate) params += `&start_date=${startDate}`

    params = addMotivesEndpointParam(params, motives)
    params = addArrayParams(params, natures, "nature_contrat_ids")
    params = addArrayParams(params, postesIds, "poste_ids")
    params = addArrayParams(params, employeesIds, "salarie_ids")

    const body: ModificationsBody = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

    const response = await api.post(`/contrats/export?${params}`, body, {
      responseType: "blob",
    })

    const odsBlob = new Blob([response.data], {
      type: response.headers["content-type"],
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
