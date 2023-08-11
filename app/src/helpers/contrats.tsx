import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react"
import { Link } from "react-router-dom"
import ls from "localstorage-slim"

import { formatDate } from "./format"
import type { EtuContrat, FileExtension } from "../api/types"

import { AlertProps } from "@codegouvfr/react-dsfr/Alert"
import { Badge } from "@codegouvfr/react-dsfr/Badge"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Input } from "@codegouvfr/react-dsfr/Input"

type FormattedContrat = {
  id: number
  jobTitle: string | ReactNode
  employee: string
  startDate: ReactNode
  endDate: ReactNode
  contractType: string
  motive: string | null
  ett: ReactNode
  conventionCode: string | null
}

type DateType = "start" | "end"

type Column =
  | "jobTitle"
  | "employee"
  | "startDate"
  | "endDate"
  | "contractType"
  | "motive"
  | "ett"
  | "conventionCode"

export type ContratsHeader<Column> = {
  key: Column
  label: string
  width: string
}

const headers = [
  { key: "jobTitle", label: "Poste", width: "15%" },
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "startDate", label: "Date de début", width: "15%" },
  { key: "endDate", label: "Date de fin", width: "15%" },
  { key: "contractType", label: "Nature contrat", width: "5%" },
  { key: "motive", label: "Motif de recours", width: "15%" },
  { key: "ett", label: "ETT", width: "15%" },
  { key: "conventionCode", label: "Conv. collective", width: "5%" },
] as ContratsHeader<Column>[]

const contractTypeShort = [
  { code: "01", label: "CDI" },
  { code: "02", label: "CDD" },
  { code: "03", label: "CTT" },
]

const getContractType = (contractCode: string) =>
  contractTypeShort.find((item) => item.code === contractCode)?.label || "Autre"

export type DateStatus = "declared" | "computed" | "validated" | "unknown"

export type EditableDate = {
  date: string | null
  status: DateStatus
  isEdit: boolean
}

export type ContratDatesState = {
  id: number
  end: EditableDate
  start: EditableDate
}

const statusBadgeData: Record<
  DateStatus,
  { severity?: AlertProps.Severity; text: string }
> = {
  declared: { severity: "info", text: "déclaré" },
  computed: { severity: "warning", text: "inféré" },
  validated: { severity: "success", text: "corrigé" },
  unknown: { text: "inconnu" },
}

const formatContrats = (
  items: EtuContrat[],
  contratsDatesState: ContratDatesState[],
  setContratsDatesState: Dispatch<SetStateAction<ContratDatesState[]>>,
  siret: string
) => {
  if (Array.isArray(items) && items.length > 0)
    return items.map((contrat): FormattedContrat => {
      const jobTitle = (
        <>
          {contrat.libellePoste}
          <JobMergedBadge merged={Boolean(contrat.merged)} short />
        </>
      )
      const ett =
        contrat.codeNatureContrat !== "03" ? (
          <p>n/a</p>
        ) : contrat.ettSiret ? (
          <Link target="_blank" to={`/ett/${contrat.ettSiret}`}>
            {contrat.ettRaisonSociale}
          </Link>
        ) : (
          <></>
        )
      const contratDates =
        contratsDatesState.find((x) => x.id === contrat.id) || ({} as ContratDatesState)
      const handleEdit = (type: DateType) => {
        const nextState = contratsDatesState.map((x) => {
          if (x.id === contrat.id) {
            return { ...x, [type]: { ...x[type], isEdit: true } }
          } else {
            return x
          }
        })
        setContratsDatesState(nextState)
      }

      const handleCancel = (type: DateType) => {
        const nextState = contratsDatesState.map((x) => {
          if (x.id === contrat.id) {
            return { ...x, [type]: { ...x[type], isEdit: false } }
          } else {
            return x
          }
        })
        setContratsDatesState(nextState)
      }

      const handleValidate = (event: FormEvent<HTMLFormElement>, type: DateType) => {
        event.preventDefault()
        const input = document.getElementById(`${type}-date-${contrat.id}`)

        const newDate = (input && "value" in input && (input.value as string)) || null
        if (newDate) {
          const nextState = contratsDatesState.map((x) => {
            if (x.id === contrat.id) {
              return {
                ...x,
                [type]: { date: newDate, status: "validated", isEdit: false },
              } as ContratDatesState
            } else {
              return x
            }
          })
          setContratsDatesState(nextState)
          const lscontrats = ls.get(`contrats.${siret}`) as Record<string, string>
          const key = `${contrat.id}-${type}`
          ls.set(`contrats.${siret}`, {
            ...lscontrats,
            [key]: newDate,
          })
        }
      }

      const startDate = (
        <ContratDate
          contratDates={contratDates}
          type="start"
          id={contrat.id}
          onValidate={handleValidate}
          onCancel={handleCancel}
          onEdit={handleEdit}
        />
      )
      const endDate = (
        <ContratDate
          contratDates={contratDates}
          type="end"
          id={contrat.id}
          onValidate={handleValidate}
          onCancel={handleCancel}
          onEdit={handleEdit}
        />
      )
      const motive =
        contrat.codeNatureContrat === "01" ? "n/a" : contrat.libelleMotifRecours

      let employee = `${contrat.prenoms} ${contrat.nomFamille}`
      if (contrat.dateNaissance) employee += ` (${contrat.dateNaissance})`

      return {
        id: contrat.id,
        jobTitle,
        employee,
        startDate,
        endDate,
        contractType: getContractType(contrat.codeNatureContrat),
        motive,
        conventionCode: contrat.codeConventionCollective,
        ett,
      }
    })
  else return []
}

