import dayjs from "dayjs"
import { Link } from "react-router-dom"
import { ReactNode } from "react"

import { EtuContrat } from "../api/types"
import { Option } from "../components/AppMultiSelect"

type FormattedContrat = {
  id: number
  employee: string
  contratType: string
  ett: ReactNode
  startDate: string
  expectedEndDate: string | null
  endDate: string | null
  motive: string | null
  conventionCode: string | null
}

type Column =
  | "employee"
  | "contratType"
  | "ett"
  | "startDate"
  | "expectedEndDate"
  | "endDate"
  | "motive"
  | "conventionCode"

type ContratsHeader = {
  key: Column
  label: string
  width: string
}

const headers = [
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "contratType", label: "Type de contrat", width: "9%" },
  { key: "ett", label: "ETT", width: "10%" },
  { key: "startDate", label: "Date de début", width: "10%" },
  { key: "expectedEndDate", label: "Date de fin prévisionnelle", width: "10%" },
  { key: "endDate", label: "Date de fin réelle", width: "10%" },
  { key: "motive", label: "Motif de recours", width: "20%" },
  { key: "conventionCode", label: "Conv. collective", width: "6%" },
] as ContratsHeader[]

const formatDate = (date: string | null) =>
  dayjs(date).isValid() ? dayjs(date).format("DD/MM/YYYY") : ""

const contratTypeShort = [
  { code: "01", label: "CDI" },
  { code: "02", label: "CDD" },
  { code: "03", label: "CTT" },
]
const formatContrats = (items: EtuContrat[]) =>
  items.map((contrat) => {
    const ett =
      contrat.codeNatureContrat !== "03" ? (
        <p>n/a</p>
      ) : contrat.ettSiret ? (
        <Link to={`/ett/${contrat.ettSiret}`}>{contrat.ettRaisonSociale}</Link>
      ) : (
        <></>
      )
    const motive =
      contrat.codeNatureContrat === "01" ? "n/a" : contrat.libelleMotifRecours
    return {
      id: contrat.id,
      employee: `${contrat.prenoms} ${contrat.nomFamille}`,
      contratType:
        contratTypeShort.find((item) => item.code === contrat.codeNatureContrat)?.label ||
        "Autre",
      ett,
      startDate: formatDate(contrat.dateDebut),
      expectedEndDate: formatDate(contrat.dateFinPrevisionnelle),
      endDate: formatDate(contrat.dateFin),
      motive,
      conventionCode: contrat.codeConventionCollective,
    } as FormattedContrat
  })

const getQueryPostes = (searchParams: URLSearchParams) =>
  decodeURIComponent(searchParams.get("postes") ?? "")
const getQueryPage = (searchParams: URLSearchParams) =>
  parseInt(searchParams.get("page") || "1")

const getPostesOptionsFromQuery = (queryPostes: string, options: Option[]) =>
  queryPostes
    .split(",")
    .map((poste) => options.find((option) => option.label === poste) || ({} as Option))
    .filter((option) => Object.keys(option).length > 0)

export {
  formatContrats,
  getPostesOptionsFromQuery,
  getQueryPage,
  getQueryPostes,
  headers,
}
