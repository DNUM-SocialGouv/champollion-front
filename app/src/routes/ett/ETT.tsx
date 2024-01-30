import { useEffect } from "react"
import { useLoaderData } from "react-router-typesafe"

import { errorDescription, isAppError } from "../../helpers/errors"
import { warningList } from "../../helpers/contrats"
import { contractNatures, motiveOptions } from "../../helpers/filters"
import { formatDate } from "../../helpers/date"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"

import EstablishmentBanner from "../../components/establishment/EstablishmentBanner"
import EstablishmentInfo from "../../components/establishment/EstablishmentInfo"
import EstablishmentFilters from "../../components/establishment/EstablishmentFilters"

import ExportModal, { exportModal } from "../../components/ExportModal"
import { ETTLoader } from "./ETTLoader"
import ETTContrats from "./ETTContrats"

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
  } = useLoaderData<typeof ETTLoader>()

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
        ></ExportModal>
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
