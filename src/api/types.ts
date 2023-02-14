export type ResponseError = {
  message: string
  status?: number
}

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

export type EtablissementContrat = {
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
  ettEtablissementId: number | null
  ettSiret: string | null
  ettRaisonSociale: string | null
  etuEtablissementId: number | null
  etuSiret: string | null
  etuCodePostal: string | null
  etuRaisonSociale: string | null
}

export type Effectif = {
  month: string
  nbCdi: number
  nbCdd: number
  nbCtt: number
}

export type EffectifUnit = "etp" | "tot" | "ldm" | "avg"
