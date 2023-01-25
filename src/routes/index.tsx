import React, { useState } from "react"
import { getEtablissementType } from "../api/etablissement"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Input } from "@codegouvfr/react-dsfr/Input"

export type AlertSeverity = "success" | "warning" | "info" | "error" | null

export default function Index() {
  const [input, setInput] = useState("")
  const [requestState, setRequestState] = useState<AlertSeverity>(null)
  const [requestMessage, setRequestMessage] = useState("")

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setInput(event.target.value)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleClick()
  }
  const handleClick = () => {
    getEtablissementType(input)
      .then((response) => {
        setRequestState("success")
        setRequestMessage(JSON.stringify(response))
      })
      .catch((err) => {
        setRequestState("error")
        setRequestMessage(err?.message)
      })
  }

  return (
    <div className="fr-container fr-py-4w flex w-full flex-col">
      <h1 className="fr-h2 fr-pt-4w">Rechercher un établissement</h1>
      <hr />
      <div className="flex flex-col lg:w-1/2">
        <div className="fr-pt-1w flex items-end justify-center">
          <Input
            className="w-3/4"
            hintText="Format attendu : 14 chiffres, e.g. 00542012000015."
            label="Entrez un SIRET"
            nativeInputProps={{
              name: input,
              onChange: handleInputChange,
              onKeyDown: handleKeyDown,
            }}
          />
          <Button
            onClick={handleClick}
            priority="primary"
            size="medium"
            className="fr-mb-6v w-1/4 justify-center"
            type="button"
          >
            Rechercher
          </Button>
        </div>
        {!!requestState && (
          <Alert
            description={requestMessage}
            severity={requestState}
            title={requestState}
          />
        )}
      </div>
    </div>
  )
}
