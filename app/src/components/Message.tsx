import { Notice } from "@codegouvfr/react-dsfr/Notice"
import React from "react"
import getConfig from "../constants"

const InfoText = () => (
  <>
    Vous consultez le site de développement de l’application VISUDSN. Ici, vous ne
    trouverez que des informations de tests, sans valeur pour vos travaux d’analyse. Pour
    consulter les données des entreprises issues de la base DSN merci de vous{" "}
    <a href="visudsn.pp.intranet.travail.gouv.fr">connecter ici</a>
  </>
)

const MessageComponent: React.FC = () => {
  if (getConfig() === "visudsn.dev.intranet.travail.gouv.fr") {
    return <Notice classes={{ title: "font-normal" }} title={<InfoText />} isClosable />
  }
  return null
}

export default MessageComponent
