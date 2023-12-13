import { type ReactNode } from "react"
import { Link, useSearchParams } from "react-router-dom"

import type { EttContrat, PaginationMetaData } from "../../api/types"
import {
  type ContratsHeader,
  getContractNature,
  getSexName,
  getMotivesRecours,
  infoTable,
} from "../../helpers/contrats"
import { formatDate } from "../../helpers/date"
import { getQueryPage } from "../../helpers/format"

import { Pagination } from "@codegouvfr/react-dsfr/Pagination"

import Table from "../../components/Table"
type Column = "poste" | "etu" | "employee" | "startDate" | "endDate" | "nature" | "motive"

const headers = [
  { key: "poste", label: "Poste", width: "10%" },
  { key: "etu", label: "Etablissement utilisateur", width: "15%" },
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "startDate", label: "Date de début", width: "10%" },
  { key: "endDate", label: "Date de fin", width: "10%" },
  { key: "nature", label: "Nature contrat", width: "5%" },
  { key: "motive", label: "Motif de recours", width: "20%" },
] as ContratsHeader<Column>[]

type FormattedContrat = {
  id: number
  poste: string
  etu: ReactNode
  employee: string
  startDate: string
  endDate: string | null
  motive: string | null
  nature: string
}
export default function ETTContrats({
  contrats,
  meta,
}: {
  contrats: EttContrat[]
  meta: PaginationMetaData
}) {
  const [searchParams] = useSearchParams()
  const formatContrats = (items: EttContrat[]) =>
    items.map((contrat) => {
      const etu = contrat.etuSiret ? (
        <Link to={`/etablissement/${contrat.etuSiret}`}>
          {contrat.etuRaisonSociale} ({contrat.etuCodePostal})
        </Link>
      ) : (
        <p>n/a</p>
      )
      return {
        id: contrat.contratId,
        poste: contrat.libellePoste,
        etu,
        employee: `${contrat.prenoms} ${contrat.nomFamille} (${getSexName(
          contrat.sexe
        )} ${contrat.dateNaissance})`,
        startDate: formatDate(contrat.dateDebut),
        endDate: formatDate(contrat.dateFin),
        motive: getMotivesRecours(contrat.codeMotifRecours),
        nature: getContractNature(contrat.codeNatureContrat),
      } as FormattedContrat
    })
  const formattedContrats = contrats.length > 0 ? formatContrats(contrats) : []

  return (
    <>
      {meta?.totalCount && formatContrats.length > 0 ? (
        <>
          <p>{meta.totalCount} résultats</p>
          <Table className="fr-mb-1w" headers={headers} items={formattedContrats} />
          {meta.totalPages > 1 && (
            <Pagination
              count={meta.totalPages}
              defaultPage={getQueryPage(searchParams)}
              getPageLinkProps={(page) => {
                const newQuery = new URLSearchParams(searchParams)
                newQuery.set("page", String(page))
                return {
                  to: { search: newQuery.toString() },
                }
              }}
              showFirstLast
              classes={{
                list: "justify-center",
              }}
            />
          )}
        </>
      ) : (
        <p>Aucun résultat</p>
      )}
      {infoTable}
    </>
  )
}
