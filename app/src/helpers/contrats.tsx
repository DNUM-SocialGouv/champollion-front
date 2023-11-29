import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react"
import { Link } from "react-router-dom"
import ls from "localstorage-slim"

import type { EtuContrat, FileExtension } from "../api/types"
import { dateIsBefore, formatDate } from "./date"
import { trackEvent } from "./analytics"

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
  nature: string
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
  | "nature"
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
  { key: "nature", label: "Nature contrat", width: "5%" },
  { key: "motive", label: "Motif de recours", width: "15%" },
  { key: "ett", label: "ETT", width: "15%" },
  { key: "conventionCode", label: "Conv. collective", width: "5%" },
] as ContratsHeader<Column>[]

const motivesRecoursShort = [
  { code: "01", label: "Remplacement salarié" },
  { code: "02", label: "ATA" },
  { code: "03", label: "Saisonnier" },
  { code: "04", label: "Vendange" },
  { code: "05", label: "Usage" },
  { code: "06", label: "CDI à objet défini" },
  { code: "07", label: "Remplacement chef d’entreprise" },
  { code: "08", label: "Remplacement chef exploit. agri." },
  { code: "09", label: "Personnes sans emploi en difficulté" },
  { code: "10", label: "Complément de formation pro." },
  { code: "11", label: "Formation pro. par apprentissage" },
  { code: "12", label: "Remplacement temps partiel provisoire" },
  { code: "13", label: "Attente suppression de poste" },
  { code: "14", label: "Contrat de voyage" },
  { code: "15", label: "Intérimaire BOETH" },
]

const getMotivesRecours = (motiveCode: string | null) =>
  motivesRecoursShort.find((item) => item.code === motiveCode)?.label || "n/a"

const contractNatureShort = [
  { code: "01", label: "CDI" },
  { code: "02", label: "CDD" },
  { code: "03", label: "CTT" },
  { code: "0A", label: "Apprentissage" },
  { code: "07", label: "CDI intermittent" },
  { code: "08", label: "CDI interimaire" },
  { code: "09", label: "CDI (droit public)" },
  { code: "10", label: "CDD (droit public)" },
  { code: "20", label: "[FP] Détachement ECP" },
  { code: "21", label: "[FP] Détachement ENCP" },
  { code: "29", label: "Stage" },
  { code: "32", label: "CAPE" },
  { code: "50", label: "[FP] Nomination" },
  { code: "51", label: "Contrat de mission COSP" },
  { code: "52", label: "[FP] Cumul d’activité" },
  { code: "53", label: "CEP" },
  { code: "54", label: "Apprentissage détenu" },
  { code: "60", label: "CEE" },
  { code: "70", label: "Contrat ESAT" },
  { code: "80", label: "Mandat social" },
  { code: "81", label: "Mandat d'élu" },
  { code: "82", label: "CDI chantier" },
  { code: "89", label: "Service civique" },
  { code: "90", label: "Autre" },
  { code: "91", label: "CDI maritime" },
  { code: "92", label: "CDD maritime" },
  { code: "93", label: "Ligne de service" },
]

const getContractNature = (contractCode: string) =>
  contractNatureShort.find((item) => item.code === contractCode)?.label || "Autre"

const sexShort = [
  { code: 1, label: "H - " },
  { code: 2, label: "F - " },
]

const getSexName = (sexCode: number) =>
  sexShort.find((item) => item.code === sexCode)?.label || ""

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

