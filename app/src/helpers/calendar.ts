/*  This file contains helper values and functions for the react multi date picker library  */

import DateObject from "react-date-object"
import { Plugin } from "react-multi-date-picker"

export const calendarLocaleFr = {
  name: "gregorian_fr",
  months: [
    ["Janvier", "janv."],
    ["Février", "févr."],
    ["Mars", "mars"],
    ["Avril", "avr."],
    ["Mai", "mai"],
    ["Juin", "juin"],
    ["Juillet", "juill."],
    ["Août", "août"],
    ["Septembre", "sept."],
    ["Octobre", "oct."],
    ["Novembre", "nov."],
    ["Décembre", "déc."],
  ],
  weekDays: [
    ["Samedi", "sa"],
    ["Dimanche", "di"],
    ["Lundi", "lu"],
    ["Mardi", "ma"],
    ["Mercredi", "me"],
    ["Jeudi", "je"],
    ["Vendredi", "ve"],
  ],
  digits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  meridiems: [
    ["AM", "am"],
    ["PM", "pm"],
  ],
}

type usualClosedDaysArgs = {
  weekendDayCodes: number[]
  publicHolidaysDates?: string[]
}

export function usualClosedDaysPlugin({
  weekendDayCodes,
  publicHolidaysDates,
}: usualClosedDaysArgs): Plugin {
  return {
    type: "mapDays",
    fn: () =>
      function mapDays({ date }: { date: DateObject }) {
        const isWeekend = (
          Array.isArray(weekendDayCodes) ? weekendDayCodes : []
        ).includes(date.weekDay.index)
        if (isWeekend) return { closed: "true" }

        if (publicHolidaysDates && publicHolidaysDates.includes(date.toString()))
          return { closed: "true" }
      },
  }
}
