import { EtablissementInfo, LastEffectif } from "../api/types"
import { formatDateToShortMonth } from "../helpers/effectifs"

type EtabInfoProps = {
  info: EtablissementInfo
  lastEffectif: LastEffectif
  siret: string
}

export default function EtabInfo({ info, lastEffectif, siret }: EtabInfoProps) {
  const address = (
    <>
      {info.adresse}
      <br />
      {info.complementAdresse && (
        <>
          {info.complementAdresse}
          <br />
        </>
      )}
      {info.codePostal} {info.commune}
    </>
  )
  const etabInfoArr = [
    {
      label: "Adresse",
      value: address,
    },
    {
      label: "Code NAF",
      value: info.codeNaf,
    },
    {
      label: "Convention collective",
      value: `${info.codeConventionCollective} - ${info.libelleConventionCollective}`,
    },
    {
      label: "Dernier effectif déclaré (CDD et CDI)",
      value: `${lastEffectif.lastEffectif} contrats (DSN ${formatDateToShortMonth(
        lastEffectif.month
      )})`,
    },
  ]

  return (
    <>
      <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Informations sur l'établissement</h2>
      <hr />
      <div className="fr-p-2w border border-solid border-bd-default-grey bg-bg-alt-grey">
        <div className="lg:columns-2">
          {etabInfoArr.map((info) => (
            <div className="flex" key={info.label}>
              <p className="fr-text--xs w-1/3 uppercase text-tx-mention-grey">{`${info.label}\u00A0:`}</p>
              <p className="fr-pl-1w w-2/3 ">{info.value}</p>
            </div>
          ))}
        </div>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://suit.intranet.travail.gouv.fr/suit/desktop/#/etablissements/${siret}`}
        >
          Lien vers SUIT
        </a>
      </div>
    </>
  )
}
