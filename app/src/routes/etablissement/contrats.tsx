import { ReactNode, useState } from "react"
import { LoaderFunctionArgs, useLoaderData, useSearchParams } from "react-router-dom"
import ls from "localstorage-slim"

import { getEtablissementsType, getPostes, getContratsEtu } from "../../api"
import {
  formatContrats,
  headers,
  EditableDate,
  ContratDatesState,
} from "../../helpers/contrats"
import { EtablissementPoste, EtuContrat, MetaData } from "../../api/types"
import { AppError, errorWording, isAppError } from "../../helpers/errors"
import {
  createFiltersQuery,
  formatDate,
  getQueryAsArray,
  getQueryAsString,
  getQueryPage,
  oneYearAgo,
  today,
} from "../../helpers/format"
import { initOptions, selectedPostesAfterMerge } from "../../helpers/postes"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Notice } from "@codegouvfr/react-dsfr/Notice"
import { Pagination } from "@codegouvfr/react-dsfr/Pagination"
import { Tile } from "@codegouvfr/react-dsfr/Tile"
import AppTable from "../../components/AppTable"
import EtabFilters from "../../components/EtabFilters"

type CarenceContratsLoader = {
  contratsData:
    | AppError
    | {
        contrats: EtuContrat[]
        meta: MetaData
      }
  mergesLabels: string[][] | null
  page: number
  postes: AppError | EtablissementPoste[]
  queryStartDate: string
  queryEndDate: string
  queryMotives: string[]
  queryNature: string[]
  queryJobs: string[]
  siret: string
}

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<CarenceContratsLoader> {
  const { searchParams } = new URL(request.url)

  const queryStartDate = getQueryAsString(searchParams, "debut") || oneYearAgo
  const queryEndDate = getQueryAsString(searchParams, "fin") || today
  const queryMotives = getQueryAsArray(searchParams, "motif")
  const queryNature = getQueryAsArray(searchParams, "nature")
  const queryJobs = getQueryAsArray(searchParams, "poste")
  const page = getQueryPage(searchParams)

  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: errorWording.etab,
    })
  }
  const postes = await getPostes(etabType.id)
  const localMergesLabels = ls.get(`etab.${params.siret}.merges`) as string[][] | null
  const selectedPostesParam = selectedPostesAfterMerge(queryJobs, localMergesLabels)

  const contratsData = await getContratsEtu({
    startMonth: queryStartDate,
    endMonth: queryEndDate,
    id: etabType.id,
    postes: selectedPostesParam,
    page,
  })

  return {
    contratsData,
    mergesLabels: localMergesLabels,
    page,
    postes,
    queryEndDate,
    queryStartDate,
    queryMotives,
    queryNature,
    queryJobs,
    siret,
  }
}

export default function EtabContrats() {
  const {
    contratsData,
    mergesLabels,
    page,
    postes,
    queryEndDate,
    queryMotives,
    queryNature,
    queryJobs,
    queryStartDate,
  } = useLoaderData() as CarenceContratsLoader

  const filtersQuery = createFiltersQuery(
    queryStartDate,
    queryEndDate,
    queryMotives,
    queryNature,
    queryJobs
  )

  const options = initOptions(postes, mergesLabels)

  const noticeText = `Lorsque la date de fin réelle n'est pas déclarée par l'entreprise, elle est dite inférée.
    Vous pouvez corriger les dates d'après vos observations.`
  const formattedDates = {
    startDate: formatDate(queryStartDate),
    endDate: formatDate(queryEndDate),
  }
  const warningList = () => {
    return (
      <>
        <li>
          Contrats en cours au moins un jour sur la période du {formattedDates.startDate}{" "}
          au {formattedDates.endDate}
        </li>
        {queryJobs.length > 0 && (
          <li>Intitulé(s) de poste sélectionné(s) : {...queryJobs}</li>
        )}
      </>
    ) as NonNullable<ReactNode>
  }

  const { ExportModal, exportModalButtonProps } = createModal({
    name: "Export",
    isOpenedByDefault: false,
  })

  return (
    <>
      <h2 className="fr-text--xl fr-mb-1w">Module de filtres</h2>
      <hr />
      <EtabFilters
        startDate={queryStartDate}
        endDate={queryEndDate}
        natures={queryNature}
        motives={queryMotives}
        jobs={queryJobs}
        jobOptions={options}
      />
      <div className="flex justify-between">
        <h2 className="fr-text--xl fr-mb-1w">Liste des contrats</h2>
        <Button
          {...exportModalButtonProps}
          iconId="fr-icon-download-line"
          priority="tertiary no outline"
          type="button"
        >
          Exporter
        </Button>
      </div>
      <ExportModal title="Fonctionnalité d'export à venir">
        <p>La fonctionnalité d'export est en cours de développement.</p>
        <p>
          Elle permettra de télécharger les données des contrats sous format tableur .csv,
          sous réserve d'acceptation des CGU.
        </p>
      </ExportModal>
      <hr />
      <Notice className="fr-mb-2w" title={noticeText} />
      {isAppError(contratsData) ? (
        <Alert
          className="fr-mb-2w"
          severity="warning"
          title="Aucun contrat ne correspond à vos paramètres :"
          description={warningList()}
        />
      ) : (
        <ContratsTable
          contrats={contratsData.contrats}
          meta={contratsData.meta}
          queryJobs={queryJobs}
          key={`${queryJobs[0]}-${page}`}
        />
      )}
      <h2 className="fr-text--xl fr-mb-1w">Actions</h2>
      <hr />
      <Tile
        className="w-full md:w-1/3"
        desc="Lancer le diagnostic d'emploi permanent sur les contrats ci-dessus"
        enlargeLink
        linkProps={{
          to: {
            pathname: "../recours-abusif",
            search: filtersQuery ? `?${filtersQuery}` : "",
          },
        }}
        title="Recours abusif"
      />
    </>
  )
}

function ContratsTable({
  contrats,
  meta,
  queryJobs,
}: {
  contrats: EtuContrat[]
  meta: MetaData
  queryJobs: string[] | null
}) {
  const [searchParams] = useSearchParams()
  const { siret } = useLoaderData() as CarenceContratsLoader

  const initialContratsDatesState = contrats.map((contrat) => {
    const savedContratsDates = ls.get(`contrats.${siret}`) as Record<string, string>
    const startKey = `${contrat.id}-start`
    const start: EditableDate = {
      date: contrat.dateDebut,
      status: "declared",
      isEdit: false,
    }
    const end: EditableDate = {
      date: contrat.dateFin,
      status: "declared",
      isEdit: false,
    }
    const endKey = `${contrat.id}-end`

    if (savedContratsDates && startKey in savedContratsDates) {
      start.date = savedContratsDates[startKey]
      start.status = "validated"
    }

    if (savedContratsDates && endKey in savedContratsDates) {
      end.date = savedContratsDates[endKey]
      end.status = "validated"
    }

    if (!end.date) {
      end.date = contrat.dateFinPrevisionnelle
      end.status = "computed"
    }

    if (!end.date) {
      end.status = "unknown"
    }

    return {
      id: contrat.id,
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
          <p>{meta.totalCount} résultats</p>
          <AppTable headers={headers} items={formattedContrats} />
          {meta.totalPages > 1 && (
            <Pagination
              count={meta.totalPages}
              defaultPage={getQueryPage(searchParams)}
              getPageLinkProps={(page) => {
                let query = `?page=${page}`
                if (queryJobs) queryJobs.forEach((poste) => (query += `&poste=${poste}}`))
                return {
                  to: { search: query },
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
    </>
  )
}
