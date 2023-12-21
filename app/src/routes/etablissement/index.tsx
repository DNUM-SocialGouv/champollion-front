import { useState } from "react"
import { Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom"

import { useLoaderData } from "react-router-typesafe"

import { Tabs } from "@codegouvfr/react-dsfr/Tabs"

import EstablishmentBanner from "../../components/establishment/EstablishmentBanner"
import { EtablissementLoader } from "./EtablissementLoader"

const tabs = [
  { tabId: "tab1", label: "Fiche synthèse", to: "" },
  { tabId: "tab2", label: "Postes", to: "postes" },
  { tabId: "tab3", label: "Contrats", to: "contrats" },
  { tabId: "tab4", label: "Recours abusif", to: "recours-abusif" },
  { tabId: "tab5", label: "Délai de carence", to: "carence" },
]

type ContextType = { etabId: number }

export default function Etablissement() {
  const { etabId, raisonSociale, siret, isOpen } =
    useLoaderData<typeof EtablissementLoader>()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const tabPathregex = /\/etablissement\/\d{14}\/([\w-]+)/
  const tabPath = tabPathregex.exec(pathname)?.[1]
  const initialTab = tabs.find((tab) => tab.to === tabPath)?.tabId ?? "tab1"

  const [selectedTabId, setSelectedTabId] = useState(initialTab)

  const [prevPath, setPrevPath] = useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    console.log("tabs", tabs)

    const newTab = tabs.find((tab) => tab.to === tabPath)?.tabId ?? "tab1"

    setSelectedTabId(newTab)
  }

  const handleTabChange = (clickedTab: string) => {
    const clickedTabPath = tabs.find((tab) => tab.tabId === clickedTab)?.to || ""
    navigate(clickedTabPath)
    setSelectedTabId(clickedTab)
  }

  return (
    <>
      <div className="flex w-full flex-col items-center">
        <EstablishmentBanner
          etabName={raisonSociale}
          isEtt={false}
          siret={siret}
          isOpen={isOpen}
        />

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