export function DateStatusBadge({ status }: { status: DateStatus }) {
  const severity = statusBadgeData?.[status]?.severity
  const text = statusBadgeData?.[status]?.text || "inconnu"
  return (
    <Badge severity={severity} small>
      {text}
    </Badge>
  )
}

export function JobMergedBadge({
  merged,
  short = false,
}: {
  merged: boolean
  short?: boolean
}) {
  return (
    <>
      {merged && (
        <Badge
          severity="new"
          className={`fr-ml-1w ${
            short ? "fr-px-1v before:mx-0 before:content-['*']" : ""
          }`}
          small
        >
          {short ? "" : "Fusionné"}
        </Badge>
      )}
    </>
  )
}

function ContratDate({
  contratDates,
  id,
  type,
  onCancel,
  onEdit,
  onValidate,
}: {
  contratDates: ContratDatesState
  id: number
  type: DateType
  onCancel: (type: DateType) => void
  onEdit: (type: DateType) => void
  onValidate: (event: FormEvent<HTMLFormElement>, type: DateType) => void
}) {
  const editDateText = "Modifier la date de " + (type === "start" ? "début" : "fin")

  return Object.keys(contratDates).length > 0 ? (
    <>
      {contratDates[type].isEdit ? (
        <form
          onSubmit={(event) => onValidate(event, type)}
          className="flex flex-col items-center"
        >
          <Input
            className="fr-mb-0"
            label=""
            nativeInputProps={{
              id: `${type}-date-${id}`,
              type: "date",
              name: `${type}-date`,
              defaultValue: contratDates[type].date || "",
              required: true,
            }}
          />
          <div className="flex-row">
            <Button
              iconId="fr-icon-check-line"
              priority="tertiary no outline"
              title="Valider"
              type="submit"
            />
            <Button
              iconId="fr-icon-close-line"
              onClick={() => onCancel(type)}
              priority="tertiary no outline"
              title="Annuler"
              type="button"
            />
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center">
            <p>{formatDate(contratDates[type].date)}</p>
            <Button
              key={id}
              iconId="fr-icon-pencil-line"
              onClick={() => onEdit(type)}
              priority="tertiary no outline"
              title={editDateText}
            />
          </div>
          {contratDates[type].date && (
            <DateStatusBadge status={contratDates[type].status} />
          )}
        </>
      )}
    </>
  ) : (
    <></>
  )
}

export type CorrectedDates = Record<
  number,
  {
    start_date?: string
    end_date?: string
  }
>

export const formatCorrectedDates = (contractsDates: Record<string, string> | null) => {
  if (contractsDates) {
    return Object.entries(contractsDates).reduce((acc, [key, value]) => {
      const [id, dateType] = key.split("-")
      const contractId = Number(id)
      const dateTypeKey = `${dateType}_date`

      if (contractId && ["start_date", "end_date"].includes(dateTypeKey)) {
        const dateObj = { ...(acc[contractId] || {}), [dateTypeKey]: value }
        acc[contractId] = dateObj
      }
      return acc
    }, {} as CorrectedDates)
  } else return undefined
}

const fileExtensionLabel: Record<FileExtension, string> = {
  ods: "Fichier LibreOffice .ods",
  xlsx: "Fichier Excel .xlsx",
  csv: "Fichier tableur CSV .csv",
}
export const extensions: FileExtension[] = ["ods", "xlsx", "csv"]
export const radioBtnOptions = extensions.map((key) => ({
  label: fileExtensionLabel[key],
  nativeInputProps: {
    value: key,
    defaultChecked: key === "ods",
    // note: I'm using uncontrolled radio component because the controlled one closes the modal on click
  },
}))

export { formatContrats, getContractType, headers }
