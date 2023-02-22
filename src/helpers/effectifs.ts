import * as dayjs from "dayjs"
import "dayjs/locale/fr"
dayjs.locale("fr")

import { Effectif, EffectifUnit } from "../api/types"
import { MonthData } from "../components/EffectifBarChart"

const formatDateToShortMonth = (date: string) => dayjs(date).format("MMM YY")
const formatDateToFullMonth = (date: string) => dayjs(date).format("MMMM YYYY")
const formatDate = (date: string, format: string) => dayjs(date).format(format)

const formatEffectifs = (effectifs: Effectif[]) =>
  effectifs.map(({ month, nbCdi, nbCdd, nbCtt }) => {
    return {
      date: month,
      label: formatDateToShortMonth(month),
      name: formatDateToFullMonth(month),
      cdd: nbCdd,
      cdi: nbCdi,
      ctt: nbCtt,
    } as MonthData
  })

const unitsOptions: {
  key: number
  value: EffectifUnit | null
  label: string
  attr?: {}
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
  unitsOptions.find((option) => String(option.key) == String(key))

export {
  formatDate,
  formatDateToShortMonth,
  formatDateToFullMonth,
  formatEffectifs,
  unitsOptions,
  getUnitOptionFromKey,
}
