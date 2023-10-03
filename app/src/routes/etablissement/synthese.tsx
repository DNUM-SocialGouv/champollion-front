import ls from "localstorage-slim"
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  Link,
  useAsyncValue,
  useNavigation,
} from "react-router-dom"
import { defer, useActionData, useLoaderData } from "react-router-typesafe"

import {
  getEtablissementsInfo,
  getEtablissementsType,
  postEffectifsLast,
  postIndicateur1,
  postIndicateur2,
  postIndicateur3,
} from "../../api"
import type { Indicator1, IndicatorMetaData } from "../../api/types"
import { formatCorrectedDates } from "../../helpers/contrats"
import { errorWording, isAppError } from "../../helpers/errors"
import {
  DayCode,
  formatDate,
  formatLocalMerges,
  formatLocalOpenDays,
} from "../../helpers/format"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"

import AppIndicator from "../../components/AppIndicator"
import ContractNatureIndicator from "../../components/ContractNatureIndicator"
import Deferring from "../../components/Deferring"
import EtabInfo from "../../components/EtabInfo"
import JobProportionIndicator from "../../components/JobProportionIndicator"

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const openDays = Object.keys(data)
    .filter((key) => key.includes("open-day"))
    .map((key) => data[key])
  ls.set(`etab.${params.siret}.openDays`, openDays)
  const state: CheckboxState = "success"

  return { state: state, stateRelatedMessage: "Sauvegardé" }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      status: etabType.status ?? undefined,
      statusText: etabType.messageFr ?? errorWording.etab,
    })
  }

  const etabId = etabType.id

  // Get user modifications from localStorage
  const localOpenDays = ls.get(`etab.${params.siret}.openDays`)
  const savedOpenDaysCodes = formatLocalOpenDays(localOpenDays)
  const localMergesIds = ls.get(`etab.${params.siret}.merges`) as number[][] | null
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

  const [info, lastEffectif] = await Promise.all([
    getEtablissementsInfo(etabId),
    postEffectifsLast(etabId, correctedDates),
  ])

  // AbortController to abort all deferred calls on route change
  const deferredCallsController = new AbortController()

  const headcountIndicator = postIndicateur1({
    id: etabId,
    correctedDates,
    signal: deferredCallsController.signal,
  })
  const contractNatureIndicator = postIndicateur2({
    id: etabId,
    openDaysCodes: savedOpenDaysCodes,
    correctedDates,
    signal: deferredCallsController.signal,
  })
  const jobProportionIndicator = postIndicateur3({
    id: etabId,
    openDaysCodes: savedOpenDaysCodes,
    correctedDates,
    mergedPostesIds: formattedMergesIds,
    signal: deferredCallsController.signal,
  })

  return {
    deferredCalls: defer({
      contractNatureIndicator,
      headcountIndicator,
      jobProportionIndicator,
    }),
    deferredCallsController,
    info,
    lastEffectif,
    savedOpenDaysCodes,
    siret,
  }
}

type CheckboxState = "success" | "error" | "default"

export default function EtabSynthese() {
  const {
    deferredCalls,
    deferredCallsController,
    info,
    lastEffectif,
    savedOpenDaysCodes,
    siret,
  } = useLoaderData<typeof loader>()
  const checkboxState = useActionData<typeof action>()
  const navigation = useNavigation()
  if (navigation.state === "loading") {
    deferredCallsController.abort()
  }

  const initialOpenDays: Array<{ code: DayCode; label: string; checked: boolean }> = [
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
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Chiffres clés</h2>
        <hr />
        <h3 className="fr-text--md underline underline-offset-4">Effectifs</h3>
        <Deferring deferredPromise={deferredCalls.data.headcountIndicator}>
          <HeadcountIndicator />
        </Deferring>

        <h3 className="fr-text--md underline underline-offset-4">
          Natures de contrat les plus utilisées
        </h3>
        <Deferring deferredPromise={deferredCalls.data.contractNatureIndicator}>
          <ContractNatureIndicator />
        </Deferring>

        <h3 className="fr-text--md underline underline-offset-4">
          Postes les plus occupés
        </h3>

        <Deferring deferredPromise={deferredCalls.data.jobProportionIndicator}>
          <JobProportionIndicator showLearnMore />
        </Deferring>
      </div>
    </>
  )
}

type HeadcountIndicatorDeferred = {
  headcount: Indicator1
  meta: IndicatorMetaData
}

function HeadcountIndicator() {
  const deferredData = useAsyncValue() as HeadcountIndicatorDeferred
  if (!deferredData) {
    console.error(
      "HeadcountIndicator must be used in a <Await> component but didn't receive async data"
    )
    return null
  }

  const { headcount, meta } = deferredData
  const data = [
    {
      key: "cdi",
      label: "CDI",
      value: headcount.nbCdi,
      classes:
        "bg-[var(--artwork-minor-blue-cumulus)] border border-solid border-bd-default-blue-cumulus", // add border to display a thin line when count is 0
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

  const title = `Nombre de contrats en vigueur entre ${start} et ${end} :`
  const readingNote = `De ${start} à ${end}, ${countCdi} ont été en vigueur sur toute ou une partie de la période.`
  const subReadingNote = `En d'autres termes, de ${start} à ${end}, ${countCdi} ont été effectifs.`
  const learnMore = (
    <p className="fr-mt-2w">
      <span className="fr-icon-arrow-right-line fr-icon--sm" aria-hidden="true"></span>
      Pour en savoir plus et consulter l'histogramme des effectifs, consultez la page{" "}
      <Link to={"recours-abusif"}>Recours abusif</Link>.
    </p>
  )
  return (
    <AppIndicator
      id="headcount"
      title={title}
      readingNote={readingNote}
      subReadingNote={subReadingNote}
      bottomEl={learnMore}
    >
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
    </AppIndicator>
  )
}
