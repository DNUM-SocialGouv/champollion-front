import { useEffect, useState } from "react"
import { useSearchParams, type LoaderFunctionArgs } from "react-router-dom"
import { useLoaderData } from "react-router-typesafe"
import ls from "localstorage-slim"

import {
  getEtablissementsType,
  getSalaries,
  postPostes,
  postContratsEtu,
  getEtablissementsDefaultPeriod,
} from "../../api"
import type { EtuContrat, PaginationMetaData } from "../../api/types"
import type { EditableDate, ContratDatesState } from "../../helpers/contrats"
import {
  formatContrats,
  headers,
  formatCorrectedDates,
  getStatusNameFromCode,
  warningList,
  infoTable,
} from "../../helpers/contrats"
import { motiveOptions, contractNatures, getQueryDates } from "../../helpers/filters"
import { errorDescription, errorWording, isAppError } from "../../helpers/errors"
import { formatDate } from "../../helpers/date"
import {
  createFiltersQuery,
  formatLocalMerges,
  getQueryAsArray,
  getQueryAsNumber,
  getQueryAsNumberArray,
  getQueryPage,
} from "../../helpers/format"
import { filtersDetail as filtersDetail } from "../../helpers/filters"
import { initEmployeeOptions, initJobOptions } from "../../helpers/postes"
import { DateStatusBadge } from "../../helpers/contrats"
import { trackEvent } from "../../helpers/analytics"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Pagination } from "@codegouvfr/react-dsfr/Pagination"

import Collapse from "../../components/Collapse"
import Rebound from "../../components/Rebound"
import Table from "../../components/Table"
import EstablishmentFilters from "../../components/establishment/EstablishmentFilters"
import ExportContractsModal, {
  exportContractsModal,
} from "../../components/ExportContractsModal"

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url)

  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: etabType.messageFr ?? errorWording.etab,
    })
  }

  const etabDefaultPeriod = await getEtablissementsDefaultPeriod(etabType.id)

  const { queryStartDate, queryEndDate } = getQueryDates({
    etabDefaultPeriod,
    searchParams,
  })
  const queryNature = getQueryAsArray(searchParams, "nature")
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryEmployee = getQueryAsNumber(searchParams, "salarie")
  const page = getQueryPage(searchParams)

  const localMergesIds = ls.get(`etab.${params.siret}.merges`) as number[][] | null
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

  const [postes, postesWithoutMerges] = await Promise.all([
    postPostes(etabType.id, formattedMergesIds),
    postPostes(etabType.id),
  ])

  const queryMotives = getQueryAsNumberArray(searchParams, "motif")
  const jobListWithoutMerges = isAppError(postesWithoutMerges) ? [] : postesWithoutMerges

  const employeesList = await getSalaries(etabType.id)
  const contratsData = await postContratsEtu({
    startDate: queryStartDate,
    endDate: queryEndDate,
    natures: queryNature,
    motives: queryMotives,
    id: etabType.id,
    postesIds: queryJobs,
    employeesIds: queryEmployee ? [queryEmployee] : undefined,
    page,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
  })

  return {
    companyName: etabType.raisonSociale,
    contratsData,
    employeesList,
    etabId: etabType.id,
    mergedPostesIds: formattedMergesIds,
    page,
    postes,
    queryEmployee,
    queryEndDate,
    queryJobs,
    queryNature,
    queryStartDate,
    raisonSociale: etabType.raisonSociale,
    siret,
    jobListWithoutMerges,
    queryMotives,
    formattedMergesIds,
    correctedDates,
  }
}

const resetDatesModal = createModal({
  id: "reset-dates-modal",
  isOpenedByDefault: false,
})

