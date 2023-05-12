import { getEtablissementsType } from "../api"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Input } from "@codegouvfr/react-dsfr/Input"
import { Notice } from "@codegouvfr/react-dsfr/Notice"
import { Form, redirect, useActionData } from "react-router-dom"
import { ActionFunctionArgs } from "react-router-dom"
import { useState } from "react"
import { AppError, isAppError } from "../helpers/errors"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const siret = formData.get("siret") ? String(formData.get("siret")) : ""
  const etabType = await getEtablissementsType(siret)

  if (!isAppError(etabType)) {
    const redirectTo = etabType.ett ? `/ett/${siret}` : `/etablissement/${siret}`
    return redirect(redirectTo)
  } else {
    return etabType
  }
}

export default function Index() {
  const error = useActionData() as AppError
  const [input, setInput] = useState("")

  return (
    <div className="fr-container fr-py-4w flex flex-col items-center lg:w-3/5">
      <h1 className="fr-h2 fr-pt-4w">Rechercher un établissement</h1>
      <hr className="w-full" />
      <div className="flex w-full flex-col ">
        <Form className="fr-pt-1w flex items-end justify-center" method="post">
          <Input
            className="w-3/4"
            hintText="Format attendu : 14 chiffres"
            label="Entrez un SIRET"
            nativeInputProps={{
              name: "siret",
              minLength: 14,
              value: input,
              onChange: (event) => setInput(event.target.value.replace(/\s/g, "")),
            }}
          />
          <Button
            priority="primary"
            size="medium"
            className="fr-mb-6v w-1/4 justify-center"
            type="submit"
          >
            Rechercher
          </Button>
        </Form>
        {!!error && (
          <Alert
            className="fr-mb-2w"
            description={error.messageFr}
            severity="error"
            title="Erreur"
          />
        )}
        <Notice
          isClosable
          title="Exemples de SIRET : ETT 33708054301162, établissement 47548331900343."
        />
      </div>
    </div>
  )
}
