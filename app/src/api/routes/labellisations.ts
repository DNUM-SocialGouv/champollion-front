import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"
import api from "../config"
import { EtablissementPoste } from "../types"

export const getLabellisations = async () => {
  try {
    const response = await api.get(`/labellisations/`)
    const data = response.data.data as EtablissementPoste[]
    const meta = response.data?.meta as { etablissementId: number }

    if (data && meta) {
      return {
        data,
        meta,
      }
    } else return handleUndefinedData("/labellisations/")
  } catch (err) {
    return handleEndpointError(err)
  }
}

type LabellisationParams = {
  etablissementId: number
  mergedPostesIds: number[][]
  unclearMergedPostesIds?: number[][]
}

export const postLabellisations = async ({
  etablissementId,
  mergedPostesIds,
  unclearMergedPostesIds,
}: LabellisationParams) => {
  try {
    const response = await api.post(
      `/labellisations/?etablissement_id=${etablissementId}`,
      {
        merged_poste_ids: mergedPostesIds,
        unclear_merged_poste_ids: unclearMergedPostesIds,
      }
    )
    return response.data as string
  } catch (err) {
    return handleEndpointError(err)
  }
}
