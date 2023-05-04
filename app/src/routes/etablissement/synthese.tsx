import { ChangeEvent, useState } from "react"
import ls from "localstorage-slim"
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  useActionData,
  useLoaderData,
} from "react-router-dom"
import { getEtablissementsInfo, getEtablissementsType, getEffectifsLast } from "../../api"
import { EtablissementInfo, LastEffectif } from "../../api/types"
import { AppError, errorWording, isAppError } from "../../helpers/errors"

import EtabInfo from "../../components/EtabInfo"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"

export async function action({
  params,
  request,
}: ActionFunctionArgs): Promise<EtabSyntheseAction> {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const openDays = Object.keys(data)
    .filter((key) => key.includes("open-day"))
    .map((key) => data[key])
  ls.set(`etab.${params.siret}.openDays`, openDays)
  return { state: "success", stateRelatedMessage: "Sauvegardé" }
}

type EtabSyntheseAction = {
  state: "success" | "error" | "default" | undefined
  stateRelatedMessage: string
}

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<EtabSyntheseLoader> {
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: errorWording.etab,
    })
  }

  const etabId = etabType.id

  const localOpenDays = ls.get(`etab.${params.siret}.openDays`)
  const savedOpenDays: string[] = Array.isArray(localOpenDays) ? localOpenDays : []

  const [info, lastEffectif] = await Promise.all([
    getEtablissementsInfo(etabId),
    getEffectifsLast(etabId),
  ])
  return { info, lastEffectif, savedOpenDays, siret }
}

type EtabSyntheseLoader = {
  info: EtablissementInfo | AppError
  lastEffectif: LastEffectif | AppError
  savedOpenDays: string[]
  siret: string
}

export default function EtabSynthese() {
  const { info, lastEffectif, savedOpenDays, siret } =
    useLoaderData() as EtabSyntheseLoader
  const checkboxState = useActionData() as EtabSyntheseAction

  const daysName = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ]
  const openDaysCheckboxValues = [0, 1, 2, 3, 4, 5, 6].map(
    (key) => !!savedOpenDays.find((day) => day === String(key))
  )
  const initialOpenDays =
    savedOpenDays.length > 0
      ? openDaysCheckboxValues
      : [true, true, true, true, true, false, false]
  const [openDays, setOpenDays] = useState([...initialOpenDays])
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const dayIdx = parseInt(event.target.value)
    const newOpenDays = [...openDays]
    newOpenDays[dayIdx] = event.target.checked
    setOpenDays(newOpenDays)
  }
  const openDaysOptions = daysName.map((day, idx) => {
    return {
      label: day,
      nativeInputProps: {
        name: `open-day-${day}`,
        checked: openDays[idx],
        value: idx,
        onChange: handleChange,
      },
    }
  })

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
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Jours d'ouverture</h2>
        <hr />
        <Form className="flex flex-col" method="post">
          <p>
            <span className="fr-icon-info-line" aria-hidden={true} />
            Les jours d'ouverture ne sont pas fournis dans les déclarations de
            l'établissement, mais sont essentiels à renseigner afin de calculer
            correctement les jours travaillés et les délais de carence.
          </p>
          <Checkbox
            legend="Jours d'ouverture habituels"
            options={openDaysOptions}
            orientation="horizontal"
            state={checkboxState?.state}
            stateRelatedMessage={checkboxState?.stateRelatedMessage}
          />
          <Button className="fr-mt-2w" type="submit" priority="secondary">
            Sauvegarder
          </Button>
        </Form>
      </div>
    </>
  )
}
