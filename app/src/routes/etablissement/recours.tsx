import { useRef, useState } from "react"
import { LoaderFunctionArgs, useLoaderData, useSearchParams } from "react-router-dom"
import ls from "localstorage-slim"
import { v4 as uuid } from "uuid"

import { postEffectifs, postPostes, getEtablissementsType } from "../../api"
import {
  Effectif,
  EffectifUnit,
  EtablissementPoste,
  isEffectifUnit,
} from "../../api/types"
import {
  formatEffectifs,
  unitsOptions,
  getUnitOptionFromKey,
  unitMoreInfo,
  getReadingNotes,
} from "../../helpers/effectifs"
import { AppError, errorWording, isAppError } from "../../helpers/errors"
import {
  createFiltersQuery,
  formatLocalMerges,
  formatLocalOpenDays,
  getQueryAsNumberArray,
  getQueryAsString,
  oneYearAgo,
  today,
} from "../../helpers/format"
import { initJobOptions } from "../../helpers/postes"

import { Accordion } from "@codegouvfr/react-dsfr/Accordion"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Select } from "@codegouvfr/react-dsfr/Select"
import { Table } from "@codegouvfr/react-dsfr/Table"

import AppRebound from "../../components/AppRebound"
import EffectifBarChart from "../../components/EffectifBarChart"
import EtabFilters from "../../components/EtabFilters"
import AppCollapse from "../../components/AppCollapse"

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<EtabPostesLoader> {
  const { searchParams } = new URL(request.url)
  const queryStartDate = getQueryAsString(searchParams, "debut") || oneYearAgo
  const queryEndDate = getQueryAsString(searchParams, "fin") || today
  const queryMotives = getQueryAsNumberArray(searchParams, "motif")
  const queryJobs = getQueryAsNumberArray(searchParams, "poste")
  const queryUnit = getQueryAsString(searchParams, "unit")
  const motives = queryMotives.map((motive) => Number(motive))

  const unit: EffectifUnit = isEffectifUnit(queryUnit) ? queryUnit : "tot"

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
  const effectifs = await postEffectifs({
    id: etabType.id,
    startDate: queryStartDate,
    endDate: queryEndDate,
    unit,
    motives,
    postesIds: queryJobs,
    mergedPostesIds: formattedMergesIds,
    openDaysCodes: formattedOpenDays,
  })

  return {
    effectifs,
    postes,
    queryEndDate,
    queryJobs,
    queryMotives,
    queryStartDate,
    unit,
  }
}

type EtabPostesLoader = {
  effectifs: Effectif[] | AppError
  postes: AppError | EtablissementPoste[]
  queryStartDate: string
  queryEndDate: string
  queryMotives: number[]
  queryJobs: number[]
  unit: EffectifUnit
}

export default function EtabRecours() {
  const {
    effectifs: initialEffectifs,
    postes,
    queryEndDate,
    queryJobs,
    queryMotives,
    queryStartDate,
    unit,
  } = useLoaderData() as EtabPostesLoader

  const effectifsNatures = ["01", "02", "03"]

  const filtersQuery = createFiltersQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: queryMotives,
    natures: [], // all natures selected is equivalent to none selected
    jobs: queryJobs,
  })
  const jobOptions = initJobOptions(postes)

  const [effectifs, setEffectifs] = useState(initialEffectifs)
  const [prevEffectifs, setPrevEffectifs] = useState(initialEffectifs)
  if (initialEffectifs !== prevEffectifs) {
    setPrevEffectifs(initialEffectifs)
    setEffectifs(initialEffectifs)
  }

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

        {isAppError(effectifs) ? (
          <Alert
            className="fr-mb-2w"
            severity="error"
            title={effectifs.messageFr}
            description={`Erreur ${effectifs.status}`}
          />
        ) : (
          <EtabPostesEffectifs defaultData={effectifs} defaultUnit={unit} />
        )}

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
                to: "../postes",
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

function EtabPostesEffectifs({
  defaultData,
  defaultUnit,
}: {
  defaultData: Effectif[]
  defaultUnit: EffectifUnit
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const initialUnitOption = unitsOptions.find((option) => option.value === defaultUnit)
  const [effectifsData, setEffectifsData] = useState(formatEffectifs(defaultData))
  const tableRefs = useRef<HTMLDivElement[]>([])

  const [prevEffectifs, setPrevEffectifs] = useState(defaultData)
  if (defaultData !== prevEffectifs) {
    setPrevEffectifs(defaultData)
    setEffectifsData(formatEffectifs(defaultData))
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
  const nbSubTables = Math.ceil(effectifsData.length / nbMonthsPerTable)
  const tablesContent: TableContent[] = []
  const formatNumber = (effectif: number) =>
    (Math.round(effectif * 100) / 100).toLocaleString("fr-FR")

  for (let i = 0; i < nbSubTables; i++) {
    const headers = [i === 0 ? initialUnitOption?.label || "" : ""]
    const cdiArray: Array<string | number> = ["CDI"]
    const cddArray: Array<string | number> = ["CDD"]
    const cttArray: Array<string | number> = ["CTT"]
    effectifsData
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
              key={initialUnitOption.value}
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
      {initialUnitOption && initialUnitOption.value && effectifsData.length > 0 && (
        <>
          <h3 className="fr-text--md fr-mt-2w fr-mb-1v font-bold">Notes de lectures</h3>
          <p>{getReadingNotes(effectifsData[0], initialUnitOption.value)}</p>
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
