import { Notice } from "@codegouvfr/react-dsfr/Notice"
import { Link } from "react-router-dom"

export default function NoticeCorrectData() {
  const text = (
    <>
      Les calculs prennent en compte des paramètres que vous pouvez corriger d'après vos
      constatations : les <Link to="../postes"> postes fusionnés</Link>, les{" "}
      <Link to="../contrats">dates des contrats</Link> et les{" "}
      <Link to="../">jours d'ouverture</Link>.
    </>
  )
  return <Notice title={text} isClosable className="fr-mb-2w" />
}
