import type { IllegalContract, Infractions, CarenceContract, IDCC } from "../api/types"
import { getContractNature } from "./contrats"
import { formatDate } from "./date"

export type FormattedCarenceContract = {
  id: number
  employee: string
  startDate: string
  endDate: string
  delay: string
  nextPossibleDate: string
  motive: string | null
  nature: string
}

type FormattedIllegalContract = {
  id: number
  jobTitle: string
  employee: string
  startDate: string
  endDate: string
}

export type FormattedInfractionContracts = {
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
  return {
    id: contract.contratId,
    jobTitle: contract.libellePoste,
    employee: `${contract.prenoms} ${contract.nomFamille}`,
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
      employee: `${contract.prenoms} ${contract.nomFamille}`,
      startDate: formatDate(contract.dateDebut),
      endDate: formatDate(contract.dateFin),
      delay: `${contract.dureeCarence} ${unitCarence[contract.unitCarence]}`,
      nextPossibleDate: formatDate(contract.jourPostCarence),
      motive: contract.libelleMotifRecours,
      nature: getContractNature(contract.codeNatureContrat),
    }
  })
}

export const legislationDetails = (data: Record<string, IDCC>) => {
  return Object.entries(data).map(([key, value]) => ({ key, ...value }))
}

export const legislationOptions = (data: Record<string, IDCC>) => {
  return Object.entries(data).map(([key, value], index) => ({
    key: index,
    label: value.shortTitle,
    value: key,
  }))
}

export const getLegislationOptionFromKey = (
  key: number | string,
  data: Record<string, IDCC>
) =>
  legislationOptions(data).find((option) => String(option.key) == String(key)) ??
  legislationOptions(data)[0]
