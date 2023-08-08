import ls from "localstorage-slim"
import { type LoaderFunctionArgs, useLoaderData, useSearchParams } from "react-router-dom"
import { Fragment } from "react"

import {
  getCarencesIdcc,
  getEtablissementsDefaultPeriod,
  getEtablissementsType,
  postCarences,
  postPostes,
} from "../../api"
import type { EtablissementPoste, IDCC, Infractions } from "../../api/types"
import type { FormattedInfraction, FormattedCarenceContract } from "../../helpers/carence"
import {
  formatInfractions,
  getLegislationOptionFromKey,
  legislationDetails,
  legislationOptions,
} from "../../helpers/carence"
import {
  camelToSnakeCase,
  createFiltersQuery,
  formatDate,
  formatLocalMerges,
  formatLocalOpenDays,
  getQueryAsNumberArray,
  getQueryAsString,
} from "../../helpers/format"
import type { AppError } from "../../helpers/errors"
import { errorWording, isAppError } from "../../helpers/errors"
import { getQueryDates } from "../../helpers/filters"
import { initJobOptions } from "../../helpers/postes"

import { Accordion } from "@codegouvfr/react-dsfr/Accordion"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Badge } from "@codegouvfr/react-dsfr/Badge"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Select } from "@codegouvfr/react-dsfr/Select"

import AppRebound from "../../components/AppRebound"
import AppTable from "../../components/AppTable"
import type { Header } from "../../components/AppTable"
import EtabFilters from "../../components/EtabFilters"
import AppCollapse from "../../components/AppCollapse"

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<EtabCarenceLoader> {
  const { searchParams } = new URL(request.url)

  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)
  const idccData = await getCarencesIdcc()

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
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryLegislation = getQueryAsString(searchParams, "legislation") || "droitCommun"

  const localMergesIds = ls.get(`etab.${params.siret}.merges`) as number[][] | null
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const openDays = ls.get(`etab.${params.siret}.openDays`)
  const formattedOpenDays = formatLocalOpenDays(openDays)

  const postes = await postPostes(etabType.id, formattedMergesIds)
  const infractions = await postCarences({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    legislation: camelToSnakeCase(queryLegislation),
    mergedPostesIds: formattedMergesIds,
    openDaysCodes: formattedOpenDays,
    postesIds: queryJobs,
  })

  return {
    idccData,
    infractions,
    legislation: queryLegislation,
    postes,
    queryEndDate,
    queryJobs,
    queryStartDate,
  }
}

type EtabCarenceLoader = {
  idccData: Record<string, IDCC> | AppError
  infractions: Infractions | AppError
  legislation: string
  postes: AppError | EtablissementPoste[]
  queryEndDate: string
  queryJobs: number[]
  queryStartDate: string
}

const headers = [
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "startDate", label: "Date de début", width: "10%" },
  { key: "endDate", label: "Date de fin", width: "10%" },
  { key: "delay", label: "Délai de carence", width: "10%" },
  { key: "nextPossibleDate", label: "Date de prochain contrat possible", width: "15%" },
  { key: "motive", label: "Motif de recours", width: "20%" },
  { key: "contractType", label: "Nature de contrat", width: "10%" },
] as Header<FormattedCarenceContract>[]

