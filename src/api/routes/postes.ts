import api from "../config"
import { EtablissementPoste } from "../types"
import { handleEndpointError, handleUndefinedData } from "../../helpers/errors"

export const getPostes = async (id: number) => {
  try {
    const response = await api.get(`/postes/?etablissement_id=${id}`)
    return (
      (response.data?.data as EtablissementPoste[]) ?? handleUndefinedData("/postes/")
    )
  } catch (err) {
    return handleEndpointError(err)
  }
}

// get only postes with contracts in cdi or cdd for ATA (accroissement temporaire d'activité)
export const getPostesAta = async (id: number) => {
  try {
    const response = await api.get(`/postes/ata?etablissement_id=${id}`)
    return (
      (response.data?.data as EtablissementPoste[]) ?? handleUndefinedData("/postes/ata")
    )
  } catch (err) {
    return handleEndpointError(err)
  }
}
