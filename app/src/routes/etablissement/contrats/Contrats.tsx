import { useEffect } from "react"
import { useLoaderData } from "react-router-typesafe"
import ls from "localstorage-slim"
import { warningList } from "../../../helpers/contrats"
import { motiveOptions, contractNatures } from "../../../helpers/filters"
import { errorDescription, isAppError } from "../../../helpers/errors"
import { formatDate } from "../../../helpers/date"
import { createFiltersQuery } from "../../../helpers/format"
import { DateStatusBadge } from "../../../helpers/contrats"
import { trackEvent } from "../../../helpers/analytics"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"

import Rebound from "../../../components/Rebound"
import EstablishmentFilters from "../../../components/establishment/EstablishmentFilters"
import ExportModal, { exportModal } from "../../../components/ExportModal"
import { ContratsLoader } from "./ContratsLoader"
import ContratsTable from "./ContratsTable"
import { initEmployeeOptions, initJobOptions } from "../../../helpers/postes"

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
  } = useLoaderData<typeof ContratsLoader>()
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
          onClick={() => exportModal.open()}
          iconId="fr-icon-download-line"
          priority="tertiary no outline"
          type="button"
        >
          Exporter
        </Button>
      </div>
      <ExportModal
        isCarence={false}
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
      ></ExportModal>
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
