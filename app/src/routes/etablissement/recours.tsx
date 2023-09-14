import { useRef, useState } from "react"
import {
  type LoaderFunctionArgs,
  useSearchParams,
  useNavigation,
  useAsyncValue,
} from "react-router-dom"
import { defer, useLoaderData } from "react-router-typesafe"
import ls from "localstorage-slim"
import { v4 as uuid } from "uuid"

import {
  postEffectifs,
  postPostes,
  getEtablissementsType,
  getEtablissementsDefaultPeriod,
  postIndicateur2,
} from "../../api"
import type { Effectif, EffectifUnit, IndicatorMetaData } from "../../api/types"
import { isEffectifUnit } from "../../api/types"
import {
  formatEffectifs,
  getReadingNotes,
  getUnitOptionFromKey,
  unitMoreInfo,
  unitsOptions,
} from "../../helpers/effectifs"
import { formatCorrectedDates } from "../../helpers/contrats"
import { errorWording, isAppError } from "../../helpers/errors"
import { getQueryDates } from "../../helpers/filters"
import {
  createFiltersQuery,
  formatDate,
  formatLocalMerges,
  formatLocalOpenDays,
  getQueryAsNumberArray,
  getQueryAsString,
  nextMonth,
  prevMonth,
} from "../../helpers/format"
import { initJobOptions } from "../../helpers/postes"

import { Accordion } from "@codegouvfr/react-dsfr/Accordion"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Select } from "@codegouvfr/react-dsfr/Select"
import { Table } from "@codegouvfr/react-dsfr/Table"

import AppCollapse from "../../components/AppCollapse"
import AppRebound from "../../components/AppRebound"
import ContractNatureIndicator from "../../components/ContractNatureIndicator"
import Deferring from "../../components/Deferring"
import EffectifBarChart, { type GrayAreasInput } from "../../components/EffectifBarChart"
import EtabFilters from "../../components/EtabFilters"

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
  const queryMotives = getQueryAsNumberArray(searchParams, "motif")
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryUnit = getQueryAsString(searchParams, "unit")

  const unit: EffectifUnit = isEffectifUnit(queryUnit) ? queryUnit : "tot"

  // Get user modifications from localStorage
  const localMergesIds = ls.get(`etab.${params.siret}.merges`) as number[][] | null
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const openDays = ls.get(`etab.${params.siret}.openDays`)
  const formattedOpenDays = formatLocalOpenDays(openDays)
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

  const postes = await postPostes(etabType.id, formattedMergesIds)

  // AbortController to abort all deferred calls on route change
  const deferredCallsController = new AbortController()
  const effectifsData = postEffectifs({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    unit,
    motives: queryMotives,
    postesIds: queryJobs,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
    openDaysCodes: formattedOpenDays,
    signal: deferredCallsController.signal,
  })
  const contractNatureIndicator = postIndicateur2({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: queryMotives,
    postesIds: queryJobs,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
    openDaysCodes: formattedOpenDays,
    signal: deferredCallsController.signal,
  })

  return {
    deferredCalls: defer({
      contractNatureIndicator,
      effectifsData,
    }),
    deferredCallsController,
    postes,
    queryEndDate,
    queryJobs,
    queryMotives,
    queryStartDate,
    unit,
  }
}

const modal = createModal({
  id: "export-modal",
  isOpenedByDefault: false,
})

