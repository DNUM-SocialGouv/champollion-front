import { useRouteError } from "react-router-dom"

export default function AppError() {
  const error: unknown = useRouteError()
  console.error(error)
  console.log("type: ", typeof error)
  const message = getErrorMessage(error)

  // All TypeScript error handling comes from:
  // https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
  // though it seems a bit heavy

  type ErrorWithMessage = {
    message: string
  }
  type ErrorWithStatusText = {
    statusText: string
  }

  function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string"
    )
  }

  function isErrorWithStatusText(error: unknown): error is ErrorWithStatusText {
    return (
      typeof error === "object" &&
      error !== null &&
      "statusText" in error &&
      typeof (error as Record<string, unknown>).statusText === "string"
    )
  }

  function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError

    try {
      return new Error(JSON.stringify(maybeError))
    } catch {
      // fallback in case there's an error stringifying the maybeError
      // like with circular references for example.
      return new Error(String(maybeError))
    }
  }

  function getErrorMessage(error: unknown) {
    if (isErrorWithStatusText(error)) return error.statusText

    return toErrorWithMessage(error).message
  }

  return (
    <div className="fr-mt-10v flex flex-col items-center justify-center">
      <h1>Oups!</h1>
      <p>Désolé, une erreur est survenue.</p>
      {message && <p>{message}</p>}
    </div>
  )
}
