import ls from "localstorage-slim"
import {
  type LoaderFunctionArgs,
  useSearchParams,
  useNavigation,
  useAsyncValue,
} from "react-router-dom"
import { defer, useLoaderData } from "react-router-typesafe"
import { Fragment, useEffect } from "react"

import {
  getCarencesIdcc,
  getEtablissementsDefaultPeriod,
  getEtablissementsType,
  postCarences,
  postPostes,
} from "../../api"
import type { IDCC, Infractions, MetaCarences } from "../../api/types"
import type { FormattedInfraction, FormattedCarenceContract } from "../../helpers/carence"
import {
  formatInfractions,
  getLegislationOptionFromKey,
  legislationDetails,
  legislationOptions,
} from "../../helpers/carence"
import { formatDate } from "../../helpers/date"
import {
  camelToSnakeCase,
  createFiltersQuery,
  formatLocalClosedPublicHolidays,
  formatLocalExceptionalDates,
  formatLocalMerges,
  formatLocalOpenDays,
  formatNumber,
  getQueryAsNumberArray,
  getQueryAsString,
} from "../../helpers/format"
import { formatCorrectedDates } from "../../helpers/contrats"
import { errorWording, isAppError } from "../../helpers/errors"
import { getQueryDates } from "../../helpers/filters"
import { initJobOptions } from "../../helpers/postes"
import { trackEvent } from "../../helpers/analytics"
import { filtersDetail } from "../../helpers/filters"

import { Accordion } from "@codegouvfr/react-dsfr/Accordion"
import { Badge } from "@codegouvfr/react-dsfr/Badge"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Select } from "@codegouvfr/react-dsfr/Select"

import Collapse from "../../components/Collapse"
import IndicatorWrapper from "../../components/indicators/IndicatorWrapper"
import Rebound from "../../components/Rebound"
import Table, { type Header } from "../../components/Table"
import ContractsPieChart, {
  PieSlice,
  groupSmallData,
} from "../../components/indicators/Charts/ContractsPieChart"
import Deferring from "../../components/Deferring"
import EstablishmentFilters from "../../components/establishment/EstablishmentFilters"
import InfractionRatioIndicator from "../../components/indicators/InfractionRatioIndicator"
import NoticeCorrectData from "../../components/NoticeCorrectData"
import JobMergedBadge from "../../components/job/JobMergedBadge"

export async function loader({ params, request }: LoaderFunctionArgs) {
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

  // Get user modifications from localStorage
  const localMergesIds = ls.get(`etab.${params.siret}.merges`) as number[][] | null
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)
  const localOpenDays = ls.get(`etab.${params.siret}.openDays`)
  const formattedOpenDays = formatLocalOpenDays(localOpenDays)
  const localOpenDates = ls.get(`etab.${params.siret}.openDates`)
  const formattedOpenDates = formatLocalExceptionalDates(localOpenDates)
  const localClosedDates = ls.get(`etab.${params.siret}.closedDates`)
  const formattedClosedDates = formatLocalExceptionalDates(localClosedDates)
  const localClosedPublicHolidays = ls.get(`etab.${params.siret}.closedPublicHolidays`)
  const formattedClosedPublicHolidays = formatLocalClosedPublicHolidays(
    localClosedPublicHolidays
  )

  const deferredCallsController = new AbortController()
  const carences = postCarences({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    legislation: camelToSnakeCase(queryLegislation),
    correctedDates,
    mergedPostesIds: formattedMergesIds,
    openDaysCodes: formattedOpenDays,
    openDates: formattedOpenDates,
    closedDates: formattedClosedDates,
    closedPublicHolidays: formattedClosedPublicHolidays,
    postesIds: queryJobs,
    signal: deferredCallsController.signal,
  })

  const [postes, postesWithoutMerges] = await Promise.all([
    postPostes(etabType.id, formattedMergesIds),
    postPostes(etabType.id),
  ])

  const jobListWithoutMerges = isAppError(postesWithoutMerges) ? [] : postesWithoutMerges

  return {
    deferredCalls: defer({
      carences,
    }),
    deferredCallsController,
    idccData,
    legislationCode: queryLegislation,
    postes,
    queryEndDate,
    queryJobs,
    queryStartDate,
    raisonSociale: etabType.raisonSociale,
    jobListWithoutMerges,
    formattedMergesIds,
  }
}

const headers = [
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "startDate", label: "Date de début", width: "10%" },
  { key: "endDate", label: "Date de fin", width: "10%" },
  { key: "delay", label: "Délai de carence", width: "10%" },
  { key: "nextPossibleDate", label: "Date de prochain contrat possible", width: "15%" },
  { key: "motive", label: "Motif de recours", width: "20%" },
  { key: "nature", label: "Nature de contrat", width: "10%" },
] as Header<FormattedCarenceContract>[]

const modal = createModal({
  id: "export-modal",
  isOpenedByDefault: false,
})

