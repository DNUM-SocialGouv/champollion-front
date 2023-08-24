import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts"
import { formatNumber } from "../helpers/format"

export type PieSlice = { name: string | null; value: number; percent: number }

type ContractsPieChartProps = {
  data: PieSlice[]
  sortData?: boolean
  showLegend?: boolean
}

const calculateSvgTextWidth = (textContent: string, fontSize: string) => {
  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  const tempText = document.createElementNS("http://www.w3.org/2000/svg", "text")
  tempText.setAttribute("font-size", fontSize)
  tempText.textContent = textContent
  tempSvg.appendChild(tempText)
  document.body.appendChild(tempSvg)
  const bbox = tempText.getBBox()
  document.body.removeChild(tempSvg)
  return bbox.width
}

export default function ContractsPieChart({
  data,
  sortData = false,
  showLegend = false,
}: ContractsPieChartProps) {
  const sortedData = data.filter((slice) => slice.percent > 0)

  /* OPTIONAL SORTING

  According to Donna M. Wong, best way to display a pie chart is:
  - Place the largest segment at 12 o'clock on the right
  - Place the second biggest at 12 o'clock on the left, the rest follows counter clockwise

  This chart starts at 12 o'clock going clockwise, so the order should be by increasing value,
  except for the biggest element at the first place.
  */
  if (sortData) {
    sortedData.sort((a, b) => a.value - b.value)
    const biggestEl = sortedData.pop()
    if (biggestEl) sortedData.unshift(biggestEl)
  }

  const colors: Record<string, string> = {
    CDI: "var(--artwork-minor-blue-cumulus)",
    CDD: "var(--artwork-minor-purple-glycine)",
    CTT: "var(--artwork-minor-pink-tuile)",
  }

  /* The code below handles overlapping labels for small shares of pie, and
    comes from: https://github.com/recharts/recharts/issues/490#issuecomment-1356721987
  */
  const renderCustomizedLabel = ({
    cx,
    cy,
    merged,
    midAngle,
    outerRadius,
    percent,
    name,
    fontSize,
    index,
  }: // Recharts type here is any :/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any) => {
    const RADIAN = Math.PI / 180
    const sin = Math.sin(RADIAN * midAngle)
    const cos = Math.cos(RADIAN * midAngle)
    const startLineX = cx + outerRadius * cos
    const startLineY = cy + outerRadius * -sin
    const middleLineY = cy + (outerRadius + 50 * Math.abs(sin)) * -sin
    let endLineX = startLineX + (cos >= 0 ? 1 : -1) * 60
    let textAnchor = cos >= 0 ? "start" : "end"
    const mirrorNeeded =
      midAngle > -270 && midAngle < -210 && percent < 0.04 && index % 2 === 1
    if (mirrorNeeded) {
      endLineX = startLineX + outerRadius * -cos * 2 + 100
      textAnchor = "start"
    }

    const textContent = `${name + " :" || ""} ${formatNumber(Number(percent))} %`
    const textWidth = calculateSvgTextWidth(textContent, fontSize)
    const textX =
      endLineX +
      (cos >= 0 || mirrorNeeded ? 1 : -1) * 12 +
      (!merged ? 0 : cos >= 0 || mirrorNeeded ? 0 : -20)
    const textY = middleLineY + fontSize / 2
    const badgeX = textX + 5 + (cos >= 0 || mirrorNeeded ? textWidth : 0)
    const badgeY = textY - 15

    return (
      <g>
        <path
          d={`M${startLineX},${startLineY}L${startLineX},${middleLineY}L${endLineX},${middleLineY}`}
          fill="none"
          stroke="black"
          strokeWidth={1.5}
        />
        <text
          x={textX}
          y={textY}
          fontSize={fontSize}
          textAnchor={textAnchor}
          fill="black"
        >
          {textContent}
        </text>
        {merged && (
          <>
            <rect
              width="18"
              height="18"
              rx="4"
              fill="var(--background-contrast-yellow-moutarde)"
              x={badgeX}
              y={badgeY}
            />
            <path
              transform={`translate(${badgeX + 3}, ${badgeY + 3}) scale(0.5)`}
              d="M13 10H20L11 23V14H4L13 1V10Z"
              fill="var(--text-action-high-yellow-moutarde)"
            />
          </>
        )}
      </g>
    )
  }

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sortedData}
            dataKey="value"
            nameKey="libellePoste"
            label={renderCustomizedLabel}
            labelLine={false}
            startAngle={90}
            endAngle={-270}
            fontSize={14}
            fill="red"
            outerRadius={60}
            cx={showLegend ? "25%" : "50%"}
            animationBegin={0}
            animationDuration={800}
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.name && colors[entry.name]
                    ? colors[entry.name]
                    : "var(--artwork-minor-blue-cumulus)"
                }
              />
            ))}
          </Pie>
          {showLegend && (
            <Legend
              align="center"
              className="fr-ml-3w"
              iconSize={30}
              formatter={(value, entry) => {
                // @ts-ignore: Recharts types incorrect for payload
                const color = entry?.payload?.fill || "var(--text-mention-grey)"
                const label = String(value).toUpperCase()
                // @ts-ignore: Recharts types incorrect for payload
                const percent = formatNumber(Number(entry?.payload?.percent))
                // @ts-ignore: Recharts types incorrect for payload
                const absoluteNumber = formatNumber(Number(entry?.payload?.value))
                return (
                  <span style={{ color, paddingLeft: ".5em" }}>
                    {label} : {percent} % ({absoluteNumber} jours)
                  </span>
                )
              }}
              layout="vertical"
              verticalAlign="middle"
              wrapperStyle={{ marginLeft: "10em" }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}
