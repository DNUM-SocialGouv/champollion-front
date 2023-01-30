import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import { getEtablissementInfo, getEtablissementType } from "../../api/etablissement"
import { EtablissementInfo } from "../../api/types"

import EtabInfo from "../../components/EtabInfo"

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const { etablissementId: etabId } = await getEtablissementType(siret)
  const info = await getEtablissementInfo(etabId)

  return { info, siret }
}

export default function EtabSynthese() {
  const { info, siret } = useLoaderData() as { info: EtablissementInfo; siret: string }

  return (
    <>
      <EtabInfo info={info} siret={siret} />
    </>
  )
}
