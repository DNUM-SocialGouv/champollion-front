import { useMemo, useState } from "react"

import { computeGrayAreasCoordinates } from "../../../helpers/effectifs"
import { capitalize, formatNumber } from "../../../helpers/format"

import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Label,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts/types/component/Tooltip"
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent"
import type { DataKey } from "recharts/types/util/types"

type EffectifBarChartType = {
  isStacked: boolean
  unit: string
  data: MonthData[]
  grayAreasData: GrayAreasInput
}

export type MonthData = {
  name: string
  date: string
  label: string
  cdd: number
  cdi: number
  ctt: number
  isEmpty: boolean
}

export type GrayAreasInput = {
  startRequestedDate: string | null
  lastInvalidPastMonth: string | null
  firstInvalidFutureMonth: string | null
  endRequestedDate: string | null
  maxHeight: number
}

export default function EffectifBarChart({
  isStacked = false,
  unit,
  data,
  grayAreasData,
}: EffectifBarChartType) {
  const [brushIndexes, setBrushIndexes] = useState({
    startIndex: 0,
    endIndex: data.length - 1,
  })
  const brushStartDate = data[brushIndexes.startIndex]?.date
  const brushEndDate = data[brushIndexes.endIndex]?.date

  const { pastX1, pastX2, futureX1, futureX2 } = computeGrayAreasCoordinates({
    grayAreasData,
    brushStartDate,
    brushEndDate,
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
      const data = payload?.[0]?.payload as MonthData
      const formattedDate = capitalize(data.name)

      return (
        <div className="fr-p-2w border border-solid border-bd-default-grey bg-bg-default-grey shadow-overlap">
          <p className="fr-mb-1w font-bold">{formattedDate || label}</p>
          <hr className="fr-pb-1v" />
          {data?.isEmpty === true ? (
            <>
              {/* Text separated in different tags to keep the tooltip narrow */}
              <p className="fr-m-0">Aucune donnée disponible</p>
              <p className="fr-m-0 italic text-tx-mention-grey">
                (DSN non prise en compte sur ce site{" "}
              </p>
              <p className="fr-m-0 italic text-tx-mention-grey">
                ou non déclarée par l'établissement).
              </p>
            </>
          ) : (
            <ul className="fr-p-0 list-outside list-none">
              {payload.map(({ value, name, unit, color, stroke }) => {
                const formattedValue =
                  value && Number(value) ? formatNumber(value as number) : value

                // @ts-ignore: Rechart types incorrect for ValueType
                if (value === false) return null

                return (
                  <li style={{ color: stroke || color }} key={name}>
                    <span className="font-bold">{formattedValue} </span>{" "}
                    {unit ? `${unit} en ` : ""}
                    {name}
                  </li>
                )
              })}
            </ul>
          )}
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
            right: 20,
            left: 20,
            bottom: 120,
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
            dy={25}
            interval={0}
            stroke="var(--text-mention-grey)"
          />
          <YAxis
            interval="preserveStart"
            tickCount={8}
            allowDecimals={false}
            stroke="var(--text-mention-grey)"
            type="number"
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
            align="right"
            className="fr-ml-3w"
            iconSize={30}
            formatter={(value, entry) => {
              // @ts-ignore: Rechart types incorrect for payload
              const color = entry?.payload?.stroke || "var(--text-mention-grey)"
              return <span style={{ color }}>{value}</span>
            }}
            layout="vertical"
            onMouseEnter={handleMouseEnterLegend}
            onMouseLeave={handleMouseLeaveLegend}
            verticalAlign="top"
            wrapperStyle={{ marginRight: "-1em", marginTop: "2em" }}
          />

          <Bar
            dataKey="cdi"
            fill="var(--artwork-minor-blue-cumulus)"
            stroke="var(--artwork-minor-blue-cumulus)"
            strokeOpacity={barOpacity.cdd}
            fillOpacity={barOpacity.cdi}
            name="CDI"
            stackId="fakeBarForLegend"
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

          {/* The reference areas are gray areas displayed when no data is available (closed company or data not integrated yet) */}
          <ReferenceArea
            x1={pastX1}
            x2={pastX2}
            y1={0}
            y2={grayAreasData.maxHeight}
            ifOverflow="hidden"
            fill="var(--background-contrast-grey)"
            fillOpacity={100}
          />
          <ReferenceArea
            x1={futureX1}
            x2={futureX2}
            y1={0}
            y2={grayAreasData.maxHeight}
            ifOverflow="hidden"
            fill="var(--background-contrast-grey)"
            fillOpacity={100}
            isFront
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
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
