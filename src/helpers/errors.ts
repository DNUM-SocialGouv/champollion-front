const isDevMode = import.meta.env.DEV

type ErrorParams = {
  field: string
  value?: string | number
}

type ApiErrorContext = {
  parameter: string
  limit_value?: number
  pattern?: string
}

type ApiError = {
  message: string
  type: string
  context: ApiErrorContext
}

export type AppError = {
  readonly isError: boolean
  code: string
  message: string
  messageFr: string
  status: number | null
}

const backendErrorFr: Record<string, (arg: ErrorParams) => string> = {
  not_found: () => `Données introuvables.`,
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
  return (x as AppError).isError
}

const isApiError = (x: unknown): x is ApiError => {
  return Boolean(
    (x as ApiError).message && (x as ApiError).type && (x as ApiError).context
  )
}

const getErrorMessage = (error: unknown) => {
  let message, messageFr
  if (isApiError(error)) {
    const params: ErrorParams = {
      field: fieldsFr[error.context.parameter] || error.context.parameter,
      value: error.context?.limit_value || error.context?.pattern,
    }

    messageFr = backendErrorFr[error?.type](params)
    message = error.message
  }

  return {
    message: message || "Unknown error",
    messageFr: messageFr || errorWording.unknown,
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
  throw new Error(`Api error: no data returned in ${endpoint}`)
}

export {
  defaultAxiosError,
  errorWording,
  getErrorMessage,
  handleEndpointError,
  handleUndefinedData,
  isAppError,
}
