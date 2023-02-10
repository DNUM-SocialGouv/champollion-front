import { useState } from "react"
import {
  LoaderFunctionArgs,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router-dom"
import { getEtablissementType } from "../../api/etablissement"

import { Tabs } from "@codegouvfr/react-dsfr/Tabs"
import EtabBanner from "../../components/EtabBanner"

type EtabLoader = {
  siret: string
  pathname: string
  raisonSociale: string
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const siret = params.siret ? String(params.siret) : ""
  const { ett, raisonSociale } = await getEtablissementType(siret)

  if (ett) {
    return redirect(`/ett/${siret}`)
  }

  return {
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

export default function Etab() {
  const { pathname, raisonSociale, siret } = useLoaderData() as EtabLoader
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
            <Outlet />
          </Tabs>
        </div>
      </div>
    </>
  )
}
