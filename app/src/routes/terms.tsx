import { useLoaderData } from "react-router-dom"

import { getTerms } from "../api"
import { AppError, isAppError } from "../helpers/errors"

import { Alert } from "@codegouvfr/react-dsfr/Alert"

export async function loader() {
  const terms = await getTerms()

  return terms
}

export default function Terms() {
  const terms = useLoaderData() as string | AppError

  return (
    <>
      <div className="fr-container fr-py-4w flex flex-col lg:w-3/5">
        <h1 className="fr-h2 fr-pt-4w text-center">Mentions légales – Champollion</h1>
        <hr className="w-full" />

        {isAppError(terms) ? (
          <Alert
            className="fr-mb-2w"
            description="Problème lors de la récupération des CGU."
            severity="error"
            title="Erreur"
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: terms }}></div>
        )}
      </div>
    </>
  )
}
