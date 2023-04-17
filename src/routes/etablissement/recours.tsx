import { useState } from "react"
import {
  Form,
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "react-router-dom"

import {
  formatEffectifs,
  unitsOptions,
  getUnitOptionFromKey,
} from "../../helpers/effectifs"
import { getEffectifs, getPostes, getEtablissementsType } from "../../api"
import { Effectif, EffectifUnit, isEffectifUnit } from "../../api/types"
import { AppError, errorWording, isAppError } from "../../helpers/errors"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"
import { Select } from "@codegouvfr/react-dsfr/Select"
import AppMultiSelect, { Option } from "../../components/AppMultiSelect"
import EffectifBarChart from "../../components/EffectifBarChart"
import { getQueryAsString } from "../../helpers/format"

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<EtabPostesLoader> {
  // fetch etablissement postes
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      statusText: errorWording.etab,
    })
  }

  const etabPostes = await getPostes(etabType.id)

  if (isAppError(etabPostes)) {
    const responseParams: ResponseInit = {
      statusText: errorWording.etab,
    }
    if (etabPostes.status) responseParams.status = etabPostes.status
    if (etabPostes.status == 404) responseParams.statusText = "Postes introuvables."
    throw new Response("", responseParams)
  }

  const options = etabPostes.map(
    (poste, index) => ({ value: index, label: poste.libelle } as Option)
  )

  const { searchParams } = new URL(request.url)
  const queryPoste = getQueryAsString(searchParams, "poste")
  const queryUnit = getQueryAsString(searchParams, "unit")
  const unit: EffectifUnit = isEffectifUnit(queryUnit) ? queryUnit : "tot"
  const effectifs = await getEffectifs({
    id: etabType.id,
    startMonth: "2022-01-01",
    endMonth: "2022-12-01",
    unit,
    postes: queryPoste ? [queryPoste] : undefined,
  })
  return {
    effectifs,
    options,
    queryPoste,
  }
}

type EtabPostesLoader = {
  effectifs: Effectif[] | AppError
  options: Option[]
  queryPoste: string
}

export default function EtabRecours() {
  const submit = useSubmit()

  const {
    effectifs: initialEffectifs,
    options,
    queryPoste: initialQueryPoste,
  } = useLoaderData() as EtabPostesLoader

  const initialPosteOption: Option =
    options.find((option) => option.label === initialQueryPoste) || ({} as Option)
  const [selectedPoste, setSelectedPoste] = useState(initialPosteOption)

  const [effectifs, setEffectifs] = useState(initialEffectifs)
  const [prevEffectifs, setPrevEffectifs] = useState(initialEffectifs)
  if (initialEffectifs !== prevEffectifs) {
    setPrevEffectifs(initialEffectifs)
    setEffectifs(initialEffectifs)
  }

  const [unitValue, setUnitValue] = useState("tot" as EffectifUnit)

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mb-1w">Évolution des effectifs</h2>
        <hr />
        <Form>
          <AppMultiSelect
            options={options}
            className="fr-mr-2w md:w-3/5 lg:w-1/2"
            isMulti={false}
            value={selectedPoste}
            label="Filtrer par poste"
            onChange={(newValue) => {
              if (!Array.isArray(newValue)) {
                const poste = (newValue as Option) || ({} as Option)
                setSelectedPoste(poste)
                const formData = new FormData()
                if (poste?.label) formData.append("poste", poste?.label)
                formData.append("unit", unitValue)
                submit(formData) // go back to loader with formData in url
              }
            }}
          />
        </Form>

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
            onUnitChange={(unit) => setUnitValue(unit)}
          />
        )}
      </div>
    </>
  )
}

function EtabPostesEffectifs({
  defaultData,
  onUnitChange,
}: {
  defaultData: Effectif[]
  onUnitChange: (unitValue: EffectifUnit) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const [unit, setUnit] = useState({ key: 1, option: getUnitOptionFromKey(1) })
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

    setUnit({ key: newKey, option: newUnitOption })
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
            value: unit.key,
          }}
        >
          {unitsOptions.map(({ key, label, attr }) => (
            <option {...attr} key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <ToggleSwitch
          label="Superposer les barres des CDD et CTT"
          checked={areTempContractsStacked}
          onChange={(checked) => setAreTempContractsStacked(checked)}
        />
      </div>

      <div className="h-[500px]">
        <EffectifBarChart
          isStacked={areTempContractsStacked}
          unit="contrats"
          data={effectifsData}
        />
      </div>
    </>
  )
}
