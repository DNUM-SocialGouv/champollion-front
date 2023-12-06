import { useEffect, type ReactNode } from "react"
import { Link, redirect, useSearchParams } from "react-router-dom"
import { useLoaderData } from "react-router-typesafe"
import type { LoaderFunctionArgs } from "react-router-dom"
import ls from "localstorage-slim"

import {
  getEtablissementsInfo,
  getEtablissementsType,
  getContratsEtt,
  postEffectifsLast,
  getEtablissementsDefaultPeriod,
  postPostes,
  getSalaries,
} from "../api"
import type { EttContrat, PaginationMetaData } from "../api/types"
import { errorDescription, errorWording, isAppError } from "../helpers/errors"
import {
  type ContratsHeader,
  formatCorrectedDates,
  getContractNature,
  getSexName,
  getMotivesRecours,
  warningList,
  infoTable,
} from "../helpers/contrats"
import { contractNatures, getQueryDates, motiveOptions } from "../helpers/filters"
import { initEmployeeOptions, initJobOptions } from "../helpers/postes"
import { formatDate } from "../helpers/date"
import {
  getQueryAsArray,
  getQueryAsNumber,
  getQueryAsNumberArray,
  getQueryPage,
} from "../helpers/format"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Pagination } from "@codegouvfr/react-dsfr/Pagination"
import { Button } from "@codegouvfr/react-dsfr/Button"

import EstablishmentBanner from "../components/establishment/EstablishmentBanner"
import EstablishmentInfo from "../components/establishment/EstablishmentInfo"
import EstablishmentFilters from "../components/establishment/EstablishmentFilters"
import Table from "../components/Table"
import ExportContractsModal, {
  exportContractsModal,
} from "../components/ExportContractsModal"

export async function loader({ params, request }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const { searchParams } = new URL(request.url)
  const page = getQueryPage(searchParams)
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    const responseParams: ResponseInit = {
      statusText: etabType.messageFr ?? errorWording.etab,
    }
    if (etabType.status) responseParams.status = etabType.status
    if (etabType.status == 404) responseParams.statusText = "SIRET introuvable."
    throw new Response("", responseParams)
  }

  if (!etabType.ett) {
    return redirect(`/etablissement/${siret}`)
  }

  const etabDefaultPeriod = await getEtablissementsDefaultPeriod(etabType.id)

  const { queryStartDate, queryEndDate } = getQueryDates({
    etabDefaultPeriod,
    searchParams,
  })
  const queryNature = getQueryAsArray(searchParams, "nature")
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryEmployee = getQueryAsNumber(searchParams, "salarie")

  const queryMotives = getQueryAsNumberArray(searchParams, "motif")

  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

  const [postes, info, lastEffectif, data, employeesList] = await Promise.all([
    postPostes(etabType.id),
    getEtablissementsInfo(etabType.id),
    postEffectifsLast(etabType.id, correctedDates),
    getContratsEtt({
      id: etabType.id,
      page,
      startDate: queryStartDate,
      endDate: queryEndDate,
      motives: queryMotives,
      employeesIds: queryEmployee ? [queryEmployee] : undefined,
      postesIds: queryJobs,
      natures: queryNature,
    }),
    getSalaries(etabType.id),
  ])
  const options = initJobOptions(postes)
  const employeesOptions = initEmployeeOptions(employeesList)

  return {
    info,
    lastEffectif,
    page,
    raisonSociale: etabType.raisonSociale,
    siret,
    data,
    queryStartDate,
    queryEndDate,
    queryNature,
    queryJobs,
    queryEmployee,
    queryMotives,
    options,
    employeesOptions,
    etabType,
    correctedDates,
  }
}

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

export default function ETT() {
  const {
    data,
    info,
    lastEffectif,
    raisonSociale,
    siret,
    queryStartDate,
    queryEndDate,
    queryNature,
    queryJobs,
    queryEmployee,
    queryMotives,
    options,
    employeesOptions,
    page,
    etabType,
    correctedDates,
  } = useLoaderData<typeof loader>()

  useEffect(() => {
    document.title = `VisuDSN - ETT ${raisonSociale}`
  }, [])

  const isOpen = isAppError(info) ? undefined : info.ouvert

  const formattedDates = {
    startDate: formatDate(queryStartDate),
    endDate: formatDate(queryEndDate),
  }
  return (
    <div className="flex w-full flex-col">
      <EstablishmentBanner
        etabName={raisonSociale}
        isEtt={true}
        siret={siret}
        isOpen={isOpen}
      />
      <div className="fr-container fr-mt-3w">
        <h2 className="fr-text--xl fr-mb-1w">Informations sur l'établissement</h2>
        <hr />
        {isAppError(info) ? (
          <>
            <Alert
              className="fr-mb-2w"
              description="Pas de données disponibles"
              severity="error"
              title="Erreur"
            />
          </>
        ) : (
          <EstablishmentInfo
            info={info}
            siret={siret}
            lastEffectif={(!isAppError(lastEffectif) && lastEffectif) || null}
          />
        )}
        <div>
          <h2 className="fr-text--xl fr-mt-3w fr-mb-1w">Module de filtres</h2>
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
        </div>

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
          companyName={etabType.raisonSociale}
          correctedDates={correctedDates}
          queryEmployee={queryEmployee}
          queryEndDate={queryEndDate}
          etabId={etabType.id}
          queryMotives={queryMotives}
          queryNature={queryNature}
          page={page}
          queryJobs={queryJobs}
          siret={siret}
          queryStartDate={queryStartDate}
        ></ExportContractsModal>
        <hr />
        {isAppError(data) ? (
          <>
            <Alert
              className="fr-mb-2w"
              description={errorDescription(data)}
              severity="error"
              title={data.messageFr}
            />
          </>
        ) : data.contrats.length > 0 ? (
          <ETTContrats contrats={data.contrats} meta={data.meta} />
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
      </div>
    </div>
  )
}

function ETTContrats({
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
