import { getEtablissementType } from "../api/etablissement"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Input } from "@codegouvfr/react-dsfr/Input"
import { Notice } from "@codegouvfr/react-dsfr/Notice"
import { Form, redirect, useActionData } from "react-router-dom"
import { ActionFunctionArgs } from "react-router-dom"

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData()
    const siret = formData.get("input") ? String(formData.get("input")) : ""
    const { ett } = await getEtablissementType(siret)
    const redirectTo = ett ? `/ett/${siret}` : `/etablissement/${siret}`
    return redirect(redirectTo)
  } catch (error) {
    return error
  }
}

export default function Index() {
  const error = useActionData()

  return (
    <div className="fr-container fr-py-4w flex w-full flex-col">
      <h1 className="fr-h2 fr-pt-4w">Rechercher un établissement</h1>
      <hr />
      <div className="flex flex-col lg:w-1/2">
        <Form className="fr-pt-1w flex items-end justify-center" method="post">
          <Input
            className="w-3/4"
            hintText="Format attendu : 14 chiffres"
            label="Entrez un SIRET"
            nativeInputProps={{
              name: "input",
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
            description={error?.message}
            severity="error"
            title="Erreur"
          />
        )}
        <Notice
          isClosable
          title="Exemples de SIRET : ETT 00542012000015, établissement 21620393500012."
        />
      </div>
    </div>
  )
}
