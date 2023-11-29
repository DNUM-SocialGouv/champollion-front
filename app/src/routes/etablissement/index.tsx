import { useState } from "react"
import {
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom"
import { useLoaderData } from "react-router-typesafe"

import { getEtablissementsInfo, getEtablissementsType } from "../../api"
import { errorWording, isAppError } from "../../helpers/errors"

import { Tabs } from "@codegouvfr/react-dsfr/Tabs"

import EtabBanner from "../../components/EtabBanner"

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)
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

const tabs = [
  { tabId: "tab1", label: "Fiche synthèse", to: "" },
  { tabId: "tab2", label: "Postes", to: "postes" },
  { tabId: "tab3", label: "Contrats", to: "contrats" },
  { tabId: "tab4", label: "Recours abusif", to: "recours-abusif" },
  { tabId: "tab5", label: "Délai de carence", to: "carence" },
]

type ContextType = { etabId: number }

export default function Etab() {
  const { etabId, raisonSociale, siret, isOpen } = useLoaderData<typeof loader>()
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
        <EtabBanner
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
