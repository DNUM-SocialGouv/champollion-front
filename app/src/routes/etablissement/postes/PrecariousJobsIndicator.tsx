import { useAsyncValue } from "react-router-dom"

import type { Indicator5, IndicatorMetaData } from "../../../api/types"
import { formatDate } from "../../../helpers/date"
import { formatNumber } from "../../../helpers/format"

import IndicatorWrapper from "../../../components/indicators/IndicatorWrapper"

import PrecariousJobsBarChart from "../../../components/indicators/PrecariousJobsBarChart"
import JobMergedBadge from "../../../components/job/JobMergedBadge"

type PrecariousJobsIndicatorDeferred = {
  precariousJobs: Indicator5
  meta: IndicatorMetaData
}

type PrecariousJobsIndicatorProps = {
  hasMotives?: boolean
}

export default function PrecariousJobsIndicator({
  hasMotives = false,
}: PrecariousJobsIndicatorProps) {
  const deferredData = useAsyncValue() as PrecariousJobsIndicatorDeferred
  if (!deferredData) {
    console.error(
      "PrecariousJobsIndicator must be used in a <Await> component but didn't receive async data"
    )
    return null
  }

  const { precariousJobs, meta } = deferredData
  const start = formatDate(meta.startDate, "MMMM YYYY")
  const end = formatDate(meta.endDate, "MMMM YYYY")

  const filters = hasMotives ? " et les motifs de recours sélectionnés, " : ", "

  const data = Object.values(precariousJobs)
    .map((jobData) => {
      return {
        label: jobData.libellePoste,
        merged: jobData.merged,
        nbCddCtt: jobData.absNbCdd + jobData.absNbCtt,
        nbCdi: jobData.absNbCdi,
        ratio: jobData.relNbCdd + jobData.relNbCtt,
      }
    })
    .sort((a, b) => b.nbCddCtt - a.nbCddCtt)
    .slice(0, 10)

  const headers = [
    "Libellé de poste",
    "Jours travaillés en CDD et CTT",
    "Jours travaillés en CDI",
    "Part de jours travaillés en CDD et CTT",
  ]
  const tableData = data.map((job) => {
    const jobName = (
      <>
        {job.label}
        <JobMergedBadge merged={job.merged === 1} />
      </>
    )
    const ratio = formatNumber(job.ratio) + " %"

    return [jobName, formatNumber(job.nbCddCtt), formatNumber(job.nbCdi), ratio]
  })

  const firstJob = data[0]
  const firstJobLabel = firstJob.label

  const cddCttShare = firstJob.ratio.toLocaleString("fr-FR")
  const nbCdi = firstJob.nbCdi.toLocaleString("fr-FR")
  const nbCddCtt = firstJob.nbCddCtt.toLocaleString("fr-FR")

  const title =
    "Les dix libellés de poste comptant le plus de jours travaillés en CDD et CTT :"
  const readingNote = `
      De ${start} à ${end}, pour le libellé de poste "${firstJobLabel}"${filters}
      les jours travaillés en CDD et CTT représentent ${cddCttShare}% des jours
      travaillés en CDI, CDD et CTT soit ${nbCdi} jours travaillés en CDI pour
      ${nbCddCtt} en CDD et CTT.
    `
  const subReadingNote = hasMotives
    ? "Les CDI n'ont pas de motifs de recours : tous les CDI sont comptabilisés."
    : ""

  return (
    <IndicatorWrapper
      id="precarious-jobs"
      title={title}
      readingNote={readingNote}
      subReadingNote={subReadingNote}
      table={{ headers, data: tableData }}
      tracking={{ category: "Postes" }}
    >
      <div className="h-[28rem] w-full">
        <PrecariousJobsBarChart data={data} />
      </div>
    </IndicatorWrapper>
  )
}
