import { EtuContrat } from "../api/types"
import { getContractType } from "./contrats"
import { formatDate } from "./format"

type PreviousContractWithDelay = {
  id: number
  nomFamille: string | null
  nomUsage: string | null
  prenoms: string
  posteId: string | null
  libellePoste: string
  codeNatureContrat: string
  libelleNatureContrat: string
  dateDebut: string
  statutFin: number | null
  dateFin: string | null
  codeConventionCollective: string | null
  libelleConventionCollective: string | null
  codeMotifRecours: string | null
  libelleMotifRecours: string | null
  ettSiret: string | null
  ettRaisonSociale: string | null
  delaiCarenceJours: number
  prochaineDatePossible: string
}

type InfractionContracts = {
  contract: EtuContrat
  previousContracts: PreviousContractWithDelay[]
}

type Infraction = {
  jobTitle: string
  count: number
  list: InfractionContracts[]
}

export type FormattedPreviousContractWithDelay = {
  id: number
  employee: string
  startDate: string
  endDate: string
  delay: string
  nextPossibleDate: string
  motive: string | null
  contractType: string
}

type FormattedContractInInfraction = {
  id: number
  jobTitle: string
  employee: string
  startDate: string
  endDate: string
}

type FormattedInfractionContracts = {
  contract: FormattedContractInInfraction
  previousContracts: FormattedPreviousContractWithDelay[]
}

type FormattedInfraction = {
  jobTitle: string
  count: number
  list: FormattedInfractionContracts[]
}

export const formatInfractions = (infractions: Infraction[]): FormattedInfraction[] => {
  return infractions.map((infraction) => {
    const { jobTitle, count, list } = infraction
    const formattedList = list.map((posteInfraction): FormattedInfractionContracts => {
      return {
        contract: formatContractInInfraction(posteInfraction.contract),
        previousContracts: formatPreviousContracts(posteInfraction.previousContracts),
      }
    })

    return { jobTitle, count, list: formattedList }
  })
}

const formatContractInInfraction = (
  contract: EtuContrat
): FormattedContractInInfraction => {
  let employee = `${contract.prenoms} ${contract.nomFamille?.toUpperCase()}`
  if (contract.civilite) employee = contract.civilite + " " + employee

  return {
    id: contract.id,
    jobTitle: contract.libellePoste,
    employee,
    startDate: formatDate(contract.dateDebut),
    endDate: formatDate(contract.dateFin),
  }
}

const formatPreviousContracts = (
  previousContracts: PreviousContractWithDelay[]
): FormattedPreviousContractWithDelay[] => {
  return previousContracts.map((contract): FormattedPreviousContractWithDelay => {
    return {
      id: contract.id,
      employee: `${contract.prenoms} ${contract.nomFamille?.toUpperCase()}`,
      startDate: formatDate(contract.dateDebut),
      endDate: formatDate(contract.dateFin),
      delay: `${contract.delaiCarenceJours} jours`,
      nextPossibleDate: formatDate(contract.prochaineDatePossible),
      motive: contract.libelleMotifRecours,
      contractType: getContractType(contract.codeNatureContrat),
    }
  })
}

