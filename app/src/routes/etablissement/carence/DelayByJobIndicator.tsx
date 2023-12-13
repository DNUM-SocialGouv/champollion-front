import ContractsPieChart, {
  PieSlice,
} from "../../../components/indicators/Charts/ContractsPieChart"
import IndicatorWrapper from "../../../components/indicators/IndicatorWrapper"
import JobMergedBadge from "../../../components/job/JobMergedBadge"
import { formatDate } from "../../../helpers/date"
import { formatNumber } from "../../../helpers/format"

export function DelayByJobIndicator({
  data,
  startDate,
  endDate,
  hasJobs,
}: DelayByJobIndicatorProps) {
  const start = formatDate(startDate, "MMMM YYYY")
  const end = formatDate(endDate, "MMMM YYYY")
  const selectedPostes = hasJobs ? " pour les libellés de poste sélectionnés," : ""

  const firstJobShare = data[0].percent
  const firstJobName = data[0].name

  const title =
    "Répartition des contrats en infraction potentielle aux délais de carence par libellé de poste :"
  const subTitle = `Par souci de lisibilité, les parts inférieures à 2 % ne sont pas affichées, et regroupées sous le libellé "Autres".`

  const readingNote = `
      De ${start} à ${end},${selectedPostes} ${firstJobShare} % des contrats en infraction
      potentielle avec un ou plusieurs délais de carence ont pour libellé de poste "
      ${firstJobName}".
    `

  const headers = ["Libellé de poste", "Proportion des infractions potentielles"]
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

  return (
    <IndicatorWrapper
      id="delay"
      title={title}
      subTitle={subTitle}
      readingNote={readingNote}
      table={{ headers, data: tableData }}
      tracking={{ category: "Carence" }}
    >
      <div className="fr-mb-2w h-60 w-full">
        <ContractsPieChart data={data} />
      </div>
    </IndicatorWrapper>
  )
}
type DelayByJobIndicatorProps = {
  data: PieSlice[]
  startDate: string
  endDate: string
  hasJobs: boolean
}
