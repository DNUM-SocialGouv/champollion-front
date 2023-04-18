import { ReactNode, useState } from "react"
import {
  Form,
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "react-router-dom"
import ls from "localstorage-slim"

import { getEtablissementsType, getPostes, getContratsEtu } from "../../api"
import {
  formatContrats,
  headers,
  EditableDate,
  ContratDatesState,
} from "../../helpers/contrats"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Notice } from "@codegouvfr/react-dsfr/Notice"
import AppMultiSelect, { Option } from "../../components/AppMultiSelect"
import AppTable from "../../components/AppTable"
import Pagination from "@codegouvfr/react-dsfr/Pagination"
import { DateRange, EtablissementPoste, EtuContrat, MetaData } from "../../api/types"
import { AppError, errorWording, isAppError } from "../../helpers/errors"
import { formatDate, getQueryAsString, getQueryPage } from "../../helpers/format"
import {
  OptionComp,
  SingleValueComp,
  initOptions,
  selectedPostesAfterMerge,
} from "../../helpers/postes"

type CarenceContratsLoader = {
  contratsData:
    | AppError
    | {
        contrats: EtuContrat[]
        meta: MetaData
      }
  dates: DateRange
  mergesLabels: string[][] | null
  page: number
  postes: AppError | EtablissementPoste[]
  queryPoste: string
  siret: string
}

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<CarenceContratsLoader> {
  const { searchParams } = new URL(request.url)
  const queryPoste = getQueryAsString(searchParams, "poste")
  const page = getQueryPage(searchParams)
  const siret = params.siret ? String(params.siret) : ""
  const etabType = await getEtablissementsType(siret)

  if (isAppError(etabType)) {
    throw new Response("", {
      statusText: errorWording.etab,
    })
  }
  const postes = await getPostes(etabType.id)
  const localMergesLabels = ls.get(`etab.${params.siret}.merges`) as string[][] | null

  const selectedPostesParam = selectedPostesAfterMerge(queryPoste, localMergesLabels)

  const dates: DateRange = {
    startDate: "2022-01-01",
    endDate: "2022-12-01",
  }
  const contratsData = await getContratsEtu({
    startMonth: dates.startDate,
    endMonth: dates.endDate,
    id: etabType.id,
    postes: selectedPostesParam,
    page,
  })

  return {
    contratsData,
    dates,
    mergesLabels: localMergesLabels,
    page,
    postes,
    queryPoste,
    siret,
  }
}

export default function EtabContrats() {
  const submit = useSubmit()
  const { contratsData, dates, mergesLabels, page, postes, queryPoste } =
    useLoaderData() as CarenceContratsLoader

  const { options, initialPosteOption } = initOptions(postes, queryPoste, mergesLabels)

  const [selectedPoste, setSelectedPoste] = useState(initialPosteOption)
  const noticeText = `Lorsque la date de fin réelle n'est pas déclarée par l'entreprise, elle est dite inférée.
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
      <h2 className="fr-text--xl fr-mb-1w">Liste des contrats</h2>
      <hr />
      <Notice className="fr-mb-2w" title={noticeText} />
      <Form>
        <AppMultiSelect
          className="fr-mr-2w md:w-3/5 lg:w-1/2"
          customComponents={{ Option: OptionComp, SingleValue: SingleValueComp }}
          isMulti={false}
          label="Filtrer sur un poste"
          onChange={(newValue) => {
            if (!Array.isArray(newValue)) {
              const poste = (newValue as Option) || ({} as Option)
              setSelectedPoste(poste)
              const formData = new FormData()
              if (poste?.label) formData.append("poste", poste?.label)
              submit(formData)
            }
          }}
          options={options}
          value={selectedPoste}
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
    </>
  )
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
