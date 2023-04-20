import { useState } from "react"
import {
  LoaderFunctionArgs,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom"
import { getEtablissementsType } from "../../api"

import { Tabs } from "@codegouvfr/react-dsfr/Tabs"
import EtabBanner from "../../components/EtabBanner"
import { errorWording, isAppError } from "../../helpers/errors"

type EtabLoader = {
  etabId: number
  raisonSociale: string
  siret: string
}

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<Response | EtabLoader> {
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
    raisonSociale: etabType.raisonSociale,
    siret,
  }
}

const tabs = [
  { tabId: "tab1", label: "Fiche synthèse", to: "" },
  { tabId: "tab2", label: "Postes", to: "postes" },
  { tabId: "tab3", label: "Contrats", to: "contrats" },
  { tabId: "tab4", label: "Recours abusif", to: "recours-abusif" },
  { tabId: "tab5", label: "Délai de carence", to: "carence" },
]

type ContextType = { etabId: number }

export default function Etab() {
  const { etabId, raisonSociale, siret } = useLoaderData() as EtabLoader
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const tabPathregex = /\/etablissement\/\d{14}\/([\w-]+)/
  const tabPath = tabPathregex.exec(pathname)?.[1]
  const initialTab = tabs.find((tab) => tab.to === tabPath)?.tabId ?? "tab1"

  const [selectedTabId, setSelectedTabId] = useState(initialTab)

  const [prevPath, setPrevPath] = useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
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
