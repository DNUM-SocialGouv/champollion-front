import { useRef, useState } from "react"
import { useSearchParams, useAsyncValue } from "react-router-dom"
import { useLoaderData } from "react-router-typesafe"
import { v4 as uuid } from "uuid"

import type { Effectif, EffectifUnit, IndicatorMetaData } from "../../../api/types"
import {
  formatEffectifs,
  getReadingNotes,
  getUnitOptionFromKey,
  unitMoreInfo,
  unitsOptions,
} from "../../../helpers/effectifs"
import { formatDate, nextMonth, prevMonth } from "../../../helpers/date"
import { filtersDetail as filtersDetail } from "../../../helpers/filters"
import { trackEvent } from "../../../helpers/analytics"

import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"
import { Select } from "@codegouvfr/react-dsfr/Select"
import { Table } from "@codegouvfr/react-dsfr/Table"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"

import Collapse from "../../../components/Collapse"
import EffectifBarChart, {
  type GrayAreasInput,
} from "../../../components/indicators/Charts/EffectifBarChart"
import { RecoursLoader } from "./RecoursLoader"

type PostesEffectifsDeferred = { effectifs: Effectif[]; meta: IndicatorMetaData }

export default function PostesEffectifs({ defaultUnit }: { defaultUnit: EffectifUnit }) {
  const deferredData = useAsyncValue() as PostesEffectifsDeferred

  if (!deferredData) {
    console.error(
      "EtabPostesEffectifs didn't receive async deferred data. It must be used in a <Await> component from react-router."
    )
    return null
  }

  const { jobListWithoutMerges, formattedMergesIds, queryJobs, queryMotives } =
    useLoaderData<typeof RecoursLoader>()
  const { effectifs: defaultEffectifs, meta } = deferredData
  const [searchParams, setSearchParams] = useSearchParams()
  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const initialUnitOption = unitsOptions.find((option) => option.value === defaultUnit)
  const [effectifsData, setEffectifsData] = useState(
    formatEffectifs(defaultEffectifs, meta.firstValidDate, meta.lastValidDate)
  )
  const [showTable, setShowTable] = useState(false)
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
    const unitValue = newUnitOption?.value || "avg"
    searchParams.set("unit", unitValue)
    trackEvent({
      category: "Recours abusif",
      action: "Sélection unité effectifs",
      properties: { unit: unitValue },
    })
    setSearchParams(searchParams)
  }

  const filtersInfo = filtersDetail({
    queryMotives,
    queryJobs,
    jobListWithoutMerges,
    localMerges: formattedMergesIds,
  })

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
    trackEvent({ category: "Recours abusif", action: "Tableau effectifs copié" })
  }

  return (
    <>
      <div className="fr-mb-3w">
        <Select
          className="fr-mb-1w md:w-3/4"
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
            <Collapse
              id="unit-collapse"
              borderLeft
              key={initialUnitOption.value} // add key to reinit open/closed state when new unit selected
              label="Plus d'informations sur l'unité"
              labelOpen="Moins d'informations sur l'unité"
            >
              {unitMoreInfo[initialUnitOption.value]}
            </Collapse>
          )}
      </div>

      {(queryJobs.length > 0 || queryMotives.length > 0) && (
        <Collapse
          id="filters-collapse"
          className="fr-mb-1w"
          label="Afficher le détail des filtres sélectionnés"
          labelOpen="Masquer le détail des filtres sélectionnés"
          keepBtnOnTop
        >
          {filtersInfo}
        </Collapse>
      )}

      {showTable ? (
        <>
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
            className="fr-mb-3w"
          >
            Copier le tableau
          </Button>
        </>
      ) : (
        <>
          <div className="fr-mt-2w h-[550px]">
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
                  onChange: (event) => {
                    const checked = event.target.checked
                    setAreTempContractsStacked(checked)
                    trackEvent({
                      category: "Recours abusif",
                      action: "Checkbox cumuler CDD CTT cochée",
                      properties: checked ? "oui" : "non",
                    })
                  },
                },
              },
            ]}
          />

          {initialUnitOption &&
            initialUnitOption.value &&
            filteredEffectifsData.length > 0 && (
              <>
                <h3 className="fr-text--md fr-mt-2w fr-mb-1v font-bold">
                  Note de lecture
                </h3>
                <p>
                  {getReadingNotes(filteredEffectifsData[0], initialUnitOption.value)}
                </p>
              </>
            )}
        </>
      )}

      <ToggleSwitch
        label="Afficher les données sous forme de tableau"
        checked={showTable}
        onChange={(checked) => {
          setShowTable(checked)
          trackEvent({
            category: "Recours abusif",
            action: "Indicateur vue tableau",
            properties: checked ? "activée" : "désactivée",
          })
        }}
        classes={{ label: "w-full" }}
      />
    </>
  )
}
