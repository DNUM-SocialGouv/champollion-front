import { Effectif, EffectifUnit } from "../api/types"
import { MonthData } from "../components/EffectifBarChart"
import { formatDate } from "./format"

const formatEffectifs = (effectifs: Effectif[]) =>
  effectifs.map(({ date, cdiCount, cddCount, cttCount }) => {
    return {
      date,
      label: formatDate(date, "MMM YY"),
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
  { key: 1, value: "tot", label: "Nombre total de contrats sur le mois" },
  { key: 2, value: "avg", label: "Nombre moyen mensuel de contrats" },
  { key: 3, value: "ldm", label: "Nombre de contrats au dernier jour du mois" },
  // { key: 4, value: "etp", label: "ETP (équivalent temps plein)" }, // etp not available yet from api
]

const getUnitOptionFromKey = (key: number | string) =>
  unitsOptions.find((option) => String(option.key) == String(key)) ?? unitsOptions[0]

export { formatEffectifs, unitsOptions, getUnitOptionFromKey }
