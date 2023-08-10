import ls from "localstorage-slim"
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  useActionData,
  useLoaderData,
  Link,
} from "react-router-dom"
import {
  getEtablissementsInfo,
  getEtablissementsType,
  getEffectifsLast,
  getIndicateur1,
} from "../../api"
import type {
  EtablissementInfo,
  Indicator1,
  IndicatorMetaData,
  LastEffectif,
} from "../../api/types"
import { type AppError, errorWording, isAppError } from "../../helpers/errors"
import { formatDate, formatLocalOpenDays } from "../../helpers/format"

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

  const headcountIndicator = await getIndicateur1({ id: etabId })

  const localOpenDays = ls.get(`etab.${params.siret}.openDays`)
  const savedOpenDaysCodes = formatLocalOpenDays(localOpenDays)

  const [info, lastEffectif] = await Promise.all([
    getEtablissementsInfo(etabId),
    getEffectifsLast(etabId),
  ])
  return { headcountIndicator, info, lastEffectif, savedOpenDaysCodes, siret }
}

type EtabSyntheseLoader = {
  headcountIndicator: { headcount: Indicator1; meta: IndicatorMetaData } | AppError
  info: EtablissementInfo | AppError
  lastEffectif: LastEffectif | AppError
  savedOpenDaysCodes: string[] | undefined
  siret: string
}

export default function EtabSynthese() {
  const { headcountIndicator, info, lastEffectif, savedOpenDaysCodes, siret } =
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
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Modifier les jours d'ouverture</h2>
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
        {!isAppError(headcountIndicator) && (
          <HeadcountIndicator
            headcount={headcountIndicator.headcount}
            meta={headcountIndicator.meta}
          />
        )}
      </div>
    </>
  )
}

type HeadcountIndicatorProps = {
  headcount: Indicator1
  meta: IndicatorMetaData
}

function HeadcountIndicator({ headcount, meta }: HeadcountIndicatorProps) {
  const data = [
    {
      key: "cdi",
      label: "CDI",
      value: headcount.nbCdi,
      classes: "bg-[var(--artwork-minor-blue-cumulus)] border-bd-default-blue-cumulus", // add border to display a thin line when count is 0
    },
    {
      key: "cdd",
      label: "CDD",
      value: headcount.nbCdd,
      classes:
        "bg-diagonal-purple-glycine border border-solid border-bd-default-purple-glycine",
    },
    {
      key: "ctt",
      label: "CTT (intérim)",
      value: headcount.nbCtt,
      classes: "bg-vertical-pink-tuile border border-solid border-bd-default-pink-tuile",
    },
  ]
  const maxValue = Math.max(...data.map((item) => item.value))

  const start = formatDate(meta.startDate, "MMMM YYYY")
  const end = formatDate(meta.endDate, "MMMM YYYY")
  const countCdi = `${headcount.nbCdi.toLocaleString("fr-FR")} CDI`
  return (
    <>
      <div className="fr-my-3w">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Chiffres clés</h2>
        <hr />
        {/* Todo: add subtitles when there will be several indicators on this page
         <h3 className="fr-text--md underline underline-offset-4">Effectifs</h3> */}

        <h3 className="fr-text--md">
          Nombre de contrats en vigueur entre {start} et {end} :
        </h3>
        <p></p>

        <div className="fr-mb-2w flex h-40 items-baseline">
          {data.map((item) => {
            const barHeight = (item.value / maxValue) * 100 // Scale the bar heights
            const barStyle = {
              height: `${barHeight}%`,
            }

            return (
              <div key={item.key} className="fr-mr-3w flex h-full items-baseline">
                <div aria-hidden className={`w-6 ${item.classes}`} style={barStyle}></div>
                <div className="fr-px-1w">
                  <span className="text-3xl font-bold">
                    {item.value.toLocaleString("fr-FR")}{" "}
                  </span>
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
        <h4 className="fr-text--md fr-mt-3w fr-mb-1v font-bold">Note de lecture</h4>
        <p className="fr-text--sm fr-mb-1w">
          De {start} à {end}, {countCdi} ont été en vigueur sur toute ou une partie de la
          période.
          <br />
          En d'autres termes, de {start} à {end}, {countCdi} ont été effectifs.
        </p>
        <p className="fr-mt-2w fr-mb-0">
          <span
            className="fr-icon-arrow-right-line fr-icon--sm"
            aria-hidden="true"
          ></span>
          Pour en savoir plus et consulter l'histogramme des effectifs, consultez la page{" "}
          <Link to={"recours-abusif"}>Recours abusif</Link>.
        </p>
      </div>
    </>
  )
}
