import { Dispatch, FormEvent, ReactNode, SetStateAction, useState } from "react"
import {
  ActionFunctionArgs,
  Form,
  Link,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "react-router-dom"
import ls from "localstorage-slim"

import { getEtablissementsType, getPostesAta, postContratsAta } from "../../../api"
import { getQueryPoste, getQueryPage } from "../../../helpers/contrats"
import { ContratsHeader, contratTypeShort, formatDate } from "../../../helpers/contrats"

import { Badge } from "@codegouvfr/react-dsfr/Badge"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Alert, AlertProps } from "@codegouvfr/react-dsfr/Alert"
import { Input } from "@codegouvfr/react-dsfr/Input"
import { Notice } from "@codegouvfr/react-dsfr/Notice"
import { Stepper } from "@codegouvfr/react-dsfr/Stepper"
import AppMultiSelect, { Option } from "../../../components/AppMultiSelect"
import AppTable from "../../../components/AppTable"
import Pagination from "@codegouvfr/react-dsfr/Pagination"
import { DateRange, EtablissementPoste, EtuContrat, MetaData } from "../../../api/types"
import { AppError, errorWording, isAppError } from "../../../helpers/errors"

type CarenceContratsLoader = {
  contratsData:
    | AppError
    | {
        contrats: EtuContrat[]
        meta: MetaData
      }
  dates: DateRange
  localFusionsLabels: string[][] | null
  page: number
  postes: AppError | EtablissementPoste[]
  selectedPoste: string | null
  siret: string
}

type FormattedContrat = {
  id: number
  poste: string
  employee: string
  contratType: string
  ett: ReactNode
  startDate: ReactNode
  endDate: ReactNode
}

type Column = "poste" | "employee" | "contratType" | "ett" | "startDate" | "endDate"

const headers = [
  { key: "poste", label: "Poste", width: "15%" },
  { key: "employee", label: "Salarié", width: "10%" },
  { key: "contratType", label: "Type de contrat", width: "10%" },
  { key: "ett", label: "ETT", width: "10%" },
  { key: "startDate", label: "Date de début", width: "15%" },
  { key: "endDate", label: "Date de fin", width: "15%" },
] as ContratsHeader<Column>[]

type DateType = "start" | "end"

type DateStatus = "declared" | "computed" | "validated" | "unknown"

type EditableDate = {
  date: string | null
  status: DateStatus
  isEdit: boolean
}

type ContratDatesState = {
  id: number
  end: EditableDate
  start: EditableDate
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  if (data.navigation === "previous") return redirect("../postes")
  return redirect("../infractions")
}

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<CarenceContratsLoader> {
  const searchParams = new URL(request.url).searchParams
  const selectedPoste = getQueryPoste(searchParams)
  const page = getQueryPage(searchParams)
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      statusText: errorWording.etab,
    })
  }
  const postes = await getPostesAta(etabType.id)
  const localFusionsLabels = ls.get(`carence.${params.siret}.fusions`) as
    | string[][]
    | null

  const dates = ls.get(`carence.${params.siret}.dates`) as DateRange
  const contratsData = await postContratsAta({
    startMonth: dates.startDate,
    endMonth: dates.endDate,
    id: etabType.id,
    mergedPostes: localFusionsLabels || [],
    postes: (selectedPoste && [selectedPoste]) || undefined,
    page,
  })

  return {
    contratsData,
    dates,
    localFusionsLabels,
    page,
    postes,
    selectedPoste,
    siret,
  }
}

