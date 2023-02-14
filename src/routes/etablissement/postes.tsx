import { ReactNode, useState } from "react"
import * as dayjs from "dayjs"
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"

import { Link } from "react-router-dom"
import Button from "@codegouvfr/react-dsfr/Button"
import Pagination from "@codegouvfr/react-dsfr/Pagination"
import AppTable from "../../components/AppTable"
import AppMultiSelect, { Option } from "../../components/AppMultiSelect"

import { getEtablissementType, getEtablissementPostesList } from "../../api/etablissement"
import { EtablissementPoste } from "../../api/types"

type ApiContrat = {
  id: number
  employee: string
  contratType: "cdd" | "ctt" | "cdi" | null
  ettName: string | null
  ettSiret: string | null
  startDate: string
  expectedEndDate: string | null
  endDate: string | null
  motiveLabel: string | null
  motiveCode: string | null
  conventionCode: string
}

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

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""

  const { id: etabId } = await getEtablissementType(siret)

  const postes = await getEtablissementPostesList(etabId)
  return { postes }
}

type EtabPostesLoader = {
  postes: EtablissementPoste[]
}

export default function EtabPostes() {
  const { postes } = useLoaderData() as EtabPostesLoader
  const options = postes.map(
    (poste, index) => ({ value: index, label: poste.libelle } as Option)
  )

  const [selectedOptions, setSelectedOptions] = useState([] as Option[]) // updated live when Select changes
  const [selectedPostes, setSelectedPostes] = useState([] as Option[]) // updated only when validation button is clicked

  const formatDate = (date: string | null) =>
    dayjs(date).isValid() ? dayjs(date).format("DD/MM/YYYY") : ""

  const formattedContrats: FormattedContrat[] = items.map((contrat: ApiContrat) => {
    const ett = <Link to={`/ett/${contrat.ettSiret}`}>{contrat.ettName}</Link>
    return {
      id: contrat.id,
      employee: contrat.employee,
      contratType: contrat.contratType?.toUpperCase() || "",
      ett,
      startDate: formatDate(contrat.startDate),
      expectedEndDate: formatDate(contrat.expectedEndDate),
      endDate: formatDate(contrat.endDate),
      motive: contrat.motiveLabel,
      conventionCode: contrat.conventionCode,
    }
  })

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Sélection du poste</h2>
        <hr />
        <AppMultiSelect
          options={options}
          label="Poste(s)"
          hintText="Sélectionnez un ou plusieurs postes dans la liste"
          onChange={(newValue: readonly Option[]) => setSelectedOptions([...newValue])}
        />
        <Button
          disabled={selectedOptions.length == 0 && selectedPostes.length == 0}
          onClick={() => {
            console.log("clicked!", selectedOptions)
            setSelectedPostes([...selectedOptions])
          }}
          type="button"
        >
          Valider la sélection
        </Button>
      </div>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Évolution du nombre de salariés</h2>
        <hr />
        {selectedPostes.length > 0 ? (
          <p>Fonctionnalité à venir</p>
        ) : (
          <p className="italic text-tx-disabled-grey">
            Veuillez sélectionner un ou plusieurs postes.
          </p>
        )}
      </div>
      <div>
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">
          Liste des contrats déclarés sur la période sélectionnée
        </h2>
        <hr />
        {selectedPostes.length > 0 ? (
          <>
            <AppTable headers={headers} items={formattedContrats} />
            <Pagination
              count={5}
              defaultPage={1}
              getPageLinkProps={() => ({ to: "#" })}
              showFirstLast
              classes={{
                list: "justify-center",
              }}
            />
          </>
        ) : (
          <p className="italic text-tx-disabled-grey">
            Veuillez sélectionner un ou plusieurs postes.
          </p>
        )}
      </div>
    </>
  )
}

const items: ApiContrat[] = [
  {
    id: 1,
    employee: "John Doe",
    contratType: "cdd",
    ettName: "",
    ettSiret: "",
    startDate: "2022-06-01",
    expectedEndDate: "2022-09-15",
    endDate: null,
    motiveLabel: "Remplacement de salarié absent",
    motiveCode: "3",
    conventionCode: "2034",
  },

  {
    id: 2,
    employee: "John Doe",
    contratType: "ctt",
    ettName: "Adecco",
    ettSiret: "00542012000015",
    startDate: "2022-07-01",
    expectedEndDate: "2022-09-15",
    endDate: "2022-09-15",
    motiveLabel: "Accroissement temporaire d'activité",
    motiveCode: "2",
    conventionCode: "2034",
  },
  {
    id: 3,
    employee: "Marco Polo",
    contratType: "ctt",
    ettName: "Manpower",
    ettSiret: "00542012000015",
    startDate: "2022-07-01",
    expectedEndDate: "2022-09-15",
    endDate: "2022-09-15",
    motiveLabel: "Accroissement temporaire d'activité",
    motiveCode: "2",
    conventionCode: "2034",
  },
  {
    id: 4,
    employee: "Jeanne Dupont",
    contratType: "cdi",
    ettName: null,
    ettSiret: null,
    startDate: "2021-11-23",
    expectedEndDate: null,
    endDate: null,
    motiveLabel: null,
    motiveCode: null,
    conventionCode: "2034",
  },
]
