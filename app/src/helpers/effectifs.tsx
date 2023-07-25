import { ReactNode } from "react"

import { Effectif, EffectifUnit } from "../api/types"
import { formatDate, formatNumber } from "./format"

import { MonthData } from "../components/EffectifBarChart"
import { Link } from "react-router-dom"

const formatEffectifs = (effectifs: Effectif[]) =>
  effectifs.map(({ date, cdiCount, cddCount, cttCount }) => {
    return {
      date,
      label: formatDate(date, "MMM YYYY"),
      name: formatDate(date, "MMMM YYYY"),
      cdd: cddCount,
      cdi: cdiCount,
      ctt: cttCount,
    } as MonthData
  })

const unitsOptions: {
  key: number
  value: EffectifUnit | null
  label: string
  attr?: object
}[] = [
  {
    key: 0,
    value: null,
    label: "Sélectionnez l'unité des effectifs à afficher",
    attr: { disabled: true },
  },
  { key: 1, value: "tot", label: "Nombre de contrats en vigueur chaque mois" },
  { key: 2, value: "etp", label: "Nombre d'ETP-heures pour chaque mois" },
  { key: 3, value: "avg", label: "Nombre d'ETP-jours pour chaque mois" },
]

export const unitMoreInfo: Record<string, ReactNode> = {
  avg: (
    <>
      <p className="fr-text--sm fr-mb-1v">
        La notion d'ETP-jours ne correspond pas à la définition usuelle des ETP. Pour plus
        d'informations, <Link to="/faq">voir la FAQ</Link>.
      </p>
      <p className="fr-text--sm fr-mb-1v italic">
        La notion d'ETP-jours permet d'avoir une estimation fiabilisée de l'évolution des
        effectifs mais ne doit pas être utilisée dans le cadre d'une procédure puisqu'elle
        ne se base pas sur le détail des heures travaillées.
      </p>
    </>
  ),
  etp: (
    <>
      <p className="fr-text--sm fr-mb-1v">
        La notion d'ETP-heures correspond à la définition usuelle des ETP. Pour plus
        d'informations, <Link to="/faq">voir la FAQ</Link>.
      </p>
      <p className="fr-text--sm fr-mb-1v italic">
        Les heures travaillées peuvent être mal déclarées dans la source de données
        utilisée (la Déclaration Sociale Nominative). La vérification des effectifs ETP
        indiqués ci-dessous doit être systématique pour permettre leur utilisation dans
        une procédure.
      </p>
    </>
  ),
}

const unitReadingNotes: Record<
  EffectifUnit,
  (date: string, cdi: number | string) => string
> = {
  tot: (date, cdi) => `En ${date}, pour les libellés de poste et les motifs de recours
  sélectionnés, ${cdi} CDI ont été en vigueur sur tout ou partie du mois.`,
  avg: (date, cdi) => `En ${date}, pour les libellés de poste et les motifs de recours
  sélectionnés, l'établissement a comptabilisé ${cdi} ETP-jours (Equivalent Temps Plein calculé à
  partir des jours travaillés et non des heures travaillées) en CDI.`,
  etp: (date, cdi) => `En ${date}, pour les libellés de poste et les motifs de recours
  sélectionnés, l'établissement a comptabilisé ${cdi} ETP-heures (Equivalent Temps
  Plein calculé à partir des heures travaillées) en CDI.`,
}

export const getReadingNotes = (data: MonthData, unit: EffectifUnit) => {
  const month = formatDate(data.date, "MMMM YYYY")
  const nbCdi = formatNumber(data.cdi)

  return unitReadingNotes[unit](month, nbCdi)
}

const getUnitOptionFromKey = (key: number | string) =>
  unitsOptions.find((option) => String(option.key) == String(key)) ?? unitsOptions[0]

export { formatEffectifs, unitsOptions, getUnitOptionFromKey }
