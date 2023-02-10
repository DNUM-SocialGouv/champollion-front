export type EtablissementType = {
  etablissementId: number
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

export type ResponseError = {
  message: string
  status?: number
}

export type EtablissementPostesList = string[]
