import { useAsyncValue } from "react-router-dom"

import type { Indicator2, IndicatorMetaData } from "../api/types"
import { formatDate } from "../helpers/format"

import ContractsPieChart, { type PieSlice } from "./ContractsPieChart"
import AppCollapse from "./AppCollapse"

type ContractNatureIndicatorProps = {
  collapseReadingNote?: boolean
  hasJobs?: boolean
  hasMotives?: boolean
}

type ContractNatureIndicatorDeferred = {
  workedDaysByNature: Indicator2
  meta: IndicatorMetaData
}

export default function ContractNatureIndicator({
  collapseReadingNote = false,
  hasJobs = false,
  hasMotives = false,
}: ContractNatureIndicatorProps) {
  const deferredData = useAsyncValue() as ContractNatureIndicatorDeferred

  if (!deferredData) {
    console.error(
      "ContractNatureIndicator must be used in a <Await> component but didn't receive async data"
    )
    return null
  }

  const { meta, workedDaysByNature } = deferredData

  const start = formatDate(meta.startDate, "MMMM YYYY")
  const end = formatDate(meta.endDate, "MMMM YYYY")
  const cdiPercent = `${workedDaysByNature.cdi.relNb.toLocaleString("fr-FR")}`
  const data: PieSlice[] = Object.entries(workedDaysByNature).map(([key, value]) => ({
    name: key.toUpperCase(),
    value: value.absNb,
    percent: value.relNb,
  }))
  const filters =
    hasJobs && hasMotives
      ? " pour les libellés de poste et les motifs de recours sélectionnés, "
      : hasJobs
      ? " pour les libellés de poste sélectionnés, "
      : hasMotives
      ? " pour les motifs de recours sélectionnés, "
      : ""

  const readingNote = (
    <div className="fr-mb-2w">
      <h5 className="fr-text--md fr-mt-3w fr-mb-1v font-bold">Note de lecture</h5>
      <p className="fr-text--sm fr-mb-0">
        De {start} à {end}, {filters}
        les jours travaillés en CDI représentent {cdiPercent} % des jours travaillés en
        CDI, CDD et CTT.
      </p>
      {hasMotives && (
        <p className="fr-text--sm fr-mb-0 italic">
          Les CDI n'ont pas de motifs de recours : tous les CDI sont comptabilisés.
        </p>
      )}
    </div>
  )

  return (
    <>
      <h4 className="fr-text--md">
        Répartition des jours travaillés par nature de contrat entre {start} et {end} :
      </h4>
      <div className="h-60 w-full">
        <ContractsPieChart data={data} sortData showLegend />
      </div>
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
    </>
  )
}
