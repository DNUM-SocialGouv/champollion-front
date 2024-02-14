import { CorrectedDates } from "../helpers/contrats"

export type ModificationsBody = {
  corrected_dates?: CorrectedDates
  merged_poste_ids?: number[][]
}

export type PaginationMetaData = {
  currentPage: number | null
  nextPage: number | null
  perPage: number | null
  prevPage: number | null
  totalPages: number
  totalCount: number
}

export type IndicatorMetaData = {
  startDate: string | null
  endDate: string | null
  firstValidDate: string | null
  lastValidDate: string | null
  count?: number | null
}

export type EtablissementType = {
  id: number
  ett: boolean
  raisonSociale: string
}

export type EtablissementInfo = {
  adresse: string
  codeConventionCollective: string
  codeNaf: string
  codePostal: string
  commune: string
  complementAdresse?: string
  libelleConventionCollective?: string
  ouvert?: boolean
}

export type EtablissementDefaultPeriod = {
  startDate: string | null
  endDate: string | null
  firstValidDate: string | null
  lastValidDate: string | null
  etablissementId: number
}

export type MergedCode = 0 | 1

export type EtablissementPoste = {
  posteId: number
  libellePoste: string
  merged: MergedCode
}

export type SuggestedMergedPoste = {
  posteId: number
  libellePoste: string
}

export type CountMetadata = {
  count: number
}

export type Salarie = {
  salarieId: number
  nomFamille: string
  prenoms: string
  sexe: number
  dateNaissance: string
}

type Contrat = {
  contratId: number
  nomFamille: string | null
  nomUsage: string | null
  prenoms: string
  dateNaissance: string | null
  posteId: string | null
  libellePoste: string | null
  codeNatureContrat: string
  libelleNatureContrat: string
  dateDebut: string
  dateFin: string | null
  statutDebut: number | null
  statutFin: number | null
  codeConventionCollective: string | null
  libelleConventionCollective: string | null
  codeMotifRecours: string | null
  libelleMotifRecours: string | null
  sexe: number
  dateDerniereDeclaration: string
}

export type EtuContrat = Contrat & {
  merged: MergedCode
  ettSiret: string | null
  ettRaisonSociale: string | null
}

export type EttContrat = Contrat & {
  etuSiret: string | null
  etuRaisonSociale: string | null
  etuCodePostal: string | null
}

export type Effectif = {
  date: string
  cdiCount: number
  cddCount: number
  cttCount: number
}

export type EffectifUnit = "etp" | "tot" | "avg"

export const isEffectifUnit = (x: string): x is EffectifUnit => {
  return ["etp", "tot", "avg"].includes(x)
}

export type LastEffectif = {
  value: number
  date: string
}

export type DateRange = { startDate: string; endDate: string }

export type IllegalContract = {
  contratId: number
  nomFamille: string | null
  prenoms: string
  dateDebut: string
  dateFin: string | null
  posteId: number
  libellePoste: string
  codeMotifRecours: string | null
  libelleMotifRecours: string | null
  codeNatureContrat: string
  libelleNatureContrat: string
  ettSiret: string | null
  ettRaisonSociale: string | null
  merged: MergedCode
}

export type CarenceContract = {
  carenceId: number
  contratId: number
  nomFamille: string
  prenoms: string
  dateDebut: string
  dateFin: string | null
  posteId: number
  libellePoste: string | null
  codeMotifRecours: string | null
  libelleMotifRecours: string | null
  codeNatureContrat: string
  libelleNatureContrat: string
  ettSiret: string | null
  ettRaisonSociale: string | null
  merged: MergedCode
  codeNatureCarence: string
  dureeContrat: number
  dureeCarence: number
  dateFinCarence: string
  jourPostCarence: string
  unitCarence: string
}

export type Violation = {
  illegalContract: IllegalContract
  carenceContracts: CarenceContract[]
}

export type JobInfraction = {
  count: number
  libelle: string
  merged: MergedCode
  ratio: number
  violations: { [key: string]: Violation }
}

export type Infractions = { [key: string]: JobInfraction }

export type MetaCarences = {
  nbTotContracts: number
  nbTotIllegalContracts: number
}

export type ExternalLink = {
  key: string
  desc: string
  title: string
  href: string
  picto: string
}

export type IDCC = {
  fullTitle: string
  shortTitle: string
  idccDate?: string
  idccExtensionDate?: string
  description: {
    main: string
    details?: string[]
  }
}

export type FileExtension = "ods" | "xlsx" | "csv"

export type Indicator1 = {
  nbCdi: number
  nbCdd: number
  nbCtt: number
}

export type Indicator2 = Record<
  "cdi" | "cdd" | "ctt",
  {
    absNb: number
    relNb: number
  }
>

export type Indicator3 = Record<
  number | string,
  {
    libellePoste: string | null
    merged: number
    absNb: number
    relNb: number
  }
>

export type Indicator5 = Record<
  number | string,
  {
    libellePoste: string | null
    merged: number
    absNbCdi: number
    absNbCtt: number
    absNbCdd: number
    absNbTot: number
    relNbCdi: number
    relNbCdd: number
    relNbCtt: number
  }
>
