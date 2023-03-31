import { useState } from "react"
import {
  LoaderFunctionArgs,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from "react-router-dom"
import { getEtablissementsType } from "../../api"

import { Tabs } from "@codegouvfr/react-dsfr/Tabs"
import EtabBanner from "../../components/EtabBanner"
import { errorWording, isAppError } from "../../helpers/errors"

type EtabLoader = {
  etabId: number
  siret: string
  pathname: string
  raisonSociale: string
}

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<Response | EtabLoader> {
  const url = new URL(request.url)
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    const responseParams: ResponseInit = {
      statusText: errorWording.etab,
    }
    if (etabType.status) responseParams.status = etabType.status
    if (etabType.status == 404) responseParams.statusText = "SIRET introuvable."
    throw new Response("", responseParams)
  }

  if (etabType.ett) {
    return redirect(`/ett/${siret}`)
  }

  return {
    etabId: etabType.id,
    pathname: url.pathname,
    raisonSociale: etabType.raisonSociale,
    siret,
  }
}

const tabs = [
  { tabId: "tab1", label: "Fiche synthèse", to: "" },
  { tabId: "tab2", label: "Détail des contrats par poste", to: "postes" },
  { tabId: "tab3", label: "Infraction délai de carence", to: "carence" },
]

type ContextType = { etabId: number }

export default function Etab() {
  const { etabId, pathname, raisonSociale, siret } = useLoaderData() as EtabLoader
  const navigate = useNavigate()
  const tabPathregex = /\/etablissement\/\d{14}\/([\w]+)/
  const tabPath = tabPathregex.exec(pathname)?.[1]

  const initialTab = tabs.find((tab) => tab.to === tabPath)?.tabId ?? "tab1"

  const [selectedTabId, setSelectedTabId] = useState(initialTab)

  const handleTabChange = (clickedTab: string) => {
    const clickedTabPath = tabs.find((tab) => tab.tabId === clickedTab)?.to || ""
    navigate(clickedTabPath)
    setSelectedTabId(clickedTab)
  }

  return (
    <>
      <div className="flex w-full flex-col items-center">
        <EtabBanner etabName={raisonSociale} isEtt={false} siret={siret} />

        <div className="fr-mt-2w fr-container">
          <Tabs selectedTabId={selectedTabId} tabs={tabs} onTabChange={handleTabChange}>
            <Outlet context={{ etabId }} />
          </Tabs>
        </div>
      </div>
    </>
  )
}

export function useEtabId() {
  return useOutletContext<ContextType>()
}
