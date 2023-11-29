import {
  Bar,
  BarChart,
  Label,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import type { MetaCarences } from "../api/types"
import { formatDate } from "../helpers/date"

import AppIndicator from "./AppIndicator"

type InfractionsRatioProps = {
  meta: MetaCarences
  startDate: string
  endDate: string
  hasJobs?: boolean
  tracking: { category: string }
}

export default function InfractionRatioIndicator({
  meta,
  startDate,
  endDate,
  hasJobs,
  tracking,
}: InfractionsRatioProps) {
  const start = formatDate(startDate, "MMMM YYYY")
  const end = formatDate(endDate, "MMMM YYYY")
  const selectedPostes = hasJobs ? " pour les libellés de poste sélectionnés," : ""
  const nbInfractions = meta.nbTotIllegalContracts.toLocaleString("fr-FR")
  const nbContracts = meta.nbTotContracts.toLocaleString("fr-FR")

  const data = [
    {
      nbInfractions: meta.nbTotIllegalContracts,
      nbNotInfractions: meta.nbTotContracts - meta.nbTotIllegalContracts,
      nbContracts: meta.nbTotContracts,
    },
  ]

  const accentColor = "#ffca00" // yellow moutarde from DSFR, same color for light and dark theme
  const title =
    "Nombre de contrats en infraction potentielle avec un ou plusieurs délais de carence :"
  const readingNote = `
    De ${start} à ${end},${selectedPostes} ${nbInfractions} des ${nbContracts} CDD et CTT
    conclus au motif d'accroissement temporaire de l'activité ont présumément démarré
    avant la fin d'un ou plusieurs délais de carence.
  `

  return (
    <AppIndicator
      id="infraction-ratio"
      title={title}
      readingNote={readingNote}
      tracking={tracking}
    >
      <div className="h-16 w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            barCategoryGap={0}
            margin={{
              right: 80,
              left: 50,
              top: 30,
              bottom: 10,
            }}
          >
            <defs>
              <pattern
                id="diagonal-lines"
                patternUnits="userSpaceOnUse"
                patternTransform="scale(1) rotate(135)"
                width="10"
                height="6"
              >
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="var(--artwork-minor-blue-cumulus)"
                />
                <path
                  d="M0 10h20z"
                  strokeWidth="14"
                  stroke={accentColor}
                  fill={accentColor}
                />
              </pattern>
            </defs>
            <XAxis
              domain={[0, "dataMax"]}
              type="number"
              ticks={[0, data[0].nbInfractions, data[0].nbContracts]}
              fontSize={14}
              stroke="var(--text-mention-grey)"
              tickFormatter={(value: number) => value.toLocaleString("fr-FR")}
              height={10}
            >
              <Label
                value="contrats"
                fontSize={14}
                offset={15}
                position="right"
                fill="var(--text-mention-grey)"
                transform={`translate(0, 8)`}
              />
            </XAxis>

            <YAxis
              type="category"
              axisLine={false}
              tick={false}
              padding={{ bottom: 1 }}
              width={5}
            />

            <Bar
              minPointSize={2}
              dataKey="nbInfractions"
              isAnimationActive={false}
              stackId="a"
              name="Jours travaillés en CDD et CTT"
              stroke={accentColor}
              fill="url(#diagonal-lines)"
            >
              <LabelList
                dataKey="nbInfractions"
                position="top"
                fontSize={14}
                fill="var(--text-mention-grey)"
                formatter={(value: number) =>
                  value.toLocaleString("fr-FR") + " infractions"
                }
              />
            </Bar>
            <Bar
              minPointSize={2}
              dataKey="nbNotInfractions"
              stackId="a"
              name="Jours travaillés en CDI"
              fill="var(--artwork-minor-blue-cumulus)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AppIndicator>
  )
}
