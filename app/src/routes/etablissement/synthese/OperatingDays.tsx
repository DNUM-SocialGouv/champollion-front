import { useState } from "react"
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react"
import ls from "localstorage-slim"

import { useLoaderData } from "react-router-typesafe"
import Calendar from "react-multi-date-picker"
import colors from "react-multi-date-picker/plugins/colors"
import "../../../styles/react-multi-date-picker.css"
import { DateObject } from "react-multi-date-picker"
import { type DateType } from "react-date-object"

import { usualClosedDaysPlugin, calendarLocaleFr } from "../../../helpers/calendar"
import { minDateWithData, oneYearLater } from "../../../helpers/date"
import { OpenDay, PublicHolidaysClosed, weekendDayCodes } from "../../../helpers/format"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons"

import { SyntheseLoader } from "./SyntheseLoader"

type OperatingDaysProps = {
  publicHolidays: string[]
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

export default function OperatingDays({ publicHolidays }: OperatingDaysProps) {
  const {
    savedOpenDaysCodes,
    savedOpenDates,
    savedClosedDates,
    savedClosedPublicHolidays,
    siret,
  } = useLoaderData<typeof SyntheseLoader>()

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
