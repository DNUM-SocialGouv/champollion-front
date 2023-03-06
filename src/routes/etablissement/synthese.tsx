import { useState } from "react"
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import {
  getEtablissementsInfo,
  getEtablissementsType,
  getEffectifs,
  getEffectifsLast,
} from "../../api"
import { EtablissementInfo, Effectif, LastEffectif } from "../../api/types"

import {
  formatEffectifs,
  unitsOptions,
  getUnitOptionFromKey,
} from "../../helpers/effectifs"
import EtabInfo from "../../components/EtabInfo"
import EffectifBarChart from "../../components/EffectifBarChart"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"
import { Select } from "@codegouvfr/react-dsfr/Select"

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const { id: etabId } = await getEtablissementsType(siret)
  const [info, lastEffectif, effectifs] = await Promise.all([
    getEtablissementsInfo(etabId),
    getEffectifsLast(etabId),
    getEffectifs({
      id: etabId,
      startMonth: "2022-01-01",
      endMonth: "2022-12-01",
      unit: "tot",
    }),
  ])
  return { effectifs, etabId, info, lastEffectif, siret }
}

type EtabSyntheseLoader = {
  effectifs: Effectif[]
  etabId: number
  info: EtablissementInfo
  lastEffectif: LastEffectif
  siret: string
}

export default function EtabSynthese() {
  const { effectifs, etabId, info, lastEffectif, siret } =
    useLoaderData() as EtabSyntheseLoader
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
      <EtabInfo info={info} siret={siret} lastEffectif={lastEffectif} />
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
            label="Superposer les barres des CDD et CTT"
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
