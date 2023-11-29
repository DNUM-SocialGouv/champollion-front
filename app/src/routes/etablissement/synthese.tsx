import { useEffect, useState } from "react"
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react"
import ls from "localstorage-slim"
import {
  type LoaderFunctionArgs,
  Link,
  useAsyncValue,
  useNavigation,
} from "react-router-dom"
import { defer, useLoaderData } from "react-router-typesafe"
import Calendar from "react-multi-date-picker"
import colors from "react-multi-date-picker/plugins/colors"
import "../../styles/react-multi-date-picker.css"
import { type DateType } from "react-date-object"
import { DateObject } from "react-multi-date-picker"

import {
  getEtablissementsInfo,
  getEtablissementsType,
  getPublicHolidays,
  postEffectifsLast,
  postIndicateur1,
  postIndicateur2,
  postIndicateur3,
} from "../../api"
import type { Indicator1, IndicatorMetaData } from "../../api/types"
import { usualClosedDaysPlugin, calendarLocaleFr } from "../../helpers/calendar"
import { formatCorrectedDates } from "../../helpers/contrats"
import { errorWording, isAppError } from "../../helpers/errors"
import { formatDate, minDateWithData, oneYearLater } from "../../helpers/date"
import {
  OpenDay,
  PublicHolidaysClosed,
  formatLocalClosedPublicHolidays,
  formatLocalExceptionalDates,
  formatLocalMerges,
  formatLocalOpenDays,
  weekendDayCodes,
} from "../../helpers/format"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons"

import AppIndicator from "../../components/AppIndicator"
import ContractNatureIndicator from "../../components/ContractNatureIndicator"
import Deferring from "../../components/Deferring"
import EtabInfo from "../../components/EtabInfo"
import JobProportionIndicator from "../../components/JobProportionIndicator"

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
  const localOpenDates = ls.get(`etab.${params.siret}.openDates`)
  const savedOpenDates = formatLocalExceptionalDates(localOpenDates)
  const localClosedDates = ls.get(`etab.${params.siret}.closedDates`)
  const savedClosedDates = formatLocalExceptionalDates(localClosedDates)
  const localClosedPublicHolidays = ls.get(`etab.${params.siret}.closedPublicHolidays`)
  const savedClosedPublicHolidays = formatLocalClosedPublicHolidays(
    localClosedPublicHolidays
  )
  const localMergesIds = ls.get(`etab.${params.siret}.merges`)
  const formattedMergesIds = formatLocalMerges(localMergesIds)
  const lsContrats = ls.get(`contrats.${siret}`) as Record<string, string> | null
  const correctedDates = formatCorrectedDates(lsContrats)

  const [info, lastEffectif, publicHolidays] = await Promise.all([
    getEtablissementsInfo(etabId),
    postEffectifsLast(etabId, correctedDates),
    getPublicHolidays({ startDate: minDateWithData, endDate: oneYearLater }),
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
    openDates: savedOpenDates,
    closedDates: savedClosedDates,
    closedPublicHolidays: savedClosedPublicHolidays,
    correctedDates,
    signal: deferredCallsController.signal,
  })
  const jobProportionIndicator = postIndicateur3({
    id: etabId,
    openDaysCodes: savedOpenDaysCodes,
    openDates: savedOpenDates,
    closedDates: savedClosedDates,
    closedPublicHolidays: savedClosedPublicHolidays,
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
    raisonSociale: etabType.raisonSociale,
    publicHolidays,
    savedClosedDates,
    savedClosedPublicHolidays,
    savedOpenDates,
    savedOpenDaysCodes,
    siret,
  }
}

// Multicolor plugin is not typed: custom class to add a `color` string to DateObject
// See multicolor plugin code : https://github.com/shahabyazdi/react-multi-date-picker/blob/7f11b5056f18d4ab303433afa171475a0dac8440/src/plugins/multi_colors/multi_colors.js#L38
class DateWithColor extends DateObject {
  color?: string
  constructor(date: DateType, color?: string) {
    super(date)
    this.color = color
  }
}

