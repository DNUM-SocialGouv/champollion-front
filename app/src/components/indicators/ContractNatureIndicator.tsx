import { useAsyncValue } from "react-router-dom"

import type { Indicator2, IndicatorMetaData } from "../../api/types"
import { formatDate } from "../../helpers/date"

import IndicatorWrapper from "./IndicatorWrapper"
import ContractsPieChart, { type PieSlice } from "./Charts/ContractsPieChart"


type ContractNatureIndicatorProps = {
  collapseReadingNote?: boolean
  hasJobs?: boolean
  hasMotives?: boolean
  tracking: { category: string }
}

type ContractNatureIndicatorDeferred = {
  workedDaysByNature: Indicator2
  meta: IndicatorMetaData
}

export default function ContractNatureIndicator({
  collapseReadingNote = false,
  hasJobs = false,
  hasMotives = false,
  tracking,
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

  const title = `Répartition des jours travaillés par nature de contrat entre ${start} et ${end} :`

  const readingNote = `
        De ${start} à ${end}, ${filters}
        les jours travaillés en CDI représentent ${cdiPercent} % des jours travaillés en
        CDI, CDD et CTT.
        `
  const subReadingNote = hasMotives
    ? "Les CDI n'ont pas de motifs de recours : tous les CDI sont comptabilisés."
    : ""

  return (
    <>
      <IndicatorWrapper
        id="contract-nature"
        title={title}
        readingNote={readingNote}
        subReadingNote={subReadingNote}
        collapseReadingNote={collapseReadingNote}
        tracking={tracking}
      >
        <div className="h-60 w-full" id="ContractsPieChart">
          <ContractsPieChart data={data} sortData showLegend />
        </div>
      </IndicatorWrapper>
    </>
  )
}