export default function Contrats() {
  const {
    companyName,
    contratsData,
    employeesList,
    etabId,
    mergedPostesIds,
    page,
    postes,
    queryEmployee,
    queryEndDate,
    queryJobs,
    queryMotives,
    queryNature,
    queryStartDate,
    raisonSociale,
    siret,
    correctedDates,
  } = useLoaderData<typeof loader>()
  const filtersQuery = createFiltersQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: queryMotives,
    natures: queryNature,
    jobs: queryJobs,
  })

  const options = initJobOptions(postes)
  const employeesOptions = initEmployeeOptions(employeesList)

  const formattedDates = {
    startDate: formatDate(queryStartDate),
    endDate: formatDate(queryEndDate),
  }

  const resetDates = () => {
    // Remove all corrected dates from localStorage and reload page to get original dates from new API call
    ls.remove(`contrats.${siret}`)
    window.location.reload()
  }

  useEffect(() => {
    document.title = `Contrats - ${raisonSociale}`
  }, [])

  return (
    <>
      <h2 className="fr-text--xl fr-mb-1w">Module de filtres</h2>
      <hr />
      <EstablishmentFilters
        startDate={queryStartDate}
        endDate={queryEndDate}
        natures={queryNature}
        motives={queryMotives}
        jobs={queryJobs}
        jobOptions={options}
        employee={queryEmployee}
        employeeOptions={employeesOptions}
      />
      <div className="flex justify-between">
        <h2 className="fr-text--xl fr-mb-1w">Liste des contrats</h2>
        <Button
          onClick={() => exportContractsModal.open()}
          iconId="fr-icon-download-line"
          priority="tertiary no outline"
          type="button"
        >
          Exporter
        </Button>
      </div>
      <ExportContractsModal
        companyName={companyName}
        correctedDates={correctedDates}
        queryEmployee={queryEmployee}
        queryEndDate={queryEndDate}
        etabId={etabId}
        queryMotives={queryMotives}
        queryNature={queryNature}
        page={page}
        queryJobs={queryJobs}
        siret={siret}
        queryStartDate={queryStartDate}
        mergedPostesIds={mergedPostesIds}
      ></ExportContractsModal>
      <hr />
      <div className="flex items-start justify-between">
        <p>Vous pouvez corriger les dates d'après vos observations.</p>
        <Button
          onClick={() => resetDatesModal.open()}
          iconId="fr-icon-arrow-go-back-fill"
          priority="secondary"
          size="small"
          type="button"
        >
          Réinitialiser les dates
        </Button>
        <resetDatesModal.Component
          title="Réinitialiser les dates"
          buttons={[
            { children: "Annuler" },
            {
              onClick: () => {
                resetDates()
                trackEvent({ category: "Contrats", action: "Dates réinitialisées" })
              },
              children: "Oui",
            },
          ]}
        >
          <p>Souhaitez-vous réinitialiser les dates des contrats ? </p>
          <p>
            ⚠️ Toutes vos modifications de dates seront perdues, et vous aurez à nouveau
            les dates déclarées.
          </p>
        </resetDatesModal.Component>
      </div>
      <div className="fr-px-3w fr-py-2w fr-mb-2w border border-solid border-bd-default-grey">
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
          severity="error"
          title={contratsData.messageFr}
          description={errorDescription(contratsData)}
        />
      ) : contratsData.contrats.length > 0 ? (
        <ContratsTable
          contrats={contratsData.contrats}
          meta={contratsData.meta}
          key={`${queryJobs[0]}-${page}`}
        />
      ) : (
        <Alert
          className="fr-mb-2w"
          severity="warning"
          title="Aucun contrat ne correspond à vos paramètres :"
          description={warningList(
            formattedDates,
            queryJobs,
            options,
            queryEmployee,
            employeesOptions,
            queryMotives,
            motiveOptions,
            queryNature,
            contractNatures,
            page
          )}
        />
      )}
      <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
      <hr />
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-4">
          <Rebound
            desc="Lancer le diagnostic d'emploi permanent sur les contrats sélectionnés"
            linkProps={{
              to: {
                pathname: "../recours-abusif",
                search: filtersQuery ? `?${filtersQuery}` : "",
              },
            }}
            title="Recours abusif"
            tracking={{ category: "Contrats" }}
          />
        </div>
        <div className="fr-col-12 fr-col-md-4">
          <Rebound
            desc="Lancer le diagnostic d'anomalies des délais de carence sur les contrats sélectionnés"
            linkProps={{
              to: {
                pathname: "../carence",
                search: filtersQuery ? `?${filtersQuery}` : "",
              },
            }}
            title="Délai de carence"
            tracking={{ category: "Contrats" }}
          />
        </div>
      </div>
    </>
  )
}

function ContratsTable({
  contrats,
  meta,
}: {
  contrats: EtuContrat[]
  meta: PaginationMetaData
}) {
  const [searchParams] = useSearchParams()
  const { siret, jobListWithoutMerges, formattedMergesIds, queryJobs } =
    useLoaderData<typeof loader>()

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
        <p>Aucun résultat.</p>
      )}
      {infoTable}
    </>
  )
}
