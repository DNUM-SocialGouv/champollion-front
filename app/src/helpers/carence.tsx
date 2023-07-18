import { IllegalContract, Infractions, CarenceContract } from "../api/types"
import { getContractType } from "./contrats"
import { formatDate } from "./format"

export type FormattedCarenceContract = {
  id: number
  employee: string
  startDate: string
  endDate: string
  delay: string
  nextPossibleDate: string
  motive: string | null
  contractType: string
}

type FormattedIllegalContract = {
  id: number
  jobTitle: string
  employee: string
  startDate: string
  endDate: string
}

type FormattedInfractionContracts = {
  illegalContract: FormattedIllegalContract
  carenceContracts: FormattedCarenceContract[]
}

export type FormattedInfraction = {
  jobId: number
  jobTitle: string
  count: number
  merged: number
  list: FormattedInfractionContracts[]
}

const unitCarence: Record<string, string> = {
  jours_calendaires: "jours calendaires",
  jours_ouvres: "jours ouvrés",
}

export const formatInfractions = (infractions: Infractions): FormattedInfraction[] => {
  return Object.entries(infractions).map(([jobId, infraction]) => {
    const { libelle: jobTitle, count, merged, violations: list } = infraction
    const formattedList = Object.values(list).map(
      (posteInfraction): FormattedInfractionContracts => {
        return {
          illegalContract: formatIllegalContract(posteInfraction.illegalContract),
          carenceContracts: formatCarenceContracts(posteInfraction.carenceContracts),
        }
      }
    )

    return { jobId: Number(jobId), jobTitle, count, merged, list: formattedList }
  })
}

const formatIllegalContract = (contract: IllegalContract): FormattedIllegalContract => {
  let employee = `${contract.prenoms} ${contract.nomFamille?.toUpperCase()}`
  if (contract.civilite) employee = contract.civilite + " " + employee

  return {
    id: contract.contratId,
    jobTitle: contract.libellePoste,
    employee,
    startDate: formatDate(contract.dateDebut),
    endDate: formatDate(contract.dateFin),
  }
}

const formatCarenceContracts = (
  previousContracts: CarenceContract[]
): FormattedCarenceContract[] => {
  return previousContracts.map((contract): FormattedCarenceContract => {
    return {
      id: contract.carenceId,
      employee: `${contract.prenoms} ${contract.nomFamille?.toUpperCase()}`,
      startDate: formatDate(contract.dateDebut),
      endDate: formatDate(contract.dateFin),
      delay: `${contract.dureeCarence} ${unitCarence[contract.unitCarence]}`,
      nextPossibleDate: formatDate(contract.jourPostCarence),
      motive: contract.libelleMotifRecours,
      contractType: getContractType(contract.codeNatureContrat),
    }
  })
}

export const legislationOptions: {
  key: number
  value: string | null
  label: string
}[] = [
  {
    key: 1,
    value: "droit_commun",
    label: "Dispositions supplétives (pas d'accord de branche)",
  },
  { key: 2, value: "idcc_3248_2018", label: "IDCC 3248 - 2018 (2018) - Métallurgie" },
  {
    key: 3,
    value: "idcc_2216_2018",
    label: "IDCC 2216 - 2018 (2020) - Commerce alimentaire",
  },
  {
    key: 4,
    value: "idcc_3043_2018",
    label: "IDCC 3043 - 2018 (2019) - Entreprises de propreté",
  },
  {
    key: 5,
    value: "idcc_1517_2021",
    label: "IDCC 1517 -2021 (2022) - Commerces non alimentaires",
  },
  {
    key: 6,
    value: "idcc_176_2019",
    label: "IDCC 176 - 2019 (2020) - Industrie pharmaceutique",
  },
  // { key: 3, value: "etp", label: "ETP (équivalent temps plein)" }, // etp not available yet from api
]

export const getLegislationOptionFromKey = (key: number | string) =>
  legislationOptions.find((option) => String(option.key) == String(key)) ??
  legislationOptions[0]
