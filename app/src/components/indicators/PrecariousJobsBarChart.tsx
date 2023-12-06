import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { jobMergedBadgeSvg } from "../../helpers/contrats"
import { formatNumber, splitSentenceAtMiddle, uncapitalize } from "../../helpers/format"

type JobData = {
  label: string | null
  merged: number
  nbCddCtt: number
  nbCdi: number
  ratio: number
}

type PrecariousJobsBarChartProps = {
  data: JobData[]
}

const customTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload?.length > 0) {
    const data = payload?.[0]?.payload
    const jobTitle = data.label
    const ratio = formatNumber(data.ratio)

    return (
      <div className="fr-p-2w border border-solid border-bd-default-grey bg-bg-default-grey shadow-overlap">
        <p className="fr-mb-1w font-bold">{jobTitle}</p>
        <hr className="fr-pb-1v" />

        <ul className="fr-p-0 list-outside list-none">
          {payload.map(({ value, name, color }) => {
            const formattedValue =
              value && Number(value) ? formatNumber(value as number) : value
            const unit = name && typeof name === "string" ? uncapitalize(name) : ""

            return (
              <li key={name}>
                <span className="font-bold" style={{ color }}>
                  {formattedValue}{" "}
                </span>{" "}
                {unit}
              </li>
            )
          })}
          <li>Soit {ratio} % de jours travaillés en CDD et CTT.</li>
        </ul>
      </div>
    )
  }
  return null
}

export default function PrecariousJobsBarChart({ data }: PrecariousJobsBarChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customJobTick = ({ x, y, payload }: any) => {
    const merged = (typeof payload.index === "number" && data[payload.index]?.merged) || 0

    const textX = merged ? -25 : -5
    const badgeX = -20
    const badgeY = -10
    const text = payload.value as string
    let textLines: string[]
    if (text.length > 30) textLines = splitSentenceAtMiddle(text)
    else textLines = [text]

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={textX}
          y={-10}
          textAnchor="end"
          fill="var(--text-mention-grey)"
          fontSize={12}
        >
          {textLines.map((line, index) => (
            <tspan x={textX} dy={"1em"} key={index}>
              {line}
            </tspan>
          ))}
        </text>
        {merged && jobMergedBadgeSvg(badgeX, badgeY)}
      </g>
    )
  }

  return (
    <>
      <ResponsiveContainer height="100%">
        <BarChart
          layout="vertical"
          height={400}
          data={data}
          barSize={10}
          margin={{
            right: 50,
            left: 180,
          }}
        >
          <CartesianGrid stroke="var(--border-default-grey)" horizontal={false} />
          {/* Bottom x axis */}
          <XAxis
            type="number"
            tickCount={10}
            padding={{ right: 30 }}
            fontSize={12}
            tickFormatter={(value: number) => value.toLocaleString("fr-FR")}
          />
          {/* Fake top x axis just to display a label for worked days */}
          <XAxis
            dataKey="nbCddCtt"
            xAxisId="title"
            fontSize={12}
            height={30}
            axisLine={false}
            tick={false}
            orientation="top"
          >
            <Label
              value="Jours travaillés"
              fontSize={14}
              offset={20}
              position="insideLeft"
              fill="var(--text-mention-grey)"
            />
          </XAxis>
          {/* First Y axis with job name */}
          <YAxis
            dataKey="label"
            tick={customJobTick}
            yAxisId="jobName"
            type="category"
            interval={0}
            fontSize={12}
          />
          {/* Second Y axis with ratio */}
          <YAxis
            dataKey="ratio"
            type="category"
            tickSize={0}
            fontSize={14}
            tickFormatter={(value: number) => value.toLocaleString("fr-FR") + " %"}
            tickMargin={45}
            width={130}
          >
            <Label
              value="Part CDD et CTT"
              fontSize={14}
              offset={10}
              position="top"
              fill="var(--text-mention-grey)"
            />
          </YAxis>
          <Tooltip
            content={customTooltip}
            cursor={{
              stroke: "var(--border-default-grey)",
              strokeWidth: 1,
              fill: "var(--background-alt-grey)",
            }}
          />
          <Legend
            align="center"
            className="fr-ml-3w"
            iconSize={30}
            fontSize={12}
            formatter={(value) => {
              const color = "var(--text-mention-grey)"
              return <span style={{ color, fontSize: 14 }}>{value}</span>
            }}
            layout="horizontal"
            verticalAlign="bottom"
          />

          <Bar
            minPointSize={2}
            dataKey="nbCddCtt"
            name="Jours travaillés en CDD et CTT"
            fill="#ffca00" // yellow moutarde from DSFR, same color for light and dark theme
            background={{ fill: "var(--background-alt-grey)" }}
          >
            <LabelList
              dataKey="nbCddCtt"
              position="right"
              fontSize={12}
              formatter={(value: number) => value.toLocaleString("fr-FR")}
            />
          </Bar>
          <Bar
            minPointSize={2}
            dataKey="nbCdi"
            name="Jours travaillés en CDI"
            fill="var(--artwork-minor-blue-cumulus)"
            background={{ fill: "var(--background-alt-grey)" }}
          >
            <LabelList
              dataKey="nbCdi"
              position="right"
              fontSize={12}
              formatter={(value: number) => value.toLocaleString("fr-FR")}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
