import { useLoaderData } from "react-router-typesafe"

import { getLegalNotice } from "../api"
import { isAppError } from "../helpers/errors"

import { Alert } from "@codegouvfr/react-dsfr/Alert"

export async function loader() {
  const legalNotice = await getLegalNotice()

  return legalNotice
}

export default function LegalNotice() {
  const legalNotice = useLoaderData<typeof loader>()

  return (
    <>
      <div className="fr-container fr-py-4w flex flex-col lg:w-3/5">
        <h1 className="fr-h2 fr-pt-4w text-center">Mentions légales – Champollion</h1>
        <hr className="w-full" />

        {isAppError(legalNotice) ? (
          <Alert
            className="fr-mb-2w"
            description="Problème lors de la récupération des mentions legales."
            severity="error"
            title="Erreur"
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: legalNotice }}></div>
        )}
      </div>
    </>
  )
}