//mock api result
export const infractions: Infraction[] = [
  {
    jobTitle: "Cariste Manut.",
    count: 4,
    list: [
      {
        contract: {
          id: 35,
          nomFamille: "Guerald",
          nomUsage: null,
          prenoms: "Javier",
          posteId: null,
          libellePoste: "Cariste Manut.",
          codeNatureContrat: "02",
          libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
          dateDebut: "2022-01-15",
          statutFin: null,
          dateFin: "2022-05-16",
          codeConventionCollective: null,
          libelleConventionCollective: null,
          codeMotifRecours: "02",
          libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
          ettSiret: null,
          ettRaisonSociale: null,
        },
        previousContracts: [
          {
            id: 60,
            nomFamille: "Louisa",
            nomUsage: null,
            prenoms: "Quentin",
            posteId: null,
            libellePoste: "Cariste Manut.",
            codeNatureContrat: "02",
            libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
            dateDebut: "2020-11-25",
            statutFin: 2,
            dateFin: "2022-01-07",
            codeConventionCollective: "0003",
            libelleConventionCollective:
              "Convention collective nationale des ouvriers de la navigation intérieure de marchandises",
            codeMotifRecours: "02",
            libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
            ettSiret: null,
            ettRaisonSociale: null,
            delaiCarenceJours: 70,
            prochaineDatePossible: "2022-04-04",
          },
        ],
      },
      {
        contract: {
          id: 33,
          nomFamille: "Michel",
          nomUsage: null,
          prenoms: "Louis",
          posteId: null,
          libellePoste: "Cariste Manut.",
          codeNatureContrat: "02",
          libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
          dateDebut: "2022-02-15",
          statutFin: null,
          dateFin: "2022-06-05",
          codeConventionCollective: null,
          libelleConventionCollective: null,
          codeMotifRecours: "02",
          libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
          ettSiret: null,
          ettRaisonSociale: null,
        },
        previousContracts: [
          {
            id: 60,
            nomFamille: "Louisa",
            nomUsage: null,
            prenoms: "Quentin",
            posteId: null,
            libellePoste: "Cariste Manut.",
            codeNatureContrat: "02",
            libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
            dateDebut: "2020-11-25",
            statutFin: 1,
            dateFin: "2022-01-07",
            codeConventionCollective: "0003",
            libelleConventionCollective:
              "Convention collective nationale des ouvriers de la navigation intérieure de marchandises",
            codeMotifRecours: "02",
            libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
            ettSiret: null,
            ettRaisonSociale: null,
            delaiCarenceJours: 70,
            prochaineDatePossible: "2022-04-04",
          },
        ],
      },
      {
        contract: {
          id: 39,
          nomFamille: "Louisa",
          nomUsage: null,
          prenoms: "Quentin",
          posteId: null,
          libellePoste: "Cariste Manut.",
          codeNatureContrat: "02",
          libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
          dateDebut: "2022-02-15",
          statutFin: null,
          dateFin: "2022-09-05",
          codeConventionCollective: null,
          libelleConventionCollective: null,
          codeMotifRecours: "02",
          libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
          ettSiret: null,
          ettRaisonSociale: null,
        },
        previousContracts: [
          {
            id: 60,
            nomFamille: "Louisa",
            nomUsage: null,
            prenoms: "Quentin",
            posteId: null,
            libellePoste: "Cariste Manut.",
            codeNatureContrat: "02",
            libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
            dateDebut: "2020-11-25",
            statutFin: 1,
            dateFin: "2022-01-07",
            codeConventionCollective: "0003",
            libelleConventionCollective:
              "Convention collective nationale des ouvriers de la navigation intérieure de marchandises",
            codeMotifRecours: "02",
            libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
            ettSiret: null,
            ettRaisonSociale: null,
            delaiCarenceJours: 70,
            prochaineDatePossible: "2022-04-04",
          },
        ],
      },
      {
        contract: {
          id: 37,
          nomFamille: "Maneyrt",
          nomUsage: null,
          prenoms: "Pierre",
          posteId: null,
          libellePoste: "Cariste Manut.",
          codeNatureContrat: "02",
          libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
          dateDebut: "2022-06-15",
          statutFin: null,
          dateFin: "2022-12-05",
          codeConventionCollective: null,
          libelleConventionCollective: null,
          codeMotifRecours: "02",
          libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
          ettSiret: null,
          ettRaisonSociale: null,
        },
        previousContracts: [
          {
            id: 35,
            nomFamille: "Guerald",
            nomUsage: null,
            prenoms: "Javier",
            posteId: null,
            libellePoste: "Cariste Manut.",
            codeNatureContrat: "02",
            libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
            dateDebut: "2022-01-15",
            statutFin: null,
            dateFin: "2022-05-16",
            codeConventionCollective: null,
            libelleConventionCollective: null,
            codeMotifRecours: "02",
            libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
            ettSiret: null,
            ettRaisonSociale: null,
            delaiCarenceJours: 26,
            prochaineDatePossible: "2022-06-16",
          },
          {
            id: 33,
            nomFamille: "Michel",
            nomUsage: null,
            prenoms: "Louis",
            posteId: null,
            libellePoste: "Cariste Manut.",
            codeNatureContrat: "02",
            libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
            dateDebut: "2022-02-15",
            statutFin: null,
            dateFin: "2022-06-05",
            codeConventionCollective: null,
            libelleConventionCollective: null,
            codeMotifRecours: "02",
            libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
            ettSiret: null,
            ettRaisonSociale: null,
            delaiCarenceJours: 22,
            prochaineDatePossible: "2022-07-10",
          },
        ],
      },
    ],
  },
  // {
  //   jobTitle: "Inventoriste",
  //   count: 2,
  //   list: [
  //     {
  //       contract: {
  //         id: 35,
  //         nomFamille: "Guerald",
  //         nomUsage: null,
  //         prenoms: "Javier",
  //         posteId: null,
  //         libellePoste: "Cariste Manut.",
  //         codeNatureContrat: "02",
  //         libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
  //         dateDebut: "2022-01-15",
  //         statutFin: null,
  //         dateFin: "2022-05-16",
  //         codeConventionCollective: null,
  //         libelleConventionCollective: null,
  //         codeMotifRecours: "02",
  //         libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
  //         ettSiret: null,
  //         ettRaisonSociale: null,
  //       },
  //       previousContracts: [
  //         {
  //           id: 60,
  //           nomFamille: "Louisa",
  //           nomUsage: null,
  //           prenoms: "Quentin",
  //           posteId: null,
  //           libellePoste: "Cariste Manut.",
  //           codeNatureContrat: "02",
  //           libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
  //           dateDebut: "2020-11-25",
  //           statutFin: 2,
  //           dateFin: "2022-01-07",
  //           codeConventionCollective: "0003",
  //           libelleConventionCollective:
  //             "Convention collective nationale des ouvriers de la navigation intérieure de marchandises",
  //           codeMotifRecours: "02",
  //           libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
  //           ettSiret: null,
  //           ettRaisonSociale: null,
  //           delaiCarenceJours: 70,
  //           prochaineDatePossible: "2022-04-04",
  //         },
  //       ],
  //     },
  //     {
  //       contract: {
  //         id: 33,
  //         nomFamille: "Michel",
  //         nomUsage: null,
  //         prenoms: "Louis",
  //         posteId: null,
  //         libellePoste: "Cariste Manut.",
  //         codeNatureContrat: "02",
  //         libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
  //         dateDebut: "2022-02-15",
  //         statutFin: null,
  //         dateFin: "2022-06-05",
  //         codeConventionCollective: null,
  //         libelleConventionCollective: null,
  //         codeMotifRecours: "02",
  //         libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
  //         ettSiret: null,
  //         ettRaisonSociale: null,
  //       },
  //       previousContracts: [
  //         {
  //           id: 60,
  //           nomFamille: "Louisa",
  //           nomUsage: null,
  //           prenoms: "Quentin",
  //           posteId: null,
  //           libellePoste: "Cariste Manut.",
  //           codeNatureContrat: "02",
  //           libelleNatureContrat: "Contrat de travail à durée déterminée de droit privé",
  //           dateDebut: "2020-11-25",
  //           statutFin: 2,
  //           dateFin: "2022-01-07",
  //           codeConventionCollective: "0003",
  //           libelleConventionCollective:
  //             "Convention collective nationale des ouvriers de la navigation intérieure de marchandises",
  //           codeMotifRecours: "02",
  //           libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
  //           ettSiret: null,
  //           ettRaisonSociale: null,
  //           delaiCarenceJours: 70,
  //           prochaineDatePossible: "2022-04-04",
  //         },
  //       ],
  //     },
  //   ],
  // },
]
