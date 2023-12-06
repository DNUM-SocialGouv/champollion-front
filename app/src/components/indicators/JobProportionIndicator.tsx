import { Link, useAsyncValue } from "react-router-dom"

import type { Indicator3, IndicatorMetaData } from "../../api/types"
import { formatDate } from "../../helpers/date"
import { formatNumber } from "../../helpers/format"
import { JobMergedBadge, getContractNature } from "../../helpers/contrats"

import IndicatorWrapper from "./IndicatorWrapper"
import ContractsPieChart, { groupSmallData } from "./Charts/ContractsPieChart"

type JobProportionIndicatorProps = {
  collapseReadingNote?: boolean
  showLearnMore?: boolean
  natures?: string[]
  hasMotives?: boolean
  tracking: { category: string }
}

type JobProportionIndicatorDeferred = {
  workedDaysByJob: Indicator3
  meta: IndicatorMetaData
}

export default function JobProportionIndicator({
  collapseReadingNote = false,
  showLearnMore = false,
  hasMotives = false,
  natures,
  tracking,
}: JobProportionIndicatorProps) {
  const deferredData = useAsyncValue() as JobProportionIndicatorDeferred

  if (!deferredData) {
    console.error(
      "JobProportionIndicator didn't receive async deferred data. It must be used in a <Await> component from react-router."
    )
    return null
  }

  const { workedDaysByJob, meta } = deferredData

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

  const title = `Répartition des jours travaillés en fonction des libellés de poste entre ${start} et ${end} :`
  const subTitle = `Par souci de lisibilité, les parts inférieures à 2 % ne sont pas affichées, et regroupées sous le libellé "Autres".`

  const readingNote = `
        De ${start} à ${end},
        ${hasMotives ? " pour les motifs de recours sélectionnés, " : " "}
        les contrats avec le libellé de poste "${firstJob.libellePoste}" ont représenté
        ${firstJobPercent} % des jours travaillés en ${selectedNatures}.
      `
  const data = groupSmallData(
    Object.values(workedDaysByJob).map((job) => ({
      name: job.libellePoste,
      merged: job.merged,
      value: job.absNb,
      percent: job.relNb,
    }))
  )

  const headers = ["Libellé de poste", "Proportion de jours travaillés"]
  const tableData = data.map((job) => {
    const jobName = (
      <>
        {job.name}
        <JobMergedBadge merged={job.merged === 1} />
      </>
    )
    const jobShare = formatNumber(job.percent) + " %"

    return [jobName, jobShare]
  })

  const learnMoreEl = showLearnMore && (
    <p className="fr-mt-2w">
      <span className="fr-icon-arrow-right-line fr-icon--sm" aria-hidden="true"></span>
      Pour en savoir plus et pour fusionner des libellés de postes, consultez la page{" "}
      <Link to={"postes"}>Postes</Link>.
    </p>
  )

  const passedProps = { collapseReadingNote, title, readingNote, subTitle, tracking }

  return (
    <IndicatorWrapper
      id="job-proportion"
      bottomEl={learnMoreEl}
      table={{ headers, data: tableData }}
      {...passedProps}
    >
      <div className="fr-mb-2w h-60 w-full">
        <ContractsPieChart data={data} />
      </div>
    </IndicatorWrapper>
  )
}