export default function EtabSynthese() {
  const {
    deferredCalls,
    deferredCallsController,
    info,
    lastEffectif,
    publicHolidays,
    raisonSociale,
    siret,
  } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  if (navigation.state === "loading") {
    deferredCallsController.abort()
  }

  useEffect(() => {
    document.title = `Synthèse - ${raisonSociale}`
  }, [])

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

        {isAppError(publicHolidays) ? (
          <>
            <Alert
              className="fr-mb-2w"
              description="Problème de récupération des jours fériés, ré-essayez plus tard."
              severity="error"
              title="Erreur"
            />
          </>
        ) : (
          <OperatingDays publicHolidays={publicHolidays} />
        )}

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
          <ContractNatureIndicator tracking={{ category: "Synthèse" }} />
        </Deferring>

        <h3 className="fr-text--md underline underline-offset-4">
          Postes les plus occupés
        </h3>

        <Deferring deferredPromise={deferredCalls.data.jobProportionIndicator}>
          <JobProportionIndicator showLearnMore tracking={{ category: "Synthèse" }} />
        </Deferring>
      </div>
    </>
  )
}

type OperatingDaysProps = {
  publicHolidays: string[]
}

function OperatingDays({ publicHolidays }: OperatingDaysProps) {
  const {
    savedOpenDaysCodes,
    savedOpenDates,
    savedClosedDates,
    savedClosedPublicHolidays,
    siret,
  } = useLoaderData<typeof loader>()

  const initialOpenDays: OpenDay[] = [
    { code: "1", label: "Lundi", checked: true },
    { code: "2", label: "Mardi", checked: true },
    { code: "3", label: "Mercredi", checked: true },
    { code: "4", label: "Jeudi", checked: true },
    { code: "5", label: "Vendredi", checked: true },
    { code: "6", label: "Samedi", checked: false },
    { code: "0", label: "Dimanche", checked: false },
  ]
  const closedDateColor = "blue"
  const openDateColor = "green"
  const publicHolidaysClosedData: { label: string; value: PublicHolidaysClosed }[] = [
    { label: "Oui", value: "yes" },
    { label: "Non", value: "no" },
  ]

  if (savedOpenDaysCodes && savedOpenDaysCodes.length > 0)
    initialOpenDays.forEach(
      (day) => (day.checked = savedOpenDaysCodes.includes(day.code))
    )
  const [openDays, setOpenDays] = useState(initialOpenDays)
  const [publicHolidayClosed, setPublicHolidayClosed] = useState<PublicHolidaysClosed>(
    savedClosedPublicHolidays
  )
  const [showSavedAlert, setShowSavedAlert] = useState(false)
  const [calendarProps, setCalendarProps] = useState({
    plugins: [
      colors({
        colors: [closedDateColor, openDateColor],
      }),
      usualClosedDaysPlugin({
        weekendDayCodes: weekendDayCodes(openDays),
        publicHolidaysDates: publicHolidayClosed === "yes" ? publicHolidays : undefined,
      }),
    ],
  })

  const initialClosedDates = savedClosedDates
    ? savedClosedDates
        .map((dateString) => new DateWithColor(dateString, closedDateColor))
        .filter((date) => date.isValid)
    : []

  const initialOpenDates = savedOpenDates
    ? savedOpenDates
        .map((dateString) => new DateWithColor(dateString, openDateColor))
        .filter((date) => date.isValid)
    : []

  const [selectedDates, setSelectedDates] = useState<
    DateWithColor | DateWithColor[] | null
  >([...initialClosedDates, ...initialOpenDates])

  const openDaysOptions: {
    label: ReactNode
    nativeInputProps: InputHTMLAttributes<HTMLInputElement>
  }[] = openDays.map((day) => {
    return {
      label: day.label,
      nativeInputProps: {
        name: `open-day-${day.label}`,
        defaultChecked: day.checked,
        onChange: (event) => {
          const dayCode = event.target.value
          const newOpenDays = openDays.map((day) => {
            if (day.code === dayCode) return { ...day, checked: event.target.checked }
            else return day
          })
          setOpenDays(newOpenDays)

          setCalendarProps((prev) => {
            if (Array.isArray(prev.plugins)) {
              return {
                plugins: prev.plugins.map((plugin, index) => {
                  if (index === 1)
                    return usualClosedDaysPlugin({
                      weekendDayCodes: weekendDayCodes(newOpenDays),
                      publicHolidaysDates:
                        publicHolidayClosed === "yes" ? publicHolidays : undefined,
                    })
                  else return plugin
                }),
              }
            }
            return prev
          })
        },
        value: day.code,
      },
    }
  })

  const publicHolidaysOptions = publicHolidaysClosedData.map((closed) => {
    return {
      label: closed.label,
      nativeInputProps: {
        checked: publicHolidayClosed === closed.value,
        onChange: () => {
          setPublicHolidayClosed(closed.value)

          setCalendarProps((prev) => {
            if (Array.isArray(prev.plugins)) {
              return {
                plugins: prev.plugins.map((plugin, index) => {
                  if (index === 1)
                    return usualClosedDaysPlugin({
                      weekendDayCodes: weekendDayCodes(openDays),
                      publicHolidaysDates:
                        closed.value === "yes" ? publicHolidays : undefined,
                    })
                  else return plugin
                }),
              }
            }
            return prev
          })
        },
      },
    }
  })

  const handleOperatingDays = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const openDaysCodes = openDays.filter((day) => day.checked).map((day) => day.code)
    ls.set(`etab.${siret}.openDays`, openDaysCodes)

    ls.set(`etab.${siret}.closedPublicHolidays`, publicHolidayClosed)

    const closedDates =
      selectedDates && Array.isArray(selectedDates)
        ? selectedDates
            .filter((date) => date.color === closedDateColor)
            .map((date) => date.toString())
        : null
    ls.set(`etab.${siret}.closedDates`, closedDates)

    const openDates =
      selectedDates && Array.isArray(selectedDates)
        ? selectedDates
            .filter((date) => date.color === openDateColor)
            .map((date) => date.toString())
        : null
    ls.set(`etab.${siret}.openDates`, openDates)

    setShowSavedAlert(true)
    setTimeout(() => setShowSavedAlert(false), 3000)
  }

  return (
    <>
      <form className="flex flex-col" onSubmit={handleOperatingDays}>
        <p>
          <span className="fr-icon-info-line" aria-hidden={true} />
          Les jours d'ouverture ne sont pas fournis dans les déclarations de
          l'établissement, mais sont essentiels à renseigner afin de calculer correctement
          les jours travaillés et les délais de carence.
        </p>
        <Checkbox
          legend="Jours d'ouverture habituels (jours ouvrés) :"
          options={openDaysOptions}
          orientation="horizontal"
        />

        <RadioButtons
          legend="Jours fériés habituellement chômés :"
          name="public-holidays"
          orientation="horizontal"
          options={publicHolidaysOptions}
        />
        <div>
          <p className="fr-mb-0">
            Sélectionner des jours de fermeture et d'ouverture exceptionnels de
            l'entreprise :
          </p>
          <p className="fr-mb-0 fr-text--sm italic text-tx-mention-grey">
            Ex: congés annuels, jour férié travaillé...
          </p>
          <Calendar
            currentDate={new DateObject()} // open calendar on current day
            className="dsfr-calendar"
            format="YYYY-MM-DD"
            minDate={minDateWithData}
            maxDate={oneYearLater}
            monthYearSeparator="&#8203;" // use zero-width space between month and year display
            locale={calendarLocaleFr}
            multiple
            numberOfMonths={3}
            weekStartDayIndex={1}
            value={selectedDates}
            onChange={setSelectedDates}
            sort
            {...calendarProps}
            onPropsChange={setCalendarProps}
            render={(value, openCalendar) => {
              return (
                <>
                  <Button
                    className="fr-mt-2w"
                    type="button"
                    priority="secondary"
                    onClick={openCalendar}
                  >
                    Ouvrir le calendrier
                  </Button>
                  <input type="hidden" name="closed-days" id="" value={value} />
                </>
              )
            }}
          >
            <div className="fr-px-2w fr-pb-1w text-left">
              <p className="fr-mb-1w fr-text--md">
                Veuillez cliquer sur le type de jour exceptionnel à ajouter puis
                sélectionner sur le calendrier.
              </p>
              <p className="fr-mb-0 fr-text--sm italic text-tx-mention-grey">
                Les jours de fermeture habituels définis ci-avant ne peuvent pas être
                déselectionnés. Vous pouvez <br /> les remplacer par un jour d'ouverture
                exceptionnel.
              </p>
            </div>
          </Calendar>
        </div>
        <div className="fr-mt-4w self-end">
          <Button className="fr-mt-2w" type="submit">
            Sauvegarder
          </Button>
        </div>
      </form>

      {showSavedAlert && (
        <Alert
          className="fr-my-2w"
          severity="success"
          title="Les modifications des jours d'ouverture ont bien été sauvegardées."
        />
      )}
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
      tracking={{ category: "Synthèse" }}
    >
      <div className="fr-my-2w flex h-40 items-baseline">
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
