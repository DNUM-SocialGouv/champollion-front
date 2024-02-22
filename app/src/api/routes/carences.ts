import api from "../config"
import type { FileExtension, IDCC, Infractions, MetaCarences, ModificationsBody } from "../types"
import type { CorrectedDates } from "../../helpers/contrats"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { PublicHolidaysClosed, addArrayParams } from "../../helpers/format"

type CarenceParams = {
  id: number
  startDate?: string
  endDate?: string
  postesIds?: number[]
  openDaysCodes?: string[]
  openDates?: string[]
  closedDates?: string[]
  closedPublicHolidays?: PublicHolidaysClosed
  legislation?: string
  correctedDates?: CorrectedDates
  mergedPostesIds?: number[][]
  signal?: AbortSignal
}
type ExportParams = CarenceParams & {
  isEtu?: boolean
  format: FileExtension
  companyName: string
  siret: string
}

export const postCarences = async ({
  id,
  startDate,
  endDate,
  postesIds,
  openDaysCodes,
  openDates,
  closedDates,
  closedPublicHolidays,
  legislation,
  correctedDates,
  mergedPostesIds,
  signal,
}: CarenceParams) => {
  try {
    let params = `etablissement_id=${id}`

    if (startDate) params += `&start_date=${startDate}`
    if (endDate) params += `&end_date=${endDate}`
    if (legislation) params += `&legislation_carence=${legislation}`
    params = addArrayParams(params, postesIds, "poste_ids")
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")
    params = addArrayParams(params, openDates, "jour_ouverture_dates")
    params = addArrayParams(params, closedDates, "jour_fermeture_dates")
    if (closedPublicHolidays === "no") params += `&jour_ferie_bool=${false}`

    const body: ModificationsBody = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

    let config = {}
    if (signal) config = { signal }

    const response = await api.post(`/carences/?${params}`, body, config)
    const infractions = response.data.data as Infractions
    const meta = response.data.meta as MetaCarences

    if (infractions && meta) return { infractions, meta }
    else handleUndefinedData("/carences")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getCarencesIdcc = async () => {
  try {
    const response = await api.get(`/carences/idcc`)
    return (
      (response.data.data as Record<string, IDCC>) ??
      handleUndefinedData("/carences/idcc")
    )
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const postCarencesExport = async ({
  id, 
  startDate, 
  endDate, 
  postesIds, 
  format = "ods", 
  isEtu = true, 
  correctedDates, 
  mergedPostesIds, 
  siret, 
  companyName, 
  openDaysCodes,
  closedDates,
  closedPublicHolidays,
  legislation,
  openDates,
}: ExportParams) => {
  try {
    let params = `etu=${isEtu}&format=${format}&etablissement_id=${id}`

    
    const fileName = `Carence_${companyName.replace(" ", "_")}_${siret}.${format}`
    
    
    params = addArrayParams(params, postesIds, "poste_ids")
    if (startDate) params += `&start_date=${startDate}`
    if (endDate) params += `&end_date=${endDate}`
    params = addArrayParams(params, openDaysCodes, "jour_ouverture_ids")
    params = addArrayParams(params, openDates, "jour_ouverture_dates")
    params = addArrayParams(params, closedDates, "jour_fermeture_dates")
    if (closedPublicHolidays === "no") params += `&jour_ferie_bool=${false}`
    if (legislation) params += `&legislation_carence=${legislation}`

    const body: ModificationsBody = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body.merged_poste_ids = mergedPostesIds
    if (correctedDates) body.corrected_dates = correctedDates

    const response = await api.post(`/carences/export?${params}`, body, {
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

