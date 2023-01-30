import { useState } from "react"
import { LoaderFunctionArgs, Outlet, useLoaderData, useNavigate } from "react-router-dom"

import { Tabs } from "@codegouvfr/react-dsfr/Tabs"
import { Button } from "@codegouvfr/react-dsfr/Button"

type EtabBannerLoader = {
  siret: string
  pathname: string
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  return {
    siret: params.etabId,
    pathname: url.pathname,
  } as EtabBannerLoader
}

const tabs = [
  { tabId: "tab1", label: "Fiche synthèse", to: "" },
  { tabId: "tab2", label: "Détail des postes", to: "postes" },
]
const tabIndex = {
  tab1: 0,
  tab2: 1,
} as Record<string, number>

export default function EtabBanner() {
  const { siret, pathname } = useLoaderData() as EtabBannerLoader
  const navigate = useNavigate()

  const initialTab: string = pathname.includes("postes") ? "tab2" : "tab1"
  const [selectedTabId, setSelectedTabId] = useState(initialTab)

  const handleTabChange = (clickedTab: string) => {
    const clickedTabPath = tabs[tabIndex[clickedTab]].to
    navigate(clickedTabPath)
    setSelectedTabId(clickedTab)
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="fr-container fr-my-2w">
        <Button
          iconId="fr-icon-arrow-left-line"
          priority="secondary"
          size="small"
          linkProps={{ to: ".." }}
        >
          Chercher un autre établissement
        </Button>
      </div>
      <div className="fr-py-4w w-full bg-contrast-info">
        <div className="fr-container mx-auto">
          <h1 className="fr-h3">Etablissement : MonEtab</h1>
          <p>{`SIRET : ${siret}`}</p>
        </div>
      </div>
      <div className="fr-mt-2w fr-container">
        <Tabs selectedTabId={selectedTabId} tabs={tabs} onTabChange={handleTabChange}>
          <Outlet />
        </Tabs>
      </div>
    </div>
  )
}
