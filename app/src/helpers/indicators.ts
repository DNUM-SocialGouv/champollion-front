import type { AppError } from "./errors"
import { formatDate } from "./format"

export const errorDescription = (appErrorData: AppError) => {
  if (
    appErrorData.context &&
    appErrorData.context?.start_date &&
    typeof appErrorData.context.start_date === "string" &&
    appErrorData.context?.end_date &&
    typeof appErrorData.context.end_date === "string"
  ) {
    const start = formatDate(appErrorData.context.start_date, "MMMM YYYY")
    const end = formatDate(appErrorData.context.end_date, "MMMM YYYY")
    return `Aucun contrat dans cet établissement entre ${start} et ${end}.`
  }

  return `Erreur ${appErrorData.status}`
}
