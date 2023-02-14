import { useState } from "react"
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import {
  getEtablissementInfo,
  getEtablissementType,
  getEffectifs,
} from "../../api/etablissement"
import { EtablissementInfo, Effectif, EffectifUnit } from "../../api/types"

import EtabInfo from "../../components/EtabInfo"
import EffectifBarChart, { MonthData } from "../../components/EffectifBarChart"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"
import { Select } from "@codegouvfr/react-dsfr/Select"

import * as dayjs from "dayjs"
import "dayjs/locale/fr"
dayjs.locale("fr")

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const { id: etabId } = await getEtablissementType(siret)
  const info = await getEtablissementInfo(etabId)
  const effectifs = await getEffectifs({
    id: etabId,
    startMonth: "2022-01-01",
    endMonth: "2022-12-01",
    unit: "tot",
  })
  return { effectifs, etabId, info, siret }
}

type EtabSyntheseLoader = {
  effectifs: Effectif[]
  etabId: number
  info: EtablissementInfo
  siret: string
}

export default function EtabSynthese() {
  const formatNumber = (nb: number) => (Number.isInteger(nb) ? nb : nb.toFixed(2))
  const formatEffectifs = (effectifs: Effectif[]) =>
    effectifs.map(({ month, nbCdi, nbCdd, nbCtt }) => {
      const date = dayjs(month)

      return {
        date: date.format("YYYY-MM-DD"),
        label: dayjs(date).format("MMM YY"),
        name: dayjs(date).format("MMM YY"),
        cdd: formatNumber(nbCdd),
        cdi: formatNumber(nbCdi),
        ctt: formatNumber(nbCtt),
      } as MonthData
    })

  const unitsOptions: {
    key: number
    value: EffectifUnit | null
    label: string
    attr?: {}
  }[] = [
    {
      key: 0,
      value: null,
      label: "Sélectionnez l'unité des effectifs à afficher",
      attr: { disabled: true },
    },
    { key: 1, value: "tot", label: "Nombre total de contrats" },
    { key: 2, value: "avg", label: "Nombre moyen mensuel de contrats" },
    { key: 3, value: "ldm", label: "Nombre de contrats au dernier jour du mois" },
    // { key: 4, value: "etp", label: "ETP (équivalent temps plein)" }, // etp not available yet from api
  ]

  const getUnitOptionFromKey = (key: number | string) =>
    unitsOptions.find((option) => String(option.key) == String(key))

  const { effectifs, etabId, info, siret } = useLoaderData() as EtabSyntheseLoader
  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const [unit, setUnit] = useState({ key: 1, option: getUnitOptionFromKey(1) })
  const [data, setData] = useState(formatEffectifs(effectifs))

  const handleUnitSelected = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = Number(event.target.value)
    const newUnitOption = getUnitOptionFromKey(newKey)

    setUnit({ key: newKey, option: newUnitOption })
    const newData = await getEffectifs({
      id: etabId,
      startMonth: "2022-01-01",
      endMonth: "2022-12-01",
      unit: newUnitOption?.value || "tot",
    })
    setData(formatEffectifs(newData))
  }

  return (
    <>
      <EtabInfo info={info} siret={siret} />
      <div className="fr-py-3w flex w-full flex-col">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Vue globale des contrats</h2>
        <hr />
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
            label="Empiler les barres des CDD et CTT"
            checked={areTempContractsStacked}
            onChange={(checked) => setAreTempContractsStacked(checked)}
          />
        </div>
        <div className="h-[500px]">
          <EffectifBarChart
            isStacked={areTempContractsStacked}
            unit="contrats"
            data={data}
          />
        </div>
      </div>
    </>
  )
}
