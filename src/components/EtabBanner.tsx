import { Button } from "@codegouvfr/react-dsfr/Button"

type EtabBannerProps = {
  isEtt: boolean
  etabName: string
  siret: string
}

export default function EtabBanner({ isEtt = false, etabName, siret }: EtabBannerProps) {
  const etabType = isEtt ? "Entreprise de Travail Temporaire" : "Établissement"
  return (
    <>
      <div className="fr-container fr-my-2w">
        <Button
          iconId="fr-icon-arrow-left-line"
          priority="secondary"
          size="small"
          linkProps={{ to: ".." }}
        >
          Chercher un autre établissement
        </Button>
      </div>
      <div className="fr-py-4w w-full bg-contrast-info">
        <div className="fr-container mx-auto">
          <h1 className="fr-h3">{`${etabType} : ${etabName}`}</h1>
          <p className="fr-mb-1v">
            <span className="bold">SIRET : </span>
            {siret}
          </p>
        </div>
      </div>
      <div className="fr-mt-2w fr-container"></div>
    </>
  )
}
