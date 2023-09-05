import { type PropsWithChildren, Suspense } from "react"
import { Await } from "react-router-dom"

import { errorWording, isAppError } from "../helpers/errors"
import { errorDescription } from "../helpers/indicators"

import { Alert } from "@codegouvfr/react-dsfr/Alert"

type DeferringProps = { deferredPromise: Promise<unknown> }

export default function Deferring({
  children,
  deferredPromise,
}: PropsWithChildren<DeferringProps>) {
  return (
    <Suspense fallback={AppSpinner()}>
      <Await
        resolve={deferredPromise}
        errorElement={
          <Alert
            className="fr-mb-2w"
            severity="error"
            title="Erreur"
            description={errorWording.unknown}
          />
        }
      >
        {(data) => (
          <>
            {isAppError(data) ? (
              data.code === "ERR_CANCELED" ? (
                <p className="italic text-tx-mention-grey">Chargement interrompu.</p>
              ) : (
                <Alert
                  className="fr-mb-2w"
                  severity="warning"
                  title={data.messageFr}
                  description={errorDescription(data)}
                />
              )
            ) : (
              <>{children}</>
            )}
          </>
        )}
      </Await>
    </Suspense>
  )
}

export function AppSpinner() {
  return (
    <p>
      <span className="fr-mr-1v box-border inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-bd-action-high-blue-france border-b-[transparent]"></span>
      En cours de chargement...
    </p>
  )
}
