import { Link, useAsyncValue } from "react-router-dom"

import type { Indicator1, IndicatorMetaData } from "../../../api/types"
import { formatDate } from "../../../helpers/date"

import IndicatorWrapper from "../../../components/indicators/IndicatorWrapper"
type HeadcountIndicatorDeferred = {
  headcount: Indicator1
  meta: IndicatorMetaData
}

export default function HeadcountIndicator() {
  const deferredData = useAsyncValue() as HeadcountIndicatorDeferred
  if (!deferredData) {
    console.error(
      "HeadcountIndicator must be used in a <Await> component but didn't receive async data"
    )
    return null
  }

  const { headcount, meta } = deferredData
  const data = [
    {
      key: "cdi",
      label: "CDI",
      value: headcount.nbCdi,
      classes:
        "bg-[var(--artwork-minor-blue-cumulus)] border border-solid border-bd-default-blue-cumulus", // add border to display a thin line when count is 0
    },
    {
      key: "cdd",
      label: "CDD",
      value: headcount.nbCdd,
      classes:
        "bg-diagonal-purple-glycine border border-solid border-bd-default-purple-glycine",
    },
    {
      key: "ctt",
      label: "CTT (intérim)",
      value: headcount.nbCtt,
      classes: "bg-vertical-pink-tuile border border-solid border-bd-default-pink-tuile",
    },
  ]
  const maxValue = Math.max(...data.map((item) => item.value))

  const start = formatDate(meta.startDate, "MMMM YYYY")
  const end = formatDate(meta.endDate, "MMMM YYYY")
  const countCdi = `${headcount.nbCdi.toLocaleString("fr-FR")} CDI`

  const title = `Nombre de contrats en vigueur entre ${start} et ${end} :`
  const readingNote = `De ${start} à ${end}, ${countCdi} ont été en vigueur sur toute ou une partie de la période.`
  const subReadingNote = `En d'autres termes, de ${start} à ${end}, ${countCdi} ont été effectifs.`
  const learnMore = (
    <p className="fr-mt-2w">
      <span className="fr-icon-arrow-right-line fr-icon--sm" aria-hidden="true"></span>
      Pour en savoir plus et consulter l'histogramme des effectifs, consultez la page{" "}
      <Link to={"recours-abusif"}>Recours abusif</Link>.
    </p>
  )
  return (
    <IndicatorWrapper
      id="headcount"
      title={title}
      readingNote={readingNote}
      subReadingNote={subReadingNote}
      bottomEl={learnMore}
      tracking={{ category: "Synthèse" }}
    >
      <div className="fr-my-2w flex h-40 items-baseline">
        {data.map((item) => {
          const barHeight = (item.value / maxValue) * 100 // Scale the bar heights
          const barStyle = {
            height: `${barHeight}%`,
          }

          return (
            <div key={item.key} className="fr-mr-3w flex h-full items-baseline">
              <div aria-hidden className={`w-6 ${item.classes}`} style={barStyle}></div>
              <div className="fr-px-1w">
                <span className="text-3xl font-bold">
                  {item.value.toLocaleString("fr-FR")}{" "}
                </span>
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </IndicatorWrapper>
  )
}
