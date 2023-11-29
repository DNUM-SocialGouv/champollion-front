import { EtablissementDefaultPeriod, EtablissementPoste } from "../api/types"
import { Option } from "../components/AppMultiSelect"
import { AppError, isAppError } from "./errors"
import { oneYearAgo, today } from "./date"
import { getQueryAsString } from "./format"

export const getQueryDates = ({
  etabDefaultPeriod,
  searchParams,
}: {
  etabDefaultPeriod: AppError | EtablissementDefaultPeriod
  searchParams: URLSearchParams
}) => {
  let defaultStartDate = oneYearAgo
  let defaultEndDate = today

  if (
    !isAppError(etabDefaultPeriod) &&
    etabDefaultPeriod.startDate &&
    etabDefaultPeriod.endDate
  ) {
    defaultStartDate = etabDefaultPeriod.startDate
    defaultEndDate = etabDefaultPeriod.endDate
  }

  return {
    queryStartDate: getQueryAsString(searchParams, "debut") || defaultStartDate,
    queryEndDate: getQueryAsString(searchParams, "fin") || defaultEndDate,
  }
}

const motivesCodes = [1, 2, 3, 4] as const // make array immutable
type MotivesCode = (typeof motivesCodes)[number]

const motivesLabels: Record<MotivesCode, string> = {
  1: "Remplacement d'un salarié",
  2: "Accroissement temporaire d'activité",
  3: "Usage / saisonnier",
  4: "Autre",
}

export const motiveOptions: Option[] = Object.entries(motivesLabels).map(
  ([key, label]) => ({ value: Number(key), label })
)

export const motivesCodeDict: Record<MotivesCode, string[]> = {
  1: ["01", "07", "08", "12", "13"],
  2: ["02"],
  3: ["03", "04", "05"],
  4: ["06", "09", "10", "11", "14", "15"],
}

export const contractNatures = [
  { key: "cdi", code: "01", label: "CDI" },
  { key: "cdd", code: "02", label: "CDD" },
  { key: "ctt", code: "03", label: "CTT (intérim)" },
  { key: "apprentissage", code: "0A", label: "Apprentissage" },
  { key: "autres", code: "0X", label: "Autres" },
]

export const addMotivesEndpointParam = (params: string, motives?: number[]) => {
  if (motives && motives.length > 0) {
    const motivesCodes = (motives as MotivesCode[]) // simplify typing here and filter results just after in case motive is actually not a MotivesCode
      .map((motive) => motivesCodeDict[motive])
      .filter(Boolean)
      .flat()
    const motivesParam = motivesCodes
      .map((motive) => `motif_recours_ids=${motive}`)
      .join("&")
    params += `&${motivesParam}`
  }
  return params
}

type filtersDetailArgs = {
  queryJobs?: number[]
  jobListWithoutMerges?: EtablissementPoste[]
  localMerges?: number[][]
  queryMotives?: number[]
}

const getFullJobTitle = (
  jobId: number,
  jobListWithoutMerges: EtablissementPoste[],
  localMerges?: number[][]
): string => {
  const jobListData = jobListWithoutMerges.find((job) => job.posteId === jobId)
  if (jobListData) {
    const isMerged = localMerges && localMerges.flat().includes(jobId)
    if (!isMerged) return jobListData.libellePoste
    else {
      const mergeArr = localMerges.find((merge) => merge.includes(jobId))
      if (mergeArr) {
        const mergedLabelsList = mergeArr
          .map((mergedJobId) =>
            jobListWithoutMerges.find((job) => job.posteId === mergedJobId)
          )
          .filter(Boolean)
          .map((job) => job?.libellePoste)
        return mergedLabelsList[0] + " – fusion de : " + mergedLabelsList.join(", ")
      }
    }
  }
  return ""
}

export const filtersDetail = ({
  queryJobs,
  jobListWithoutMerges,
  localMerges,
  queryMotives,
}: filtersDetailArgs) => {
  return (
    <div className="fr-p-2w fr-mb-2w rounded-2xl border border-solid border-bd-default-grey bg-bg-alt-grey">
      {queryMotives && queryMotives.length > 0 && (
        <div>
          <b>Motifs de recours (ne filtrent pas les CDI) : </b>
          <ul>
            {queryMotives.map((motive) => {
              const typedMotive = motive as MotivesCode
              if (motivesCodes.includes(typedMotive)) {
                return <li key={motive}>{motivesLabels[typedMotive]}</li>
              }
            })}
          </ul>
        </div>
      )}
      {queryJobs && queryJobs.length > 0 && jobListWithoutMerges && (
        <div>
          <b>Libellés de poste : </b>
          <ul>
            {queryJobs.map((job) => {
              return (
                <li key={job}>
                  {getFullJobTitle(job, jobListWithoutMerges, localMerges)}
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {(!queryJobs || queryJobs?.length === 0) &&
        (!queryMotives || queryMotives?.length === 0) && (
          <p className="fr-mb-0 italic">
            Aucun filtre de motif ou de postes sélectionné.
          </p>
        )}
    </div>
  )
}
