import dayjs from "dayjs"
import "dayjs/locale/fr"
dayjs.locale("fr")

export const minDateWithData = "2019-01-01"
export const today = dayjs().format("YYYY-MM-DD")
export const oneYearAgo = dayjs().subtract(1, "year").format("YYYY-MM-DD")
export const oneYearLater = dayjs().add(1, "year").format("YYYY-MM-DD")

export const formatDate = (date: string | dayjs.Dayjs | null, format = "DD/MM/YYYY") =>
  dayjs(date).isValid() ? dayjs(date).format(format) : ""

export const nextMonth = (date: string | null) =>
  dayjs(date).isValid() ? dayjs(date).add(1, "month") : ""
export const prevMonth = (date: string | null) =>
  dayjs(date).isValid() ? dayjs(date).subtract(1, "month") : ""

export const dateIsBefore = (
  firstDate: string | dayjs.Dayjs | null,
  secondDate: string | dayjs.Dayjs | null
) => {
  return dayjs(firstDate).isValid() && dayjs(secondDate).isValid()
    ? dayjs(firstDate).isBefore(secondDate)
    : false
}
