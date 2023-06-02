import { ReactNode, useState } from "react"
import { LoaderFunctionArgs, useLoaderData, useSearchParams } from "react-router-dom"
import ls from "localstorage-slim"

import { getEtablissementsType, getPostes, getContratsEtu } from "../../api"
import {
  formatContrats,
  headers,
  EditableDate,
  ContratDatesState,
  motiveOptions,
  contractNatures,
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
import { Pagination } from "@codegouvfr/react-dsfr/Pagination"
import { Tile } from "@codegouvfr/react-dsfr/Tile"
import AppTable from "../../components/AppTable"
import EtabFilters from "../../components/EtabFilters"
import { DateStatusBadge } from "../../helpers/contrats"

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
  const motives = queryMotives.map((motive) => Number(motive))

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
    natures: queryNature,
    motives,
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
          <li>Intitulés de poste sélectionnés : {queryJobs.join(", ")}</li>
        )}
        {queryMotives.length > 0 && (
          <li>
            Motifs de recours sélectionnés :{" "}
            {queryMotives
              .map(
                (motive) => motiveOptions.find((x) => x.value === Number(motive))?.label
              )
              .filter(Boolean)
              .join(", ")}
          </li>
        )}
        {queryNature.length > 0 && (
          <li>
            Natures de contrat sélectionnées :{" "}
            {queryNature
              .map((nature) => contractNatures.find((x) => x.code === nature)?.label)
              .filter(Boolean)
              .join(", ")}
          </li>
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
      <p>Vous pouvez corriger les dates d'après vos observations.</p>
      <div className="fr-px-3w fr-py-2w fr-mb-2w bg-bg-alt-greyyyy border border-solid border-bd-default-grey">
        <h3 className="fr-text--md fr-mb-2w">Légende des statuts de date</h3>
        <ul className="fr-my-0">
          <li className="flex flex-col md:flex-row">
            <span className="fr-col-md-2 fr-col-xl-1">
              <DateStatusBadge status="declared" />
            </span>
            <span className="fr-mb-0">Date déclarée en DSN.</span>
          </li>
          <li className="flex flex-col md:flex-row">
            <span className="fr-col-md-2 fr-col-xl-1">
              <DateStatusBadge status="computed" />
            </span>
            <span className="fr-mb-0">
              Date non déclarée (déduite de la date prévisionnelle et du dernier mois de
              déclaration du contrat).
            </span>
          </li>
          <li className="flex flex-col md:flex-row">
            <span className="fr-col-md-2 fr-col-xl-1">
              <DateStatusBadge status="validated" />
            </span>
            <span className="fr-mb-0">Date corrigée par vos soins.</span>
          </li>
        </ul>
      </div>
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

function ContratsTable({ contrats, meta }: { contrats: EtuContrat[]; meta: MetaData }) {
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
          <p className="fr-mb-0">{meta.totalCount} résultats</p>
          <AppTable headers={headers} items={formattedContrats} />
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
    </>
  )
}
