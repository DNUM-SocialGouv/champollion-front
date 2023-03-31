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

export type EtablissementPoste = {
  id: number
  libelle: string
}

export type EtuContrat = {
  id: number
  nomFamille: string | null
  nomUsage: string | null
  prenoms: string
  posteId: string | null
  libellePoste: string | null
  codeNatureContrat: string
  libelleNatureContrat: string
  dateDebut: string
  dateFinPrevisionnelle: string | null
  dateFin: string | null
  codeConventionCollective: string
  libelleConventionCollective: string
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
  dateFinPrevisionnelle: string | null
  dateFin: string | null
  codeConventionCollective: string
  libelleConventionCollective: string
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

export type EffectifUnit = "etp" | "tot" | "ldm" | "avg"

export type LastEffectif = {
  value: number
  date: string
}
