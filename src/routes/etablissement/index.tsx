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

type EtabLoader = {
  etabId: number
  siret: string
  pathname: string
  raisonSociale: string
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const siret = params.siret ? String(params.siret) : ""
  const { id, ett, raisonSociale } = await getEtablissementsType(siret)

  if (ett) {
    return redirect(`/ett/${siret}`)
  }

  return {
    etabId: id,
    pathname: url.pathname,
    raisonSociale,
    siret,
  } as EtabLoader
}

const tabs = [
  { tabId: "tab1", label: "Fiche synthèse", to: "" },
  { tabId: "tab2", label: "Détail des contrats par poste", to: "postes" },
]
const tabIndex = {
  tab1: 0,
  tab2: 1,
} as Record<string, number>

type ContextType = { etabId: number }

export default function Etab() {
  const { etabId, pathname, raisonSociale, siret } = useLoaderData() as EtabLoader
  const navigate = useNavigate()

  const initialTab: string = pathname.includes("postes") ? "tab2" : "tab1"
  const [selectedTabId, setSelectedTabId] = useState(initialTab)

  const handleTabChange = (clickedTab: string) => {
    const clickedTabPath = tabs[tabIndex[clickedTab]].to
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
