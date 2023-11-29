import api from "../config"
import type {
  Effectif,
  EffectifUnit,
  IndicatorMetaData,
  LastEffectif,
  ModificationsBody,
} from "../types"
import type { CorrectedDates } from "../../helpers/contrats"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import { addMotivesEndpointParam } from "../../helpers/filters"
import { PublicHolidaysClosed, addArrayParams } from "../../helpers/format"

type EffectifsParams = {
  id: number
  startDate: string
  endDate: string
  unit: EffectifUnit
  motives?: number[]
  openDaysCodes?: string[]
  openDates?: string[]
  closedDates?: string[]
  closedPublicHolidays?: PublicHolidaysClosed
  postesIds?: number[]
  correctedDates?: CorrectedDates
  mergedPostesIds?: number[][]
  signal?: AbortSignal
}

export const postEffectifs = async ({
  id,
  startDate,
  endDate,
  unit,
  motives,
  postesIds,
  openDaysCodes,
  openDates,
  closedDates,
  closedPublicHolidays,
  correctedDates,
  mergedPostesIds,
  signal,
}: EffectifsParams) => {
  try {
    let params = `etablissement_id=${id}&start_date=${startDate}&end_date=${endDate}&unit=${unit}`

    params = addMotivesEndpointParam(params, motives)
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

    const response = await api.post(`/effectifs/?${params}`, body, config)
    const effectifs = response.data?.data as Effectif[]
    const meta = response.data?.meta as IndicatorMetaData

    if (effectifs && meta) return { effectifs, meta }
    else return handleUndefinedData("/effectifs/")
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const postEffectifsLast = async (id: number, correctedDates?: CorrectedDates) => {
  try {
    const body: ModificationsBody = {}
    if (correctedDates) body.corrected_dates = correctedDates

    const response = await api.post(`/effectifs/last?etablissement_id=${id}`, body)
    return (response.data?.data as LastEffectif) ?? handleUndefinedData("/effectifs/last")
  } catch (err) {
    return handleEndpointError(err)
  }
}