export default function EtabRecours() {
  const {
    deferredCalls,
    deferredCallsController,
    postes,
    queryEndDate,
    queryJobs,
    queryMotives,
    queryStartDate,
    unit,
  } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  if (navigation.state === "loading") {
    deferredCallsController.abort()
  }

  const effectifsNatures = ["01", "02", "03"]

  const filtersQuery = createFiltersQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: queryMotives,
    natures: [], // all natures selected is equivalent to none selected
    jobs: queryJobs,
  })
  const jobOptions = initJobOptions(postes)

  const initialEffectifs = deferredCalls.data.effectifsData

  const [effectifs, setEffectifs] = useState(initialEffectifs)
  const [prevEffectifs, setPrevEffectifs] = useState(initialEffectifs)
  if (initialEffectifs !== prevEffectifs) {
    setPrevEffectifs(initialEffectifs)
    setEffectifs(initialEffectifs)
  }

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mb-1w">Module de filtres</h2>
        <hr />
        <EtabFilters
          startDate={queryStartDate}
          endDate={queryEndDate}
          natures={effectifsNatures}
          motives={queryMotives}
          jobs={queryJobs}
          jobOptions={jobOptions}
          disabledFilters={{ natures: true }}
        />
        <div className="flex justify-between">
          <h2 className="fr-text--xl fr-mb-1w">Évolution des effectifs</h2>
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
          <p>
            La fonctionnalité d'export est en cours de développement. Elle permettra de
            copier l'histogramme en tant qu'image.
          </p>
          <p>
            En attendant, vous pouvez réaliser une capture d'écran de l'histogramme
            (raccourci clavier : Touche Windows + Maj + S).
          </p>
          <p>
            Vous pouvez également copier le tableau des effectifs dans votre presse-papier
            via le bouton <i>Copier le tableau</i>, et le coller dans un logiciel de
            traitement de texte ou un tableur.
          </p>
        </modal.Component>
        <hr />

        <Deferring deferredPromise={effectifs}>
          <EtabPostesEffectifs defaultUnit={unit} />
        </Deferring>

        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">
          Natures de contrat les plus utilisées
        </h2>
        <hr />

        <Deferring deferredPromise={deferredCalls.data.contractNatureIndicator}>
          <ContractNatureIndicator
            hasMotives={queryMotives.length > 0}
            hasJobs={queryJobs.length > 0}
          />
        </Deferring>

        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
        <hr />
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <AppRebound
              desc="Consulter les contrats correspondant à l'histogramme"
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
              desc="Fusionner plusieurs libellés du même poste"
              linkProps={{
                to: {
                  pathname: "../postes",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Fusion de postes"
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <AppRebound
              desc="Lancer le diagnostic d'anomalie des délais de carence sur les contrats sélectionnés"
              linkProps={{
                to: {
                  pathname: "../carence",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Délai de carence"
            />
          </div>
        </div>
      </div>
    </>
  )
}

type EtabPostesEffectifsDeferred = { effectifs: Effectif[]; meta: IndicatorMetaData }

function EtabPostesEffectifs({ defaultUnit }: { defaultUnit: EffectifUnit }) {
  const deferredData = useAsyncValue() as EtabPostesEffectifsDeferred

  if (!deferredData) {
    console.error(
      "EtabPostesEffectifs didn't receive async deferred data. It must be used in a <Await> component from react-router."
    )
    return null
  }

  const { effectifs: defaultEffectifs, meta } = deferredData
  const [searchParams, setSearchParams] = useSearchParams()
  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const initialUnitOption = unitsOptions.find((option) => option.value === defaultUnit)
  const [effectifsData, setEffectifsData] = useState(
    formatEffectifs(defaultEffectifs, meta.firstValidDate, meta.lastValidDate)
  )
  const tableRefs = useRef<HTMLDivElement[]>([])
  const lastInvalidPastMonth = formatDate(prevMonth(meta.firstValidDate), "YYYY-MM-DD")
  const firstInvalidFutureMonth = formatDate(nextMonth(meta.lastValidDate), "YYYY-MM-DD")

  const maxEffectif = effectifsData.reduce(
    (acc, current) => Math.max(acc, Math.max(current.cdi, current.cdd, current.ctt)),
    0
  )

  const grayAreasData: GrayAreasInput = {
    startRequestedDate: meta.startDate,
    lastInvalidPastMonth: lastInvalidPastMonth,
    firstInvalidFutureMonth: firstInvalidFutureMonth,
    endRequestedDate: meta.endDate,
    maxHeight: maxEffectif * 1.2, // max height of gray areas = max effectif + 20% margin
  }

  const [prevEffectifs, setPrevEffectifs] = useState(defaultEffectifs)
  if (defaultEffectifs !== prevEffectifs) {
    setPrevEffectifs(defaultEffectifs)
    setEffectifsData(
      formatEffectifs(defaultEffectifs, meta.firstValidDate, meta.lastValidDate)
    )
  }

  const handleUnitSelected = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = Number(event.target.value)
    const newUnitOption = getUnitOptionFromKey(newKey)
    const unitValue = newUnitOption?.value || "tot"
    searchParams.set("unit", unitValue)
    setSearchParams(searchParams)
  }

  // Create tables to display effectifs

  type TableContent = {
    id: string
    headers: string[]
    data: (string | number)[][]
  }
  const nbMonthsPerTable = 12
  const filteredEffectifsData = effectifsData.filter((monthData) => !monthData.isEmpty)
  const nbSubTables = Math.ceil(filteredEffectifsData.length / nbMonthsPerTable)
  const tablesContent: TableContent[] = []
  const formatNumber = (effectif: number) =>
    (Math.round(effectif * 100) / 100).toLocaleString("fr-FR")

  for (let i = 0; i < nbSubTables; i++) {
    const headers = [i === 0 ? initialUnitOption?.label || "" : ""]
    const cdiArray: Array<string | number> = ["CDI"]
    const cddArray: Array<string | number> = ["CDD"]
    const cttArray: Array<string | number> = ["CTT"]
    filteredEffectifsData
      .slice(i * nbMonthsPerTable, (i + 1) * nbMonthsPerTable)
      .forEach((month) => {
        headers.push(month.label)
        cdiArray.push(formatNumber(month.cdi))
        cddArray.push(formatNumber(month.cdd))
        cttArray.push(formatNumber(month.ctt))
      })
    tablesContent.push({
      id: uuid(),
      headers,
      data: [cdiArray, cddArray, cttArray],
    })
  }

  const copyTableToClipboard = async () => {
    const allTablesContent = tableRefs.current
      .map((subtable) => subtable?.outerHTML || "")
      .join("")

    try {
      const blob = new Blob([allTablesContent], { type: "text/html" })

      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      alert(
        "Le tableau a bien été copié. Vous pouvez le coller dans un tableur ou un logiciel de traitement de texte."
      )
    } catch (error) {
      console.error("Failed to copy table: ", error)
    }
  }

  return (
    <>
      <div className="fr-mb-2w">
        <Select
          className="md:w-3/4"
          label="Unité des effectifs mensuels"
          nativeSelectProps={{
            onChange: handleUnitSelected,
            value: initialUnitOption?.key || "1",
          }}
        >
          {unitsOptions.map(({ key, label, attr }) => (
            <option {...attr} key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        {initialUnitOption &&
          initialUnitOption.value &&
          initialUnitOption.value in unitMoreInfo && (
            <AppCollapse
              borderLeft
              key={initialUnitOption.value} // add key to reinit open/closed state when new unit selected
              label="Plus d'informations sur l'unité"
              labelOpen="Moins d'informations sur l'unité"
            >
              {unitMoreInfo[initialUnitOption.value]}
            </AppCollapse>
          )}
      </div>
      <div className="fr-mt-4w h-[550px]">
        <h3 className="fr-text--xl text-center">{initialUnitOption?.label}</h3>
        <EffectifBarChart
          isStacked={areTempContractsStacked}
          unit="contrats"
          data={effectifsData}
          grayAreasData={grayAreasData}
        />
      </div>
      <Checkbox
        className="fr-mt-4w"
        options={[
          {
            label: "Cumuler les effectifs CDD et CTT (intérim)",
            nativeInputProps: {
              name: "stacked",
              checked: areTempContractsStacked,
              onChange: (event) => setAreTempContractsStacked(event.target.checked),
            },
          },
        ]}
      />

      {initialUnitOption &&
        initialUnitOption.value &&
        filteredEffectifsData.length > 0 && (
          <>
            <h3 className="fr-text--md fr-mt-2w fr-mb-1v font-bold">Note de lecture</h3>
            <p>{getReadingNotes(filteredEffectifsData[0], initialUnitOption.value)}</p>
          </>
        )}

      <Accordion
        label="Afficher les effectifs sous forme de tableau"
        className="fr-mt-4w"
      >
        {tablesContent.map((subTable, index) => (
          <Table
            data={subTable.data}
            headers={subTable.headers}
            key={subTable.id}
            ref={(el) => {
              if (el) tableRefs.current[index] = el
            }}
            className="fr-my-2w fr-pt-0"
          />
        ))}
        <Button
          onClick={copyTableToClipboard}
          iconId="fr-icon-download-line"
          priority="secondary"
          type="button"
        >
          Copier le tableau
        </Button>
      </Accordion>
    </>
  )
}
