import { EtablissementDefaultPeriod } from "../api/types"
import { Option } from "../components/AppMultiSelect"
import { AppError, isAppError } from "./errors"
import { getQueryAsString, oneYearAgo, today } from "./format"

export const getQueryDates = ({
  etabDefaultPeriod,
  searchParams,
}: {
  etabDefaultPeriod: AppError | EtablissementDefaultPeriod
  searchParams: URLSearchParams
}) => {
  let defaultStartDate = oneYearAgo
  let defaultEndDate = today

  if (
    !isAppError(etabDefaultPeriod) &&
    etabDefaultPeriod.startDate &&
    etabDefaultPeriod.endDate
  ) {
    defaultStartDate = etabDefaultPeriod.startDate
    defaultEndDate = etabDefaultPeriod.endDate
  }

  return {
    queryStartDate: getQueryAsString(searchParams, "debut") || defaultStartDate,
    queryEndDate: getQueryAsString(searchParams, "fin") || defaultEndDate,
  }
}

export const motiveOptions: Option[] = [
  { value: 1, label: "Remplacement d'un salarié" },
  { value: 2, label: "Accroissement temporaire d'activité" },
  { value: 3, label: "Usage / saisonnier" },
  { value: 4, label: "Autre" },
]

export const motivesCodeDict: Record<number, string[]> = {
  1: ["01", "07", "08", "12", "13"],
  2: ["02"],
  3: ["03", "04", "05"],
  4: ["06", "09", "10", "11", "14", "15"],
}

export const contractNatures = [
  { key: "cdi", code: "01", label: "CDI" },
  { key: "cdd", code: "02", label: "CDD" },
  { key: "ctt", code: "03", label: "CTT (intérim)" },
]
