import { useMemo, useState } from "react"
import * as dayjs from "dayjs"
import "dayjs/locale/fr"
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TooltipProps } from "recharts/types/component/Tooltip"
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent"
import { DataKey } from "recharts/types/util/types"
import { capitalize } from "../helpers/format"

dayjs.locale("fr")

type AppBarChartType = {
  isStacked: boolean
  unit: string
  data: MonthData[]
}
export type MonthData = {
  name?: string
  date: string
  label: string
  cdd: number
  cdi: number
  ctt: number
}

export default function AppBarChart({ isStacked = false, unit, data }: AppBarChartType) {
  const [brushIndexes, setBrushIndexes] = useState({
    startIndex: 0,
    endIndex: data.length - 1,
  })
  useMemo(
    () => setBrushIndexes({ ...brushIndexes, endIndex: data.length - 1 }),
    [data.length]
  )
  const initialBarOpacity: Record<string, number> = { cdi: 1, cdd: 1, ctt: 1 }
  const [barOpacity, setBarOpacity] = useState(initialBarOpacity)
  const stackId = isStacked ? "temporary" : undefined

  const handleMouseEnterLegend = ({ dataKey }: { dataKey?: DataKey<string> }) => {
    const newOpacity = { ...initialBarOpacity }
    Object.keys(newOpacity).forEach((key) => {
      if (key != dataKey) newOpacity[key] = 0.5
    })

    setBarOpacity(newOpacity)
  }
  const handleMouseLeaveLegend = () => setBarOpacity(initialBarOpacity)

  const customTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload?.length > 0) {
      const date = payload?.[0]?.payload.date
      const formattedDate = capitalize(dayjs(date).format("MMMM YYYY"))

      return (
        <div className="fr-p-2w border border-solid border-bd-default-grey bg-bg-default-grey shadow-overlap">
          <p className="fr-mb-1w font-bold">{date ? formattedDate : label}</p>
          <hr className="fr-pb-1v" />
          <ul className="fr-p-0 list-outside list-none">
            {payload.map(({ value, name, unit, color, stroke }) => {
              return (
                <li style={{ color: stroke || color }} key={name}>
                  <span className="font-bold">{value} </span> {unit ? `${unit} en ` : ""}
                  {name}
                </li>
              )
            })}
          </ul>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          barCategoryGap={"20%"}
          barGap={2}
          width={400}
          height={500}
          data={data}
          margin={{
            top: 10,
            right: 70,
            left: 20,
            bottom: 50,
          }}
        >
          <defs>
            <pattern
              id="vertical-lines"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(1) rotate(90)"
              width="10"
              height="4"
            >
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="var(--border-action-low-pink-tuile)"
              />
              <path
                d="M0 10h20z"
                strokeWidth="16"
                stroke="var(--artwork-minor-pink-tuile)"
                fill="var(--artwork-minor-pink-tuile)"
              />
            </pattern>
            <pattern
              id="diagonal-lines"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(1) rotate(45)"
              width="10"
              height="6"
            >
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="var(--background-action-low-purple-glycine)"
              />
              <path
                d="M0 10h20z"
                strokeWidth="14"
                stroke="var(--artwork-minor-purple-glycine)"
                fill="var(--artwork-minor-purple-glycine)"
              />
            </pattern>
          </defs>
          <CartesianGrid
            strokeDasharray="4"
            vertical={false}
            stroke="var(--border-default-grey)"
          />
          <XAxis
            dataKey={(payload) => {
              return payload.label
            }}
            angle={40}
            dx={20}
            dy={15}
            interval={0}
            stroke="var(--text-mention-grey)"
          />
          <YAxis
            interval="preserveStart"
            tickCount={8}
            allowDecimals={false}
            stroke="var(--text-mention-grey)"
          >
            <Label
              value={capitalize(unit)}
              angle={-90}
              offset={0}
              position="insideLeft"
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
            iconSize={30}
            onMouseEnter={handleMouseEnterLegend}
            onMouseLeave={handleMouseLeaveLegend}
            verticalAlign="top"
            formatter={(value, entry) => {
              // @ts-ignore: Rechart types incorrect for payload
              const color = entry?.payload?.stroke || entry.color
              return <span style={{ color }}>{value}</span>
            }}
          />
          <Bar
            dataKey="cdi"
            fill="var(--artwork-minor-blue-cumulus)"
            fillOpacity={barOpacity.cdi}
            name="CDI"
            unit={unit}
          />
          <Bar
            dataKey="cdd"
            fill="url(#diagonal-lines)"
            fillOpacity={barOpacity.cdd}
            name="CDD"
            stackId={stackId}
            stroke="var(--artwork-minor-purple-glycine)"
            strokeOpacity={barOpacity.cdd}
            strokeWidth={1}
            unit={unit}
          />
          <Bar
            dataKey="ctt"
            fill="url(#vertical-lines)"
            fillOpacity={barOpacity.ctt}
            name="CTT (intérim)"
            stackId={stackId}
            stroke="var(--artwork-minor-pink-tuile)"
            strokeOpacity={barOpacity.ctt}
            strokeWidth={1}
            unit={unit}
          />
          <Brush
            dataKey="label"
            endIndex={brushIndexes.endIndex}
            fill="var(--background-default-grey)"
            height={30}
            startIndex={brushIndexes.startIndex}
            stroke="var(--text-mention-grey)"
            y={450}
            onChange={({ startIndex, endIndex }) => {
              setBrushIndexes({
                startIndex: Number(startIndex),
                endIndex: Number(endIndex),
              })
            }}
          ></Brush>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