export const getStatusNameFromCode = (statusCode: number | null): DateStatus => {
  return statusCode === 1
    ? "computed"
    : statusCode === 2
    ? "declared"
    : statusCode === 3
    ? "validated"
    : "unknown"
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
          <Link
            target="_blank"
            to={`/ett/${contrat.ettSiret}`}
            onClick={() =>
              trackEvent({ category: "Contrats", action: "Lien ETT cliqué" })
            }
          >
            {contrat.ettRaisonSociale}
          </Link>
        ) : (
          <></>
        )
      const contratDates =
        contratsDatesState.find((x) => x.id === contrat.contratId) ||
        ({} as ContratDatesState)
      const handleEdit = (type: DateType) => {
        const nextState = contratsDatesState.map((x) => {
          if (x.id === contrat.contratId) {
            return { ...x, [type]: { ...x[type], isEdit: true } }
          } else {
            return x
          }
        })
        setContratsDatesState(nextState)
      }

      const handleReset = (type: DateType, status: DateStatus) => {
        const initDate = type === "start" ? contrat.dateDebut : contrat.dateFin
        const initStatusCode = type === "start" ? contrat.statutDebut : contrat.statutFin
        const initStatus = getStatusNameFromCode(initStatusCode)

        // Remove the corrected date from localStorage if date was corrected
        if (status === "validated") {
          const lscontrats = ls.get(`contrats.${siret}`) as Record<string, string>
          const key = `${contrat.contratId}-${type}`
          delete lscontrats[key]
          ls.set(`contrats.${siret}`, lscontrats)
        }

        const nextState = contratsDatesState.map((x) => {
          if (x.id === contrat.contratId) {
            if (initStatus === "validated") {
              // if the backend provides a validated date, then we don't know the original date,
              // so we need to reload page to make new API call without correcting this date (it will send the original declared date)
              window.location.reload()
            }

            return { ...x, [type]: { date: initDate, isEdit: false, status: initStatus } }
          } else {
            return x
          }
        })
        setContratsDatesState(nextState)
        trackEvent({ category: "Contrats", action: "Date réinitialisée" })
      }

      const handleValidate = (event: FormEvent<HTMLFormElement>, type: DateType) => {
        event.preventDefault()
        const input = document.getElementById(`${type}-date-${contrat.contratId}`)

        const newDate = input && "value" in input && (input.value as string)
        if (newDate !== undefined) {
          const nextState = contratsDatesState.map((x) => {
            if (x.id === contrat.contratId) {
              const newDates = {
                ...x,
                [type]: { date: newDate, status: "validated", isEdit: false },
              }
              if (dateIsBefore(newDates.end.date, newDates.start.date)) {
                window.alert(
                  "Attention ! Désormais la date de fin est avant la date de début du contrat. Si vous ne changez pas les dates, le contrat sera considéré comme annulé et n'apparaîtra plus au prochain chargement de page."
                )
              }
              return newDates
            } else {
              return x
            }
          })
          setContratsDatesState(nextState)
          const lscontrats = ls.get(`contrats.${siret}`) as Record<string, string>
          const key = `${contrat.contratId}-${type}`
          ls.set(`contrats.${siret}`, {
            ...lscontrats,
            [key]: newDate,
          })
          trackEvent({ category: "Contrats", action: "Date validée" })
        }
      }

      const startDate = (
        <ContratDate
          contratDates={contratDates}
          type="start"
          id={contrat.contratId}
          onValidate={handleValidate}
          onEdit={handleEdit}
          onReset={handleReset}
        />
      )
      const endDate = (
        <ContratDate
          contratDates={contratDates}
          type="end"
          id={contrat.contratId}
          onValidate={handleValidate}
          onEdit={handleEdit}
          onReset={handleReset}
        />
      )

      let employee = `${contrat.prenoms} ${contrat.nomFamille}`

      if (contrat.dateNaissance || getSexName(contrat.sexe))
        employee += ` (${getSexName(contrat.sexe) + contrat.dateNaissance})`

      return {
        id: contrat.contratId,
        jobTitle,
        employee,
        startDate,
        endDate,
        nature: getContractNature(contrat.codeNatureContrat),
        motive: getMotivesRecours(contrat.codeMotifRecours),
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

export const jobMergedBadgeSvg = (x: number, y: number) => (
  <>
    <rect
      width="18"
      height="18"
      rx="4"
      fill="var(--background-contrast-yellow-moutarde)"
      x={x}
      y={y}
    />
    <path
      transform={`translate(${x + 3}, ${y + 3}) scale(0.5)`}
      d="M13 10H20L11 23V14H4L13 1V10Z"
      fill="var(--text-action-high-yellow-moutarde)"
    />
  </>
)

function ContratDate({
  contratDates,
  id,
  type,
  onEdit,
  onValidate,
  onReset,
}: {
  contratDates: ContratDatesState
  id: number
  type: DateType
  onEdit: (type: DateType) => void
  onValidate: (event: FormEvent<HTMLFormElement>, type: DateType) => void
  onReset: (type: DateType, status: DateStatus) => void
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
              required: type === "start",
            }}
          />
          <div className="flex-row">
            <Button
              iconId="fr-icon-check-line"
              priority="tertiary no outline"
              title="Sauvegarder"
              type="submit"
            />
            <Button
              iconId="fr-icon-arrow-go-back-fill"
              onClick={() => onReset(type, contratDates[type].status)}
              priority="tertiary no outline"
              title="Réinitialiser"
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
          {contratDates[type].status !== "unknown" && (
            <DateStatusBadge status={contratDates[type].status} />
          )}
        </>
      )}
    </>
  ) : (
    <></>
  )
}

type DateKeys = "date_debut" | "date_fin"

export type CorrectedDates = Record<
  number,
  {
    [K in DateKeys]?: string
  }
>

export const formatCorrectedDates = (
  contractsDates: Record<string, string> | null
): CorrectedDates | undefined => {
  if (contractsDates) {
    return Object.entries(contractsDates).reduce((acc, [key, value]) => {
      const [id, dateType] = key.split("-")
      const contractId = Number(id)
      const dateTypeKey: DateKeys | null =
        dateType === "start" ? "date_debut" : dateType === "end" ? "date_fin" : null

      if (contractId && dateTypeKey) {
        const dateObj = {
          ...(acc?.[contractId] || {}),
          [dateTypeKey]: value || "9999-01-01",
        }
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

export {
  formatContrats,
  getContractNature,
  getMotivesRecours,
  headers,
  contractNatureShort,
  getSexName,
}
