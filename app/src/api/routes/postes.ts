import api from "../config"
import type { CountMetadata, EtablissementPoste, SuggestedMergedPoste } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"

export const postPostes = async (id: number, mergedPostesIds?: number[][]) => {
  try {
    let body = {}

    if (mergedPostesIds && mergedPostesIds?.length > 0)
      body = Object.assign(body, { merged_poste_ids: mergedPostesIds })

    const response = await api.post(`/postes/?etablissement_id=${id}`, body)

    return (
      (response.data?.data as EtablissementPoste[]) ?? handleUndefinedData("/postes/")
    )
  } catch (err) {
    return handleEndpointError(err)
  }
}

export const getPostesMerges = async (id: number) => {
  try {
    const response = await api.get(`/postes/merges?etablissement_id=${id}`)
    const postes = response.data?.data as SuggestedMergedPoste[][]
    const meta = response.data?.meta as CountMetadata

    if (postes && meta) return { postes, meta }
    else return handleUndefinedData("/postes/merges")
  } catch (err) {
    return handleEndpointError(err)
  }
}
