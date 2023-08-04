import ls from "localstorage-slim"
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  useActionData,
  useLoaderData,
} from "react-router-dom"
import { getEtablissementsInfo, getEtablissementsType, getEffectifsLast } from "../../api"
import type { EtablissementInfo, LastEffectif } from "../../api/types"
import { type AppError, errorWording, isAppError } from "../../helpers/errors"
import { formatLocalOpenDays } from "../../helpers/format"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"

import EtabInfo from "../../components/EtabInfo"

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
      statusText: etabType.messageFr ?? errorWording.etab,
    })
  }

  const etabId = etabType.id

  const localOpenDays = ls.get(`etab.${params.siret}.openDays`)
  const savedOpenDaysCodes = formatLocalOpenDays(localOpenDays)

  const [info, lastEffectif] = await Promise.all([
    getEtablissementsInfo(etabId),
    getEffectifsLast(etabId),
  ])
  return { info, lastEffectif, savedOpenDaysCodes, siret }
}

type EtabSyntheseLoader = {
  info: EtablissementInfo | AppError
  lastEffectif: LastEffectif | AppError
  savedOpenDaysCodes: string[] | undefined
  siret: string
}

export default function EtabSynthese() {
  const { info, lastEffectif, savedOpenDaysCodes, siret } =
    useLoaderData() as EtabSyntheseLoader
  const checkboxState = useActionData() as EtabSyntheseAction

  const initialOpenDays = [
    { code: "1", label: "Lundi", checked: true },
    { code: "2", label: "Mardi", checked: true },
    { code: "3", label: "Mercredi", checked: true },
    { code: "4", label: "Jeudi", checked: true },
    { code: "5", label: "Vendredi", checked: true },
    { code: "6", label: "Samedi", checked: false },
    { code: "0", label: "Dimanche", checked: false },
  ]
  if (savedOpenDaysCodes && savedOpenDaysCodes.length > 0)
    initialOpenDays.forEach(
      (day) => (day.checked = savedOpenDaysCodes.includes(day.code))
    )

  const openDaysOptions = initialOpenDays.map((day) => {
    return {
      label: day.label,
      nativeInputProps: {
        name: `open-day-${day.label}`,
        defaultChecked: day.checked,
        value: day.code,
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
