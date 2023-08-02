import api from "../config"
import type { EtablissementPoste } from "../types"
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
