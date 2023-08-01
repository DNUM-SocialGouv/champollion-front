import ls from "localstorage-slim"
import { LoaderFunctionArgs, useLoaderData, useSearchParams } from "react-router-dom"
import { Fragment } from "react"

import { getEtablissementsType, postCarences, postPostes } from "../../api"
import { EtablissementPoste, Infractions } from "../../api/types"
import {
  FormattedInfraction,
  FormattedCarenceContract,
  formatInfractions,
  getLegislationOptionFromKey,
  legislationOptions,
} from "../../helpers/carence"
import {
  createFiltersQuery,
  formatLocalMerges,
  formatLocalOpenDays,
  getQueryAsNumberArray,
  getQueryAsString,
  oneYearAgo,
  today,
} from "../../helpers/format"
import { AppError, errorWording, isAppError } from "../../helpers/errors"
import { initJobOptions } from "../../helpers/postes"

import { Accordion } from "@codegouvfr/react-dsfr/Accordion"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Badge } from "@codegouvfr/react-dsfr/Badge"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Select } from "@codegouvfr/react-dsfr/Select"

import AppRebound from "../../components/AppRebound"
import AppTable, { Header } from "../../components/AppTable"
import EtabFilters from "../../components/EtabFilters"

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<EtabCarenceLoader> {
  const { searchParams } = new URL(request.url)
  const queryStartDate = getQueryAsString(searchParams, "debut") || oneYearAgo
  const queryEndDate = getQueryAsString(searchParams, "fin") || today
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryLegislation = getQueryAsString(searchParams, "legislation") || "droit_commun"

  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: errorWording.etab,
    })
  }

  const localMergesIds = ls.get(`etab.${params.siret}.merges`) as number[][] | null
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const openDays = ls.get(`etab.${params.siret}.openDays`)
  const formattedOpenDays = formatLocalOpenDays(openDays)

  const postes = await postPostes(etabType.id, formattedMergesIds)
  const infractions = await postCarences({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    legislation: queryLegislation,
    mergedPostesIds: formattedMergesIds,
    openDaysCodes: formattedOpenDays,
    postesIds: queryJobs,
  })

  return {
    infractions,
    legislation: queryLegislation,
    postes,
    queryEndDate,
    queryJobs,
    queryStartDate,
  }
}

type EtabCarenceLoader = {
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
  const { infractions, legislation, postes, queryJobs, queryStartDate, queryEndDate } =
    useLoaderData() as EtabCarenceLoader

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
            defautLegislation={legislation}
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
  defautLegislation,
}: {
  defaultData: Infractions
  defautLegislation: string
}) {
  const formattedInfractions = formatInfractions(defaultData)
  const [searchParams, setSearchParams] = useSearchParams()

  const totalInfractions: number = formattedInfractions.reduce(
    (acc, current) => acc + current.count,
    0
  )

  const initialLegislationOption = legislationOptions.find(
    (option) => option.value === defautLegislation
  )
  // const [prevEffectifs, setPrevEffectifs] = useState(defaultData)
  // if (defaultData !== prevEffectifs) {
  //   setPrevEffectifs(defaultData)
  //   setEffectifsData(formatEffectifs(defaultData))
  // }
  const handleLegislationSelected = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newKey = Number(event.target.value)
    const newLegislationOption = getLegislationOptionFromKey(newKey)
    const legislationValue = newLegislationOption?.value || "droit_commun"
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
      <Select
        className="md:w-3/4"
        label="Accord de branche étendu"
        hint="Code - Date de l'accord (Date de signature) - Mots clés"
        nativeSelectProps={{
          onChange: handleLegislationSelected,
          value: initialLegislationOption?.key || "1",
        }}
      >
        {legislationOptions.map(({ key, label }) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
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
