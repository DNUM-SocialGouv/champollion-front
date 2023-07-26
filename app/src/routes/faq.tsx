import { useLoaderData } from "react-router-dom"

import { getFaq } from "../api"
import { AppError, isAppError } from "../helpers/errors"

import { Alert } from "@codegouvfr/react-dsfr/Alert"

export async function loader() {
  const faq = await getFaq()

  return faq
}

export default function FAQ() {
  const faq = useLoaderData() as string | AppError

  return (
    <>
      <div className="fr-container fr-py-4w flex flex-col">
        <h1 className="fr-h2 fr-pt-4w text-center">Foire Aux Questions</h1>
        <hr className="fr-mb-2w w-full" />

        {isAppError(faq) ? (
          <Alert
            className="fr-mb-2w"
            description="Problème lors de la récupération de la FAQ."
            severity="error"
            title="Erreur"
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: faq }}></div>
        )}
      </div>
    </>
  )
}
