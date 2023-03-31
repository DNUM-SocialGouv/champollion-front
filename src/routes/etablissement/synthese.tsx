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
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Select } from "@codegouvfr/react-dsfr/Select"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"
import { AppError, errorWording, isAppError } from "../../helpers/errors"

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<EtabSyntheseLoader> {
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      statusText: errorWording.etab,
    })
  }

  const etabId = etabType.id

  const [effectifs, info, lastEffectif] = await Promise.all([
    getEffectifs({
      id: etabId,
      startMonth: "2022-01-01",
      endMonth: "2022-12-01",
      unit: "tot",
    }),
    getEtablissementsInfo(etabId),
    getEffectifsLast(etabId),
  ])
  return { effectifs, etabId, info, lastEffectif, siret }
}

type EtabSyntheseLoader = {
  effectifs: Effectif[] | AppError
  etabId: number
  info: EtablissementInfo | AppError
  lastEffectif: LastEffectif | AppError
  siret: string
}

export default function EtabSynthese() {
  const { effectifs, etabId, info, lastEffectif, siret } =
    useLoaderData() as EtabSyntheseLoader

  return (
    <>
      <h2 className="fr-text--xl fr-mb-1w">Informations sur l'établissement</h2>
      <hr />
      {isAppError(info) ? (
        <>
          <Alert
            className="fr-mb-2w"
            description="Pas de données disponibles"
            severity="error"
            title="Erreur"
          />
        </>
      ) : (
        <EtabInfo
          info={info}
          siret={siret}
          lastEffectif={(!isAppError(lastEffectif) && lastEffectif) || null}
        />
      )}
      <div className="fr-py-3w flex w-full flex-col">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Vue globale des contrats</h2>
        <hr />
        {isAppError(effectifs) ? (
          <Alert
            className="fr-mb-2w"
            description="Pas de données disponibles"
            severity="error"
            title="Erreur"
          />
        ) : (
          <EtabSyntheseEffectifs defaultData={effectifs} etabId={etabId} />
        )}
      </div>
    </>
  )
}

function EtabSyntheseEffectifs({
  defaultData,
  etabId,
}: {
  defaultData: Effectif[]
  etabId: number
}) {
  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const [unit, setUnit] = useState({ key: 1, option: getUnitOptionFromKey(1) })
  const [data, setData] = useState(formatEffectifs(defaultData))
  const [isEffectifError, setIsEffectifError] = useState(false)

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
    if (!isAppError(newData)) {
      setData(formatEffectifs(newData))
      setIsEffectifError(false)
    } else setIsEffectifError(true)
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
      {isEffectifError ? (
        <Alert
          className="fr-mb-2w"
          description={errorWording.errorOccurred}
          severity="error"
          title="Erreur"
        />
      ) : (
        <div className="h-[500px]">
          <EffectifBarChart
            isStacked={areTempContractsStacked}
            unit="contrats"
            data={data}
          />
        </div>
      )}
    </>
  )
}