export default function Carence() {
  const {
    deferredCalls,
    deferredCallsController,
    idccData,
    legislationCode,
    postes,
    queryJobs,
    queryStartDate,
    queryEndDate,
    raisonSociale,
  } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  if (navigation.state === "loading") {
    deferredCallsController.abort()
  }
  const [searchParams, setSearchParams] = useSearchParams()

  const jobOptions = initJobOptions(postes)

  const carenceMotives = [2]
  const carenceNatures = ["02", "03"]

  const filtersQuery = createFiltersQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: carenceMotives,
    natures: carenceNatures,
    jobs: queryJobs,
  })

  let legislationData: Record<string, IDCC> | null = null
  if (!isAppError(idccData)) legislationData = idccData

  const initialLegislationOption =
    legislationData &&
    legislationOptions(legislationData).find((option) => option.value === legislationCode)

  const selectedLegislationDetail =
    legislationData &&
    legislationDetails(legislationData).find((idcc) => idcc.key == legislationCode)

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
    trackEvent({
      category: "Carence",
      action: "IDCC sélectionné",
      properties: legislationValue,
    })
  }

  useEffect(() => {
    document.title = `Délai de carence - ${raisonSociale}`
  }, [])

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mb-1w">Module de filtres</h2>
        <hr />
        <EstablishmentFilters
          startDate={queryStartDate}
          endDate={queryEndDate}
          natures={carenceNatures}
          motives={carenceMotives}
          jobs={queryJobs}
          jobOptions={jobOptions}
          disabledFilters={{ natures: true, motives: true }}
        />

        <NoticeCorrectData />

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
          <p>Elle permettra de télécharger les tableaux d'infractions potentielles.</p>
        </modal.Component>

        <hr />

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
                  <Collapse
                    id="legislation-collapse"
                    className="fr-mb-2w"
                    label="Plus d'informations sur l'accord de branche"
                    labelOpen="Moins d'informations sur l'accord de branche"
                  >
                    {detailElement()}
                  </Collapse>
                </>
              )}
          </>
        )}

        <Deferring deferredPromise={deferredCalls.data.carences}>
          <EtabCarenceInfraction />
        </Deferring>

        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
        <hr />
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Fusionner plusieurs libellés du même poste"
              linkProps={{
                to: {
                  pathname: "../postes",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Fusion de postes"
              tracking={{ category: "Carence" }}
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Consulter les contrats analysés"
              linkProps={{
                to: {
                  pathname: "../contrats",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Contrats"
              tracking={{ category: "Carence" }}
            />
          </div>
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
              tracking={{ category: "Carence" }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function EtabCarenceInfraction() {
  const defaultData = useAsyncValue() as { infractions: Infractions; meta: MetaCarences }

  if (!defaultData) {
    console.error(
      "EtabCarenceInfraction didn't receive async deferred data. It must be used in a <Await> component from react-router."
    )
    return null
  }

  const {
    queryJobs,
    queryStartDate,
    queryEndDate,
    jobListWithoutMerges,
    formattedMergesIds,
  } = useLoaderData<typeof loader>()

  const formattedInfractions = formatInfractions(defaultData.infractions)

  const totalInfractions: number = formattedInfractions.reduce(
    (acc, current) => acc + current.count,
    0
  )

  const filtersInfo = filtersDetail({
    queryJobs,
    jobListWithoutMerges,
    localMerges: formattedMergesIds,
  })

  const pieData = groupSmallData(
    Object.values(defaultData.infractions).map((job) => ({
      name: job.libelle,
      merged: job.merged,
      value: job.count,
      percent: job.ratio,
    }))
  )

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
      <p>
        <span className="font-bold">{totalInfractions} </span>infractions potentielles.
      </p>

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

      {totalInfractions > 0 && (
        <>
          <h3 className="fr-text--md underline underline-offset-4">
            Ratio de contrats en infractions potentielles
          </h3>

          <InfractionRatioIndicator
            meta={defaultData.meta}
            startDate={queryStartDate}
            endDate={queryEndDate}
            hasJobs={queryJobs.length > 0}
            tracking={{ category: "Carence" }}
          />

          <h3 className="fr-text--md underline underline-offset-4">
            Répartition par poste
          </h3>

          <DelayByJobIndicator
            data={pieData}
            startDate={queryStartDate}
            endDate={queryEndDate}
            hasJobs={queryJobs.length > 0}
          />
        </>
      )}

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
                <Table headers={headers} items={posteInfraction.carenceContracts} />
              </Fragment>
            ))}
          </Accordion>
        ))}
      </div>
    </>
  )
}

type DelayByJobIndicatorProps = {
  data: PieSlice[]
  startDate: string
  endDate: string
  hasJobs: boolean
}

function DelayByJobIndicator({
  data,
  startDate,
  endDate,
  hasJobs,
}: DelayByJobIndicatorProps) {
  const start = formatDate(startDate, "MMMM YYYY")
  const end = formatDate(endDate, "MMMM YYYY")
  const selectedPostes = hasJobs ? " pour les libellés de poste sélectionnés," : ""

  const firstJobShare = data[0].percent
  const firstJobName = data[0].name

  const title =
    "Répartition des contrats en infraction potentielle aux délais de carence par libellé de poste :"
  const subTitle = `Par souci de lisibilité, les parts inférieures à 2 % ne sont pas affichées, et regroupées sous le libellé "Autres".`

  const readingNote = `
    De ${start} à ${end},${selectedPostes} ${firstJobShare} % des contrats en infraction
    potentielle avec un ou plusieurs délais de carence ont pour libellé de poste "
    ${firstJobName}".
  `

  const headers = ["Libellé de poste", "Proportion des infractions potentielles"]
  const tableData = data.map((job) => {
    const jobName = (
      <>
        {job.name}
        <JobMergedBadge merged={job.merged === 1} />
      </>
    )
    const jobShare = formatNumber(job.percent) + " %"

    return [jobName, jobShare]
  })

  return (
    <IndicatorWrapper
      id="delay"
      title={title}
      subTitle={subTitle}
      readingNote={readingNote}
      table={{ headers, data: tableData }}
      tracking={{ category: "Carence" }}
    >
      <div className="fr-mb-2w h-60 w-full">
        <ContractsPieChart data={data} />
      </div>
    </IndicatorWrapper>
  )
}
