import { Badge } from "@codegouvfr/react-dsfr/Badge"
import { AlertProps } from "@codegouvfr/react-dsfr/Alert"

type EstablishmentBannerProps = {
  isEtt: boolean
  etabName: string
  siret: string
  isOpen?: boolean
}

export default function EstablishmentBanner({
  isEtt = false,
  etabName,
  siret,
  isOpen,
}: EstablishmentBannerProps) {
  const etabSeverity: AlertProps.Severity = isOpen ? "success" : "error"
  const etabStatus: string = isOpen ? "Ouvert" : "Fermé"
  const etabType = isEtt ? "Etablissement de Travail Temporaire" : "Établissement"

  return (
    <>
      <div className="fr-pt-3w fr-pb-2w fr-mb-1v w-full bg-bg-contrast-info">
        <div className="fr-container mx-auto">
          <h1 className="fr-h4 fr-mb-3v">
            {`${etabType} : ${etabName}`}
            {isOpen != undefined && (
              <Badge className="fr-ml-3v" severity={etabSeverity} small>
                {etabStatus}
              </Badge>
            )}
          </h1>
          <p className="fr-mb-1v">
            <span className="font-bold">SIRET : </span>
            {siret}
          </p>
        </div>
      </div>
    </>
  )
}
