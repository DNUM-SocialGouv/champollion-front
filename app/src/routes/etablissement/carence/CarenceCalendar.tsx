import React, { CSSProperties, useState } from "react"
import { FormattedInfractionContracts } from "../../../helpers/carence"
import { Calendar, dayjsLocalizer } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "moment/locale/fr"
import moment from "moment"
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"

import Select, { ActionMeta, MultiValue } from "react-select"
dayjs.extend(timezone)
const localizer = dayjsLocalizer(dayjs)

interface InfractionContractsProps {
  infractions: FormattedInfractionContracts
}
interface Messages {
  week: string
  work_week: string
  day: string
  month: string
  previous: string
  next: string
  today: string
  agenda: string
  showMore: (total: number) => string
}
const messages: Messages = {
  week: "La semaine",
  work_week: "Semaine de travail",
  day: "Jour",
  month: "Mois",
  previous: "Antérieur",
  next: "Prochain",
  today: `Aujourd'hui`,
  agenda: "agenda",
  showMore: (total: number) => `+${total} plus`,
}
type Event = {
  id: string | number
  title: string
  start: Date
  end: Date
  type: string
}

const CarenceCalendar: React.FC<InfractionContractsProps> = ({ infractions }) => {
  moment.locale("fr")
  const { carenceContracts, illegalContract } = infractions
  const formatDateString = (dateString: string) =>
    moment(dateString, "DD/MM/YYYY").toDate()

  const setEndOfDay = (dateString: string) => {
    const end = moment(dateString, "DD/MM/YYYY").endOf("day").toDate()
    return end
  }

  const options = carenceContracts.map((carence) => {
    return {
      value: carence.id,
      label: carence.employee,
      start: carence.startDate,
      end: carence.endDate,
      nextPossibleDate: carence.nextPossibleDate,
    }
  })
  const [selectedOptions, setSelectedOptions] = useState(options.slice(0, 1))

  const contratsEvents = selectedOptions.map((carence) => {
    return {
      id: carence.value,
      title: `${carence.label}`,
      start: formatDateString(carence.start),
      end: setEndOfDay(carence.end),
      type: "contart",
    }
  })
  const carenceEvents = selectedOptions.map((carence) => {
    const dateDebutCarence = new Date(formatDateString(carence.end))
    dateDebutCarence.setDate(dateDebutCarence.getDate() + 1)
    return {
      id: `carence-${carence.value}`,
      title: `delai de carence pour ${carence.label}`,
      start: new Date(dateDebutCarence),
      end: setEndOfDay(carence.nextPossibleDate),
      type: "carence",
    }
  })

  const illegalEvent = {
    id: illegalContract.id,
    title: `${illegalContract.employee} `,
    start: formatDateString(illegalContract.startDate),
    end: setEndOfDay(illegalContract.endDate),
    type: "illegal",
  }

  const allEvents: Event[] = [...carenceEvents, illegalEvent, ...contratsEvents]

  interface Option {
    value: number
    label: string
    start: string
    end: string
    nextPossibleDate: string
  }

  const handleSelectChange = (
    newValue: MultiValue<Option>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    actionMeta: ActionMeta<Option>
  ) => {
    const selectedOptions = [...newValue]
    setSelectedOptions(selectedOptions)
  }
  const culture = "fr"
  const eventStyleGetter = (
    event: Event,
    _start: Date,
    _end: Date,
    _isSelected: boolean
  ): { style: CSSProperties } => {
    let style: CSSProperties = {
      fontSize: "10px",
      textAlign: "center",
      backgroundColor: "#0063cb",
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    }

    if (event.type === "illegal") {
      style = {
        ...style,
        backgroundColor: "#ffafaf",
        color: "#ce0500",
      }
    } else if (event.type === "carence") {
      style = {
        ...style,
        backgroundColor: "rgba(0, 0, 0, 0)",
        backgroundImage:
          "repeating-linear-gradient(45deg, #0063cb, #0063cb 8px, #fff 8px, #fff 20px)",
        color: "black",
      }
    }

    return { style }
  }
  return (
    <div className="myCustomHeight m-1">
      {selectedOptions.length >= 2 && (
        <>
          <h3 className="fr-text--md fr-mt-2w fr-mb-1v font-bold">Note de lecture</h3>
          <p className="fr-text--xs text-tx-mention-grey">
            Veuillez noter : Pour des raisons d'affichage optimisé sur le calendrier, il
            est possible de sélectionner au maximum 3 contrats à la fois.
          </p>
        </>
      )}
      <div>
        <div className="my-2">
          <Select
            isMulti
            name="colors"
            onChange={handleSelectChange}
            options={options}
            value={selectedOptions}
            className="basic-multi-select"
            isOptionDisabled={() => selectedOptions.length >= 2}
            classNamePrefix="select"
          />
        </div>
        <div className="py-4">
          <Calendar
            localizer={localizer}
            events={allEvents}
            defaultDate={new Date(formatDateString(carenceContracts[0].startDate))}
            style={{ height: "600px" }}
            startAccessor={"start"}
            endAccessor={"end"}
            views={["month"]}
            eventPropGetter={eventStyleGetter}
            messages={messages}
            culture={culture}
          />
        </div>
      </div>
    </div>
  )
}
export default CarenceCalendar
