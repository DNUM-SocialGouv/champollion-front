import { useSearchParams } from "react-router-dom"
import { EtuContrat, PaginationMetaData } from "../../../api/types"
import { ContratsLoader } from "./ContratsLoader"
import { useLoaderData } from "react-router-typesafe"
import { filtersDetail } from "../../../helpers/filters"
import ls from "localstorage-slim"
import {
  ContratDatesState,
  EditableDate,
  formatContrats,
  getStatusNameFromCode,
  headers,
  infoTable,
} from "../../../helpers/contrats"
import { useState } from "react"
import Collapse from "../../../components/Collapse"
import Table from "../../../components/Table"
import { Pagination } from "@codegouvfr/react-dsfr/Pagination"
import { getQueryPage } from "../../../helpers/format"

export default function ContratsTable({
  contrats,
  meta,
}: {
  contrats: EtuContrat[]
  meta: PaginationMetaData
}) {
  const [searchParams] = useSearchParams()
  const { siret, jobListWithoutMerges, formattedMergesIds, queryJobs } =
    useLoaderData<typeof ContratsLoader>()

  const filtersInfo = filtersDetail({
    queryJobs,
    jobListWithoutMerges,
    localMerges: formattedMergesIds,
  })

  const initialContratsDatesState = contrats.map((contrat) => {
    const savedContratsDates = ls.get(`contrats.${siret}`) as Record<string, string>
    const startKey = `${contrat.contratId}-start`
    const start: EditableDate = {
      date: contrat.dateDebut,
      status: getStatusNameFromCode(contrat.statutDebut),
      isEdit: false,
    }
    const end: EditableDate = {
      date: contrat.dateFin,
      status: getStatusNameFromCode(contrat.statutFin),
      isEdit: false,
    }
    const endKey = `${contrat.contratId}-end`

    if (savedContratsDates && startKey in savedContratsDates) {
      start.date = savedContratsDates[startKey]
      start.status = "validated"
    }

    if (savedContratsDates && endKey in savedContratsDates) {
      end.date = savedContratsDates[endKey]
      end.status = "validated"
    }

    if (!end.date && contrat.statutFin !== 3) {
      end.status = "unknown"
    }

    return {
      id: contrat.contratId,
      start,
      end,
    } as ContratDatesState
  })
  const [contratsDatesState, setContratsDatesState] = useState(initialContratsDatesState)
  const formattedContrats = formatContrats(
    contrats,
    contratsDatesState,
    setContratsDatesState,
    siret
  )

  return (
    <>
      {meta.totalCount > 0 ? (
        <>
          <p className="fr-mb-0">{meta.totalCount} résultats</p>
          {queryJobs.length > 0 && (
            <Collapse
              id="filters-collapse"
              className="fr-mb-1w"
              label="Afficher les postes sélectionnés"
              labelOpen="Masquer les postes sélectionnés"
              keepBtnOnTop
            >
              {filtersInfo}
            </Collapse>
          )}
          <Table
            className="fr-mb-1w padding-0"
            headers={headers}
            items={formattedContrats}
          />
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
        <p>Aucun résultat.</p>
      )}
      {infoTable}
    </>
  )
}
