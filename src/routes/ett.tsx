import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom"
import { getEtablissementInfo, getEtablissementType } from "../api/etablissement"
import { EtablissementInfo } from "../api/types"

import EtabBanner from "../components/EtabBanner"
import EtabInfo from "../components/EtabInfo"

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""

  const { id: etabId, ett, raisonSociale } = await getEtablissementType(siret)

  if (!ett) {
    return redirect(`/etablissement/${siret}`)
  }

  const info = await getEtablissementInfo(etabId)
  return { info, raisonSociale, siret }
}

type ETTLoader = {
  raisonSociale: string
  siret: string
  info: EtablissementInfo
}

export default function ETT() {
  const { info, raisonSociale, siret } = useLoaderData() as ETTLoader

  return (
    <div className="flex w-full flex-col">
      <EtabBanner etabName={raisonSociale} isEtt={true} siret={siret} />
      <div className="fr-container">
        <EtabInfo info={info} siret={siret} />
      </div>
    </div>
  )
}
