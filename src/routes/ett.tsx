import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom"
import {
  getEtablissementInfo,
  getEtablissementType,
  getLastEffectif,
} from "../api/etablissement"
import { EtablissementInfo, LastEffectif } from "../api/types"

import EtabBanner from "../components/EtabBanner"
import EtabInfo from "../components/EtabInfo"

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""

  const { id: etabId, ett, raisonSociale } = await getEtablissementType(siret)

  if (!ett) {
    return redirect(`/etablissement/${siret}`)
  }

  const [info, lastEffectif] = await Promise.all([
    getEtablissementInfo(etabId),
    getLastEffectif(etabId),
  ])
  return { info, lastEffectif, raisonSociale, siret }
}

type ETTLoader = {
  info: EtablissementInfo
  lastEffectif: LastEffectif
  raisonSociale: string
  siret: string
}

export default function ETT() {
  const { info, lastEffectif, raisonSociale, siret } = useLoaderData() as ETTLoader

  return (
    <div className="flex w-full flex-col">
      <EtabBanner etabName={raisonSociale} isEtt={true} siret={siret} />
      <div className="fr-container">
        <EtabInfo info={info} siret={siret} lastEffectif={lastEffectif} />
      </div>
    </div>
  )
}