export default function EtabCarence() {
  const {
    idccData,
    infractions,
    legislation,
    postes,
    queryJobs,
    queryStartDate,
    queryEndDate,
  } = useLoaderData() as EtabCarenceLoader

  const jobOptions = initJobOptions(postes)

  let legislationData = null
  if (!isAppError(idccData)) legislationData = idccData

  const carenceMotives = [2]
  const carenceNatures = ["02", "03"]

  const filtersQuery = createFiltersQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: carenceMotives,
    natures: carenceNatures,
    jobs: queryJobs,
  })

  const modal = createModal({
    id: "export-modal",
    isOpenedByDefault: false,
  })

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mb-1w">Module de filtres</h2>
        <hr />
        <EtabFilters
          startDate={queryStartDate}
          endDate={queryEndDate}
          natures={carenceNatures}
          motives={carenceMotives}
          jobs={queryJobs}
          jobOptions={jobOptions}
          disabledFilters={{ natures: true, motives: true }}
        />

        <div className="flex justify-between">
          <h2 className="fr-text--xl fr-mb-1w">
            Infractions potentielles au délai de carence
          </h2>

          <Button
            onClick={() => modal.open()}
            iconId="fr-icon-download-line"
            priority="tertiary no outline"
            type="button"
          >
            Exporter
          </Button>
        </div>
        <modal.Component title="Fonctionnalité d'export à venir">
          <p>La fonctionnalité d'export est en cours de développement.</p>
          <p>Elle permettra de télécharger les tableaux d'infractions présumées.</p>
        </modal.Component>

        <hr />
        {isAppError(infractions) ? (
          <Alert
            className="fr-mb-2w"
            severity="error"
            title={infractions.messageFr}
            description={`Erreur ${infractions.status}`}
          />
        ) : (
          <EtabCarenceInfraction
            defaultData={infractions}
            defaultLegislation={legislation}
            legislationData={legislationData}
          />
        )}
        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
        <hr />
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <AppRebound
              desc="Fusionner plusieurs libellés du même poste"
              linkProps={{
                to: "../postes",
              }}
              title="Fusion de postes"
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <AppRebound
              desc="Consulter les contrats analysés"
              linkProps={{
                to: {
                  pathname: "../contrats",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Contrats"
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <AppRebound
              desc="Lancer le diagnostic d'emploi permanent sur les contrats sélectionnés"
              linkProps={{
                to: {
                  pathname: "../recours-abusif",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Recours abusif"
            />
          </div>
        </div>
      </div>
    </>
  )
}

function EtabCarenceInfraction({
  defaultData,
  defaultLegislation,
  legislationData,
}: {
  defaultData: Infractions
  defaultLegislation: string
  legislationData: Record<string, IDCC> | null
}) {
  const formattedInfractions = formatInfractions(defaultData)
  const [searchParams, setSearchParams] = useSearchParams()

  const totalInfractions: number = formattedInfractions.reduce(
    (acc, current) => acc + current.count,
    0
  )

  const initialLegislationOption =
    legislationData &&
    legislationOptions(legislationData).find(
      (option) => option.value === defaultLegislation
    )

  const selectedLegislationDetail =
    legislationData &&
    legislationDetails(legislationData).find((idcc) => idcc.key == defaultLegislation)

  const detailElement = () => (
    <div className="fr-p-2w fr-mb-2w rounded-2xl border border-solid border-bd-default-grey bg-bg-alt-grey">
      <div>
        <b>Nom de l'accord : </b> {selectedLegislationDetail?.fullTitle}
      </div>
      {selectedLegislationDetail?.idccDate && (
        <div>
          <b>Date de l'accord : </b>
          {formatDate(selectedLegislationDetail.idccDate)}
        </div>
      )}
      {selectedLegislationDetail?.idccExtensionDate && (
        <div>
          <b>Date de l'arrêté d'extension : </b>
          {formatDate(selectedLegislationDetail.idccExtensionDate)}
        </div>
      )}
      <div className="fr-mt-2w">
        {selectedLegislationDetail?.description?.main}

        {selectedLegislationDetail?.description?.details && (
          <ul className="fr-my-0">
            {selectedLegislationDetail.description.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  const handleLegislationSelected = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newKey = Number(event.target.value)
    const newLegislationOption = legislationData
      ? getLegislationOptionFromKey(newKey, legislationData)
      : { value: "droitCommun" }
    const legislationValue = newLegislationOption?.value
    searchParams.set("legislation", legislationValue)
    setSearchParams(searchParams)
  }

  const accordionLabel = (job: FormattedInfraction) => {
    return (
      <>
        {job.jobTitle}
        {Boolean(job.merged) && (
          <Badge severity="new" className={"fr-ml-1w"} small>
            Fusionné
          </Badge>
        )}{" "}
        – {job.count} infraction(s) potentielle(s)
      </>
    )
  }

  return (
    <>
      {legislationData !== null && (
        <>
          <Select
            className="md:w-3/4"
            label="Accord de branche étendu"
            hint="Code - Date de l'accord (Date de signature) - Mots clés"
            nativeSelectProps={{
              onChange: handleLegislationSelected,
              value: initialLegislationOption?.key || "0",
            }}
          >
            {legislationOptions(legislationData).map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>

          {selectedLegislationDetail &&
            Object.keys(selectedLegislationDetail).length > 0 && (
              <>
                <AppCollapse
                  className="fr-mb-2w"
                  label="Plus d'informations sur l'accord de branche"
                  labelOpen="Moins d'informations sur l'accord de branche"
                >
                  {detailElement()}
                </AppCollapse>
              </>
            )}
        </>
      )}
      <p>{totalInfractions} infractions potentielles.</p>
      <div className="fr-accordions-group">
        {formattedInfractions.map((infractionByJobTitle) => (
          <Accordion
            label={accordionLabel(infractionByJobTitle)}
            key={infractionByJobTitle.jobTitle}
          >
            {infractionByJobTitle.list.map((posteInfraction, index) => (
              <Fragment key={posteInfraction.illegalContract.id}>
                <p className="fr-mb-0">
                  {`${index + 1}) Le contrat temporaire de ${
                    posteInfraction.illegalContract.employee
                  }, employé(e)
                  en tant que ${posteInfraction.illegalContract.jobTitle}
                  du ${posteInfraction.illegalContract.startDate} au
                  ${
                    posteInfraction.illegalContract.endDate
                  } (renouvellement inclus) au motif
                  d'accroissement temporaire d'activité, ne respecte pas le délai de
                  carence des contrats ci-dessous :`}
                </p>
                <AppTable headers={headers} items={posteInfraction.carenceContracts} />
              </Fragment>
            ))}
          </Accordion>
        ))}
      </div>
    </>
  )
}
