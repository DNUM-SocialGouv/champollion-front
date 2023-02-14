import { ReactNode, useState } from "react"
import * as dayjs from "dayjs"
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"

import { Link } from "react-router-dom"
import Button from "@codegouvfr/react-dsfr/Button"
import Pagination from "@codegouvfr/react-dsfr/Pagination"
import AppTable from "../../components/AppTable"
import AppMultiSelect, { Option } from "../../components/AppMultiSelect"

import {
  getEtablissementType,
  getEtablissementPostesList,
  getEtablissementContratsList,
} from "../../api/etablissement"
import { EtablissementPoste, EtablissementContrat } from "../../api/types"

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
  return { etabId, postes }
}

type EtabPostesLoader = {
  etabId: number
  postes: EtablissementPoste[]
}

export default function EtabPostes() {
  const { etabId, postes } = useLoaderData() as EtabPostesLoader

  const [selectedOptions, setSelectedOptions] = useState([] as Option[]) // updated live when Select changes
  const [selectedPostes, setSelectedPostes] = useState([] as Option[]) // updated only when validation button is clicked
  const [formattedContrats, setFormattedContrats] = useState([] as FormattedContrat[]) // updated only when validation button is clicked
  const [nbResults, setNbResults] = useState(0) // updated only when validation button is clicked
  const [totalPages, setTotalPages] = useState(1) // updated only when validation button is clicked

  const options = postes.map(
    (poste, index) => ({ value: index, label: poste.libelle } as Option)
  )
  const formatDate = (date: string | null) =>
    dayjs(date).isValid() ? dayjs(date).format("DD/MM/YYYY") : ""

  const contratTypeShort = [
    { code: "01", label: "CDI" },
    { code: "02", label: "CDD" },
    { code: "03", label: "CTT" },
  ]

  const formatContrats = (items: EtablissementContrat[]) =>
    items.map((contrat) => {
      const ett = <Link to={`/ett/${contrat.ettSiret}`}>{contrat.ettRaisonSociale}</Link>
      return {
        id: contrat.id,
        employee: `${contrat.prenoms} ${contrat.nomFamille}`,
        contratType:
          contratTypeShort.find((item) => item.code === contrat.codeNatureContrat)
            ?.label || "Autre",
        ett,
        startDate: formatDate(contrat.dateDebut),
        expectedEndDate: formatDate(contrat.dateFinPrevisionnelle),
        endDate: formatDate(contrat.dateFin),
        motive: "",
        conventionCode: contrat.codeConventionCollective,
      }
    })

  const getContrats = async (page = 1) => {
    // should use selectedPostes but I don't have time to get into reactivity today
    const postes = selectedOptions.map((option) => option.label)
    const { data: contrats, meta } = await getEtablissementContratsList({
      id: etabId,
      startMonth: "2022-01-01",
      endMonth: "2022-12-01",
      postes,
      page,
    })
    setFormattedContrats(formatContrats(contrats))
    setNbResults(meta.totalCount)
    setTotalPages(meta.totalPages)
  }

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
            setSelectedPostes([...selectedOptions])
            getContrats()
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
            <p>{nbResults} résultats</p>
            <AppTable headers={headers} items={formattedContrats} />
            <Pagination
              count={totalPages}
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
