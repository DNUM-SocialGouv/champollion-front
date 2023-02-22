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
      <div className="fr-pt-3w fr-pb-2w fr-mb-1v w-full bg-bg-contrast-info">
        <div className="fr-container mx-auto">
          <h1 className="fr-h4 fr-mb-3v">{`${etabType} : ${etabName}`}</h1>
          <p className="fr-mb-1v">
            <span className="font-bold">SIRET : </span>
            {siret}
          </p>
        </div>
      </div>
    </>
  )
}
