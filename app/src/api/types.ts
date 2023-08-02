export type MetaData = {
  currentPage: number | null
  nextPage: number | null
  perPage: number | null
  prevPage: number | null
  totalPages: number
  totalCount: number
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
}

export type MergedCode = 0 | 1

export type EtablissementPoste = {
  posteId: number
  libellePoste: string
  merged: MergedCode
}

export type Salarie = {
  salarieId: number
  nomFamille: string
  prenoms: string
  dateNaissance: string
}

export type EtuContrat = {
  id: number
  nomFamille: string | null
  nomUsage: string | null
  prenoms: string
  dateNaissance: string | null
  posteId: string | null
  libellePoste: string
  merged: MergedCode
  codeNatureContrat: string
  libelleNatureContrat: string
  dateDebut: string
  dateFin: string | null
  statutFin: number | null
  codeConventionCollective: string | null
  libelleConventionCollective: string | null
  codeMotifRecours: string | null
  libelleMotifRecours: string | null
  ettSiret: string | null
  ettRaisonSociale: string | null
}

export type EttContrat = {
  id: number
  nomFamille: string | null
  nomUsage: string | null
  prenoms: string
  posteId: string | null
  libellePoste: string | null
  codeNatureContrat: string
  libelleNatureContrat: string
  dateDebut: string
  dateFin: string | null
  statutFin: number | null
  codeConventionCollective: string | null
  libelleConventionCollective: string | null
  codeMotifRecours: string | null
  libelleMotifRecours: string | null
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
  libelle: string
  count: number
  merged: MergedCode
  violations: { [key: string]: Violation }
}

export type Infractions = { [key: string]: JobInfraction }

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
