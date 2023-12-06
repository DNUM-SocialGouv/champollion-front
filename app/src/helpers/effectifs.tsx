import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import type { Effectif, EffectifUnit } from "../api/types"
import { formatDate } from "./date"
import { formatNumber } from "./format"

import type {
  GrayAreasInput,
  MonthData,
} from "../components/indicators/Charts/EffectifBarChart"

const xAxisFormat = "MMM YYYY"

const formatEffectifs = (
  effectifs: Effectif[],
  firstValidDate: string | null,
  lastValidDate: string | null
) =>
  effectifs.map(({ date, cdiCount, cddCount, cttCount }) => {
    let monthData: MonthData = {
      date,
      label: formatDate(date, xAxisFormat),
      name: formatDate(date, "MMMM YYYY"),
      cdd: cddCount,
      cdi: cdiCount,
      ctt: cttCount,
      isEmpty: false,
    }
    if (
      (firstValidDate && firstValidDate > date) ||
      (lastValidDate && date > lastValidDate)
    ) {
      monthData = { ...monthData, cdi: 0, cdd: 0, ctt: 0, isEmpty: true }
    }
    return monthData
  })

export const computeGrayAreasCoordinates = ({
  grayAreasData,
  brushStartDate,
  brushEndDate,
}: {
  grayAreasData: GrayAreasInput
  brushStartDate: string
  brushEndDate: string
}) => {
  /*
    The coordinates of the 2 gray areas (anterior to valid period, posterior to valid period)
    depend on the filter dates (= requested dates), the dynamic Brush period, and the validity
    dates.
  */
  const pastX1Date =
    grayAreasData.startRequestedDate && grayAreasData.startRequestedDate > brushStartDate
      ? grayAreasData.startRequestedDate
      : brushStartDate
  const pastX2Date =
    grayAreasData.lastInvalidPastMonth &&
    grayAreasData.lastInvalidPastMonth < brushEndDate
      ? grayAreasData.lastInvalidPastMonth
      : brushEndDate

  const futureX1Date =
    grayAreasData.firstInvalidFutureMonth &&
    grayAreasData.firstInvalidFutureMonth > brushStartDate
      ? grayAreasData.firstInvalidFutureMonth
      : brushStartDate
  const futureX2Date =
    grayAreasData.endRequestedDate && grayAreasData.endRequestedDate < brushEndDate
      ? grayAreasData.endRequestedDate
      : brushEndDate

  return {
    pastX1: formatDate(pastX1Date, xAxisFormat),
    pastX2: formatDate(pastX2Date, xAxisFormat),
    futureX1: formatDate(futureX1Date, xAxisFormat),
    futureX2: formatDate(futureX2Date, xAxisFormat),
  }
}

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
  { key: 1, value: "avg", label: "Nombre d'ETP-jours pour chaque mois" },
  { key: 2, value: "etp", label: "Nombre d'ETP-heures pour chaque mois" },
  { key: 3, value: "tot", label: "Nombre de contrats en vigueur chaque mois" },
]

export const unitMoreInfo: Record<string, ReactNode> = {
  avg: (
    <>
      <p className="fr-text--sm fr-mb-1v">
        La notion d'ETP-jours ne correspond pas à la définition usuelle des ETP. Pour plus
        d'informations, <Link to="/faq#faq-etp">voir la FAQ</Link>.
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
        d'informations, <Link to="/faq#faq-etp">voir la FAQ</Link>.
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
