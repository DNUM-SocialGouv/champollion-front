import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom"
import dayjs from "dayjs"
import {
  getEtablissementsInfo,
  getEtablissementsType,
  getContratsEtt,
  getEffectifsLast,
} from "../api"
import { EtablissementInfo, EttContrat, LastEffectif, MetaData } from "../api/types"

import { Link } from "react-router-dom"
import EtabBanner from "../components/EtabBanner"
import EtabInfo from "../components/EtabInfo"
import AppTable from "../components/AppTable"
import Pagination from "@codegouvfr/react-dsfr/Pagination"
import { ReactNode } from "react"

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const page = params.page && Number(params.page) ? Number(params.page) : 1

  const { id: etabId, ett, raisonSociale } = await getEtablissementsType(siret)

  if (!ett) {
    return redirect(`/etablissement/${siret}`)
  }

  const [info, lastEffectif, { data: contrats, meta }] = await Promise.all([
    getEtablissementsInfo(etabId),
    getEffectifsLast(etabId),
    getContratsEtt({
      id: etabId,
      startMonth: "2022-01-01",
      endMonth: "2022-12-01",
      page,
    }),
  ])
  return { contrats, info, lastEffectif, meta, page, raisonSociale, siret }
}

type ETTLoader = {
  contrats: EttContrat[]
  info: EtablissementInfo
  lastEffectif: LastEffectif
  meta: MetaData
  page: number
  raisonSociale: string
  siret: string
}

type Column =
  | "poste"
  | "etu"
  | "employee"
  | "startDate"
  | "expectedEndDate"
  | "endDate"
  | "motive"

type ContratsHeader = {
  key: Column
  label: string
  width: string
}

const headers = [
  { key: "poste", label: "Poste", width: "10%" },
  { key: "etu", label: "Etablissement utilisateur", width: "15%" },
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "startDate", label: "Date de début", width: "10%" },
  { key: "expectedEndDate", label: "Date de fin prévisionnelle", width: "10%" },
  { key: "endDate", label: "Date de fin réelle", width: "10%" },
  { key: "motive", label: "Motif de recours", width: "20%" },
] as ContratsHeader[]

type FormattedContrat = {
  id: number
  poste: string
  etu: ReactNode
  employee: string
  startDate: string
  expectedEndDate: string | null
  endDate: string | null
  motive: string | null
}

export default function ETT() {
  const { contrats, info, lastEffectif, page, meta, raisonSociale, siret } =
    useLoaderData() as ETTLoader

  const formatDate = (date: string | null) =>
    dayjs(date).isValid() ? dayjs(date).format("DD/MM/YYYY") : ""

  const formatContrats = (items: EttContrat[]) =>
    items.map((contrat) => {
      const etu = contrat.etuSiret ? (
        <Link to={`/etablissement/${contrat.etuSiret}`}>
          {contrat.etuRaisonSociale} ({contrat.etuCodePostal})
        </Link>
      ) : (
        <></>
      )
      return {
        id: contrat.id,
        poste: contrat.libellePoste,
        etu,
        employee: `${contrat.prenoms} ${contrat.nomFamille}`,
        startDate: formatDate(contrat.dateDebut),
        expectedEndDate: formatDate(contrat.dateFinPrevisionnelle),
        endDate: formatDate(contrat.dateFin),
        motive: contrat.libelleMotifRecours,
      } as FormattedContrat
    })
  const formattedContrats = contrats.length > 0 ? formatContrats(contrats) : []

  return (
    <div className="flex w-full flex-col">
      <EtabBanner etabName={raisonSociale} isEtt={true} siret={siret} />
      <div className="fr-container fr-mt-3w">
        <EtabInfo info={info} siret={siret} lastEffectif={lastEffectif} />
        <h2 className="fr-text--xl fr-mt-3w fr-mb-1w">
          Liste des contrats de mission déclarés
        </h2>
        <hr />
        {meta?.totalCount && formatContrats.length > 0 ? (
          <>
            <p>{meta.totalCount} résultats</p>
            <AppTable headers={headers} items={formattedContrats} />
            <Pagination
              count={meta.totalPages}
              defaultPage={page}
              getPageLinkProps={(page) => ({ to: `/ett/${siret}/${page}` })}
              showFirstLast
              classes={{
                list: "justify-center",
              }}
            />
          </>
        ) : (
          <p>Aucun résultat</p>
        )}
      </div>
    </div>
  )
}
