import { useState } from "react"
import { Link } from "react-router-dom"

import type { Indicator3, IndicatorMetaData } from "../api/types"
import { formatDate, formatNumber } from "../helpers/format"
import { JobMergedBadge, getContractNature } from "../helpers/contrats"

import { Table } from "@codegouvfr/react-dsfr/Table"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"

import ContractsPieChart from "./ContractsPieChart"
import AppCollapse from "./AppCollapse"

type JobProportionIndicatorProps = {
  workedDaysByJob: Indicator3
  meta: IndicatorMetaData
  collapseReadingNote?: boolean
  showLearnMore?: boolean
  natures?: string[]
  hasMotives?: boolean
}

type Data = {
  merged: number
  name: string | null
  value: number
  percent: number
}

type ReducedData = {
  largestEl: Data[]
  groupedList: Data[]
  groupedValue: number
  groupedPercent: number
}

export default function JobProportionIndicator({
  workedDaysByJob,
  meta,
  collapseReadingNote = false,
  showLearnMore = false,
  hasMotives = false,
  natures,
}: JobProportionIndicatorProps) {
  const [showTable, setShowTable] = useState(false)
  const start = formatDate(meta.startDate, "MMMM YYYY")
  const end = formatDate(meta.endDate, "MMMM YYYY")
  const firstJob = Object.values(workedDaysByJob).reduce((prev, curr) => {
    if (prev.absNb > curr.absNb) return prev
    else return curr
  })
  const firstJobPercent = firstJob.relNb.toLocaleString("fr-FR")
  const selectedNatures =
    natures && natures.length > 0 && natures.length < 3
      ? natures.map((code) => getContractNature(code)).join(" et ")
      : "CDI, CDD et CTT"

  const readingNote = (
    <>
      <h5 className="fr-text--md fr-mb-1v font-bold">Note de lecture</h5>
      <p className="fr-text--sm fr-mb-1w">
        De {start} à {end},
        {hasMotives ? " pour les motifs de recours sélectionnés, " : " "}
        les contrats avec le libellé de poste "{firstJob.libellePoste}" ont représenté{" "}
        {firstJobPercent} % des jours travaillés en {selectedNatures}.
      </p>
    </>
  )
  const data: Data[] = Object.values(workedDaysByJob)
    .map((job) => ({
      name: job.libellePoste,
      merged: job.merged,
      value: job.absNb,
      percent: job.relNb,
    }))
    .sort((a, b) => b.percent - a.percent)

  const reducedData = data.reduce(
    (acc: ReducedData, curr) => {
      const minShare = 2.3
      return {
        largestEl: curr.percent > minShare ? [...acc.largestEl, curr] : acc.largestEl,
        groupedList: curr.percent > minShare ? [] : [...acc.groupedList, curr],
        groupedValue: curr.percent > minShare ? 0 : acc.groupedValue + curr.value,
        groupedPercent:
          curr.percent > minShare ? 0 : acc.groupedPercent + curr.percent * 10, // use integers to prevent js from adding extra fraction digits
      }
    },
    {
      largestEl: [] as Data[],
      groupedList: [] as Data[],
      groupedValue: 0,
      groupedPercent: 0,
    }
  )

  const groupedData = [
    ...reducedData.largestEl,
    {
      name: "Autres",
      percent: reducedData.groupedPercent / 10,
      value: reducedData.groupedValue,
      merged: 0,
    },
  ]

  const headers = ["Libellé de poste", "Proportion de jours travaillés"]
  const tableData = groupedData.map((job) => {
    const jobName = (
      <>
        {job.name}
        <JobMergedBadge merged={job.merged === 1} />
      </>
    )
    const jobShare = formatNumber(job.percent) + " %"

    return [jobName, jobShare]
  })

  return (
    <>
      <h4 className="fr-text--md fr-mb-0">
        Répartition des jours travaillés en fonction des libellés de poste entre {start}{" "}
        et {end} :
      </h4>
      <p className="fr-text--sm italic">
        Par souci de lisibilité, les parts inférieures à 2 % ne sont pas affichées, et
        regroupées sous le libellé "Autres".
      </p>

      {showTable ? (
        <Table className="app-table--thin fr-mb-2w" headers={headers} data={tableData} />
      ) : (
        <div className="fr-mb-2w h-60 w-full">
          <ContractsPieChart data={groupedData} />
        </div>
      )}
      <ToggleSwitch
        label="Afficher les données sous forme de tableau"
        checked={showTable}
        onChange={(checked) => setShowTable(checked)}
        classes={{ label: "w-full" }}
      />

      {collapseReadingNote ? (
        <AppCollapse
          className="fr-mb-1w"
          label="Voir la note de lecture"
          labelOpen="Fermer la note de lecture"
        >
          {readingNote}
        </AppCollapse>
      ) : (
        <>{readingNote}</>
      )}
      {showLearnMore && (
        <p className="fr-mt-2w">
          <span
            className="fr-icon-arrow-right-line fr-icon--sm"
            aria-hidden="true"
          ></span>
          Pour en savoir plus et pour fusionner des libellés de postes, consultez la page{" "}
          <Link to={"postes"}>Postes</Link>.
        </p>
      )}
    </>
  )
}
