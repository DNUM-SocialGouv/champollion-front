import { useLoaderData } from "react-router-typesafe"

import { getCgu } from "../api"
import { isAppError } from "../helpers/errors"

import { Alert } from "@codegouvfr/react-dsfr/Alert"

export async function loader() {
  const cgu = await getCgu()

  return cgu
}

export default function CGU() {
  const cgu = useLoaderData<typeof loader>()

  return (
    <>
      <div className="fr-container fr-py-4w flex flex-col lg:w-3/5">
        <h1 className="fr-h2 fr-pt-4w text-center">
          Conditions Générales d'Utilisation – Champollion
        </h1>
        <hr className="w-full" />
        {isAppError(cgu) ? (
          <Alert
            className="fr-mb-2w"
            description="Problème lors de la récupération des CGU."
            severity="error"
            title="Erreur"
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: cgu }}></div>
        )}
      </div>
    </>
  )
}
