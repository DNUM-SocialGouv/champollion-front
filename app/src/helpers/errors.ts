import { formatDate } from "./format"

const isDevMode = import.meta.env.DEV

type ErrorParams = {
  field?: string
  value?: string | number
}

type ApiErrorContext = {
  parameter: string
  limit_value?: number
  pattern?: string
  poste_ids?: number[]
} & Record<string, string | number | string[] | number[]>

type ApiError = {
  message: string
  type: string
  context: ApiErrorContext | null
}

export type AppError = {
  readonly isError: boolean
  code: string
  context?: ApiErrorContext
  message: string
  messageFr: string
  status: number | null
  type?: string
}

const backendErrorFr: Record<string, (arg: ErrorParams) => string> = {
  not_found: () => `Données introuvables.`,
  "bad_request.duplicated_merged_postes": () =>
    "Vous ne pouvez pas sélectionner un même libellé dans des fusions de poste différentes.",
  "bad_request.end_before_start": () => "La date de fin est avant la date de début.",
  "bad_request.exceed_valid_period": () =>
    "Vos dates dépassent la période sur laquelle nous disposons de données sur l'établissement.",
  "forbidden.too_many_contracts_requested": () =>
    "Votre demande concerne un trop grand nombre de contrats, ce qui entraîne un temps de calcul excessif. Veuillez ajouter des filtres pour réduire le nombre de contrats à analyser.",
  "not_found.empty_contracts": () => "La liste de contrats est vide pour ces paramètres.",
  "not_found.no_worked_days": () => "Il n'y a aucun jour travaillé pour ces paramètres.",
  "type_error.integer": ({ field }: ErrorParams) =>
    `Le champ ${field} doit être un nombre.`,
  "value_error.any_str.max_length": ({ field, value }: ErrorParams) =>
    `Le champ ${field} doit contenir au maximum ${value} caractères.`,
  "value_error.any_str.min_length": ({ field, value }: ErrorParams) =>
    `Le champ ${field} doit contenir au minimum ${value} caractères.`,
  "value_error.str.regex": ({ field }: ErrorParams) =>
    `Le champ ${field} ne correspond pas au format requis.`,
  "value_error.date": ({ field }: ErrorParams) =>
    `Le champ ${field} doit être une date valide.`,
  "value_error.missing": ({ field }: ErrorParams) =>
    `Le champ ${field} doit être complété.`,
}

const fieldsFr: Record<string, string> = {
  unit: "unité",
  siret: "SIRET",
}

const errorWording = {
  unknown: "Une erreur inconnue est survenue.",
  errorOccurred: "Une erreur est survenue.",
  etab: "Une erreur est survenue sur cet établissement.",
}

const defaultAxiosError: AppError = {
  isError: true,
  code: "unknown",
  messageFr: errorWording.unknown,
  message: "Default error msg",
  status: null,
}

const isAppError = (x: unknown): x is AppError => {
  return (x as AppError)?.isError
}

const isApiError = (x: unknown): x is ApiError => {
  return Boolean(
    x &&
      typeof x === "object" &&
      "message" in (x as ApiError) &&
      "type" in (x as ApiError) &&
      "context" in (x as ApiError)
  )
}

const getErrorMessage = (error: unknown) => {
  let message, messageFr
  if (error && typeof error === "object" && "message" in error) {
    message = (error as { message: string }).message
  }
  if (error && typeof error === "object" && "messageFr" in error) {
    messageFr = (error as { messageFr: string }).messageFr
  }

  if (isApiError(error)) {
    const params: ErrorParams = {
      field: error.context
        ? fieldsFr[error.context.parameter] || error.context.parameter
        : undefined,
      value: error.context?.limit_value || error.context?.pattern,
    }
    messageFr =
      error?.type && !!backendErrorFr[error?.type] && backendErrorFr[error?.type](params)
    message = error.message
  }

  return {
    message: message || "Unknown error",
    messageFr: messageFr || errorWording.unknown,
  }
}

export const errorDescription = (appErrorData: AppError) => {
  const { context, type } = appErrorData

  switch (type) {
    case "not_found.empty_contracts":
      if (
        context &&
        context?.start_date &&
        context?.end_date &&
        typeof context.start_date === "string" &&
        typeof context.end_date === "string"
      ) {
        const start = formatDate(context.start_date, "MMMM YYYY")
        const end = formatDate(context.end_date, "MMMM YYYY")
        return `Aucun contrat dans cet établissement entre ${start} et ${end}.`
      }
      break

    case "bad_request.exceed_valid_period":
      if (
        context &&
        context?.first_valid_date &&
        context?.last_valid_date &&
        typeof context.first_valid_date === "string" &&
        typeof context.last_valid_date === "string"
      ) {
        const start = formatDate(context.first_valid_date, "MMMM YYYY")
        const end = formatDate(context.last_valid_date, "MMMM YYYY")
        return `Veuillez sélectionner des dates entre ${start} et ${end}.`
      }
      break

    default:
      return `Erreur ${appErrorData.status}`
  }
}

const handleEndpointError = (err: unknown) => {
  if (isAppError(err)) {
    return err
  }

  if (isDevMode) console.warn("Not axios error in api call.", err)

  return { ...defaultAxiosError, message: String(err) }
}

const handleUndefinedData = (endpoint: string) => {
  throw new Error(`Api error: no data (or meta) returned in ${endpoint}`)
}

export {
  defaultAxiosError,
  errorWording,
  getErrorMessage,
  handleEndpointError,
  handleUndefinedData,
  isAppError,
}
