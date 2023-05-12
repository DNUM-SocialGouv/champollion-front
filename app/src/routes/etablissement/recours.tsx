import { useState } from "react"
import { LoaderFunctionArgs, useLoaderData, useSearchParams } from "react-router-dom"
import ls from "localstorage-slim"

import { getEffectifs, getPostes, getEtablissementsType } from "../../api"
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
} from "../../helpers/effectifs"
import { AppError, errorWording, isAppError } from "../../helpers/errors"
import {
  createFiltersQuery,
  getQueryAsArray,
  getQueryAsString,
  oneYearAgo,
  today,
} from "../../helpers/format"
import { initOptions, selectedPostesAfterMerge } from "../../helpers/postes"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Select } from "@codegouvfr/react-dsfr/Select"
import { Tile } from "@codegouvfr/react-dsfr/Tile"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"
import EffectifBarChart from "../../components/EffectifBarChart"
import EtabFilters from "../../components/EtabFilters"

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<EtabPostesLoader> {
  const { searchParams } = new URL(request.url)
  const queryStartDate = getQueryAsString(searchParams, "debut") || oneYearAgo
  const queryEndDate = getQueryAsString(searchParams, "fin") || today
  const queryMotives = getQueryAsArray(searchParams, "motif")
  const queryNature = getQueryAsArray(searchParams, "nature")
  const queryJobs = getQueryAsArray(searchParams, "poste")
  const queryUnit = getQueryAsString(searchParams, "unit")

  const unit: EffectifUnit = isEffectifUnit(queryUnit) ? queryUnit : "tot"

  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: errorWording.etab,
    })
  }

  const postes = await getPostes(etabType.id)

  const localMergesLabels = ls.get(`etab.${params.siret}.merges`) as string[][] | null
  const selectedPostesParam = selectedPostesAfterMerge(queryJobs, localMergesLabels)

  const effectifs = await getEffectifs({
    id: etabType.id,
    startMonth: queryStartDate,
    endMonth: queryEndDate,
    unit,
    postes: selectedPostesParam,
  })
  return {
    effectifs,
    mergesLabels: localMergesLabels,
    postes,
    queryEndDate,
    queryJobs,
    queryMotives,
    queryNature,
    queryStartDate,
    unit,
  }
}

type EtabPostesLoader = {
  effectifs: Effectif[] | AppError
  mergesLabels: string[][] | null
  postes: AppError | EtablissementPoste[]
  queryStartDate: string
  queryEndDate: string
  queryMotives: string[]
  queryNature: string[]
  queryJobs: string[]
  unit: EffectifUnit
}

export default function EtabRecours() {
  const {
    effectifs: initialEffectifs,
    mergesLabels,
    postes,
    queryEndDate,
    queryJobs,
    queryMotives,
    queryNature,
    queryStartDate,
    unit,
  } = useLoaderData() as EtabPostesLoader

  const filtersQuery = createFiltersQuery(
    queryStartDate,
    queryEndDate,
    queryMotives,
    queryNature,
    queryJobs
  )

  const options = initOptions(postes, mergesLabels)

  const [effectifs, setEffectifs] = useState(initialEffectifs)
  const [prevEffectifs, setPrevEffectifs] = useState(initialEffectifs)
  if (initialEffectifs !== prevEffectifs) {
    setPrevEffectifs(initialEffectifs)
    setEffectifs(initialEffectifs)
  }

  const [unitValue, setUnitValue] = useState(unit) //todo useful?

  const { ExportModal, exportModalButtonProps } = createModal({
    name: "Export",
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
          natures={queryNature}
          motives={queryMotives}
          jobs={queryJobs}
          jobOptions={options}
        />
        <div className="flex justify-between">
          <h2 className="fr-text--xl fr-mb-1w">Évolution des effectifs</h2>
          <Button
            {...exportModalButtonProps}
            iconId="fr-icon-download-line"
            priority="tertiary no outline"
            type="button"
          >
            Exporter
          </Button>
        </div>
        <ExportModal title="Fonctionnalité d'export à venir">
          <p>La fonctionnalité d'export est en cours de développement.</p>
          <p>Elle permettra d'imprimer l'histogramme en pdf.</p>
        </ExportModal>
        <hr />

        {isAppError(effectifs) ? (
          <Alert
            className="fr-mb-2w"
            description="Pas de données disponibles"
            severity="error"
            title="Erreur"
          />
        ) : (
          <EtabPostesEffectifs
            defaultData={effectifs}
            defaultUnit={unitValue}
            onUnitChange={(unit) => setUnitValue(unit)}
          />
        )}

        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
        <hr />
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <Tile
              desc="Consulter les contrats correspondant à l'histogramme"
              enlargeLink
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
            <Tile
              desc="Fusionner plusieurs libellés du même poste"
              enlargeLink
              linkProps={{
                to: "../postes",
              }}
              title="Fusion de postes"
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
  onUnitChange,
}: {
  defaultData: Effectif[]
  defaultUnit: EffectifUnit
  onUnitChange: (unitValue: EffectifUnit) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const initialUnitOption = unitsOptions.find((option) => option.value === defaultUnit)
  const [, setUnit] = useState(initialUnitOption)
  const [effectifsData, setEffectifsData] = useState(formatEffectifs(defaultData))

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

    setUnit(newUnitOption)
    onUnitChange(unitValue)
  }

  return (
    <>
      <div className="fr-mb-2w lg:columns-2">
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
        <ToggleSwitch
          label="Cumuler les effectifs CDD et CTT (intérim)"
          checked={areTempContractsStacked}
          onChange={(checked) => setAreTempContractsStacked(checked)}
        />
      </div>

      <div className="fr-mt-4w h-[550px]">
        <h3 className="fr-text--xl text-center">{initialUnitOption?.label}</h3>
        <EffectifBarChart
          isStacked={areTempContractsStacked}
          unit="contrats"
          data={effectifsData}
        />
      </div>
    </>
  )
}
