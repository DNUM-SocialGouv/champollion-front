import { useNavigate } from "react-router-dom"
import { Button } from "@codegouvfr/react-dsfr/Button"

export default function CarenceInfractions() {
  const navigate = useNavigate()

  return (
    <>
      <h2>Infractions</h2>
      <Button onClick={() => navigate(-1)} priority="secondary" className="fr-mr-2w">
        Précédent
      </Button>
    </>
  )
}