export default function CarenceContrats() {
  const submit = useSubmit()
  const {
    dates,
    page,
    postes,
    contratsData,
    localFusionsLabels,
    selectedPoste: queryPoste,
  } = useLoaderData() as CarenceContratsLoader

  const mergedLabelsToDelete = localFusionsLabels?.map((fusion) => fusion.slice(1)).flat()
  let options: Option[] = []
  if (!isAppError(postes))
    options = postes
      .filter((poste) => !mergedLabelsToDelete?.find((label) => label === poste.libelle))
      .map((poste, index) => ({ value: index, label: poste.libelle } as Option))

  const initialPosteOption: Option =
    options.find((option) => option.label === queryPoste) || ({} as Option)
  const [selectedPoste, setSelectedPoste] = useState(initialPosteOption)
  const noticeText = `Les entreprises ne déclarent pas toujours la date de fin réelle des contrats,
    il y a parfois uniquement la date de fin prévisionnelle.
    Vous pouvez corriger les dates d'après vos observations.`
  const formattedDates = {
    startDate: formatDate(dates.startDate),
    endDate: formatDate(dates.endDate),
  }
  const warningList = () => {
    return (
      <>
        <li>
          Contrats en cours au moins un jour sur la période du {formattedDates.startDate}{" "}
          au {formattedDates.endDate}
        </li>
        {selectedPoste?.label && (
          <li>Intitulé de poste sélectionné : {selectedPoste.label}</li>
        )}
      </>
    ) as NonNullable<ReactNode>
  }

  return (
    <>
      <Stepper
        currentStep={3}
        stepCount={3}
        title="Vérifier les informations sur les contrats"
      />
      <p className="">
        Voici tous les CDD et CTT conclus au motif d'accroissement temporaire d'activité
        sur la période.
      </p>
      <Notice className="fr-mb-2w" title={noticeText} />
      <Form>
        <AppMultiSelect
          className="fr-mr-2w md:w-3/5 lg:w-1/2"
          isMulti={false}
          options={options}
          value={selectedPoste}
          label="Filtrer sur un poste :"
          onChange={(newValue) => {
            if (!Array.isArray(newValue)) {
              const poste = (newValue as Option) || ({} as Option)
              setSelectedPoste(poste)
              const formData = new FormData()
              if (poste?.label) formData.append("poste", poste?.label)
              submit(formData)
            }
          }}
        />
      </Form>
      {isAppError(contratsData) ? (
        <Alert
          severity="warning"
          title="Aucun contrat ne correspond à vos paramètres :"
          description={warningList()}
        />
      ) : (
        <CarenceContratsTable
          contrats={contratsData.contrats}
          meta={contratsData.meta}
          queryPoste={queryPoste}
          key={`${queryPoste}-${page}`}
        />
      )}
      <Form className="flex flex-col" method="post">
        <div className="fr-mt-4w self-end">
          <Button
            className="fr-mr-2w"
            priority="secondary"
            type="submit"
            nativeButtonProps={{ name: "navigation", value: "previous" }}
          >
            Précédent
          </Button>
          <Button type="submit" nativeButtonProps={{ name: "navigation", value: "next" }}>
            Suivant
          </Button>
        </div>
      </Form>
    </>
  )
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

function DateStatusBadge({ status }: { status: DateStatus }) {
  const severity = statusBadgeData?.[status]?.severity
  const text = statusBadgeData?.[status]?.text || "inconnu"
  return (
    <Badge severity={severity} small>
      {text}
    </Badge>
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
  console.log("editDateText", editDateText)
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

const formatContrats = (
  items: EtuContrat[],
  contratsDatesState: ContratDatesState[],
  setContratsDatesState: Dispatch<SetStateAction<ContratDatesState[]>>,
  siret: string
) => {
  if (Array.isArray(items) && items.length > 0)
    return items.map((contrat) => {
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

      return {
        id: contrat.id,
        employee: `${contrat.prenoms} ${contrat.nomFamille}`,
        contratType:
          contratTypeShort.find((item) => item.code === contrat.codeNatureContrat)
            ?.label || "Autre",
        ett,
        poste: contrat.libellePoste,
        startDate,
        endDate,
      } as FormattedContrat
    })
  else return []
}

function CarenceContratsTable({
  contrats,
  meta,
  queryPoste,
}: {
  contrats: EtuContrat[]
  meta: MetaData
  queryPoste: string | null
}) {
  const [searchParams] = useSearchParams()
  const { siret } = useLoaderData() as CarenceContratsLoader

  const initialContratsDatesState = contrats.map((contrat) => {
    const savedContratsDates = ls.get(`contrats.${siret}`) as Record<string, string>
    const startKey = `${contrat.id}-start`
    const start: EditableDate = {
      date: contrat.dateDebut,
      status: "declared",
      isEdit: false,
    }
    const end: EditableDate = {
      date: contrat.dateFin,
      status: "declared",
      isEdit: false,
    }
    const endKey = `${contrat.id}-end`

    if (savedContratsDates && startKey in savedContratsDates) {
      start.date = savedContratsDates[startKey]
      start.status = "validated"
    }

    if (savedContratsDates && endKey in savedContratsDates) {
      end.date = savedContratsDates[endKey]
      end.status = "validated"
    }

    if (!end.date) {
      end.date = contrat.dateFinPrevisionnelle
      end.status = "computed"
    }

    if (!end.date) {
      end.status = "unknown"
    }

    return {
      id: contrat.id,
      start,
      end,
    } as ContratDatesState
  })
  const [contratsDatesState, setContratsDatesState] = useState(initialContratsDatesState)
  const formattedContrats = formatContrats(
    contrats,
    contratsDatesState,
    setContratsDatesState,
    siret
  )

  return (
    <>
      {meta.totalCount > 0 ? (
        <>
          <p>{meta.totalCount} résultats</p>
          <AppTable headers={headers} items={formattedContrats} />
          {meta.totalPages > 1 && (
            <Pagination
              count={meta.totalPages}
              defaultPage={getQueryPage(searchParams)}
              getPageLinkProps={(page) => {
                let query = `?page=${page}`
                if (queryPoste) query += `&poste=${queryPoste}`
                return {
                  to: { search: query },
                }
              }}
              showFirstLast
              classes={{
                list: "justify-center",
              }}
            />
          )}
        </>
      ) : (
        <p>Aucun résultat.</p>
      )}
    </>
  )
}
