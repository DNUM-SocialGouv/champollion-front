import { type LoaderFunctionArgs, redirect } from "react-router-dom"

import ls from "localstorage-slim"
import { getEtablissementsInfo } from "../../api"
import { errorWording, isAppError } from "../../helpers/errors"

import { EtablissementType } from "../../api/types"

export async function EtablissementLoader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const etabType = ls.get("establishmentType") as EtablissementType
  if (isAppError(etabType)) {
    const responseParams: ResponseInit = {
      statusText: etabType.messageFr ?? errorWording.etab,
    }
    if (etabType.status) responseParams.status = etabType.status
    if (etabType.status == 404) responseParams.statusText = "SIRET introuvable."
    throw new Response("", responseParams)
  }

  const idEtab = etabType.id
  const etabInformation = await getEtablissementsInfo(idEtab)

  if (isAppError(etabInformation)) {
    const responseParams: ResponseInit = {
      statusText: etabInformation.messageFr ?? errorWording.etab,
    }
    if (etabInformation.status) responseParams.status = etabInformation.status
    if (etabInformation.status == 404) responseParams.statusText = "ID introuvable."
    throw new Response("", responseParams)
  }

  const isOpen = etabInformation.ouvert

  if (etabType.ett) {
    return redirect(`/ett/${siret}`)
  }

  return {
    etabId: etabType.id,
    raisonSociale: etabType.raisonSociale,
    siret,
    isOpen,
  }
}
