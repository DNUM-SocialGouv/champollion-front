import { useLoaderData } from "react-router-dom"

import { getPersonalData } from "../api"
import { AppError, isAppError } from "../helpers/errors"

import { Alert } from "@codegouvfr/react-dsfr/Alert"

export async function loader() {
  const personalData = await getPersonalData()

  return personalData
}

export default function PersonalData() {
  const personalData = useLoaderData() as string | AppError

  return (
    <>
      <div className="fr-container fr-py-4w flex flex-col lg:w-3/5">
        <h1 className="fr-h2 fr-pt-4w text-center">
          Politique de conﬁdentialité – Plateforme Champollion
        </h1>
        <hr className="w-full" />

        {isAppError(personalData) ? (
          <Alert
            className="fr-mb-2w"
            description="Problème lors de la récupération de la politique de confidentialité."
            severity="error"
            title="Erreur"
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: personalData }}></div>
        )}
      </div>
    </>
  )
}
