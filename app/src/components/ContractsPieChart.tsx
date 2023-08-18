import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts"
import { formatNumber } from "../helpers/format"

type ContractsPieChartProps = {
  data: { name: string; value: number; percent: number }[]
}

export default function ContractsPieChart({ data }: ContractsPieChartProps) {
  const sortedData = [...data]
    .sort((a, b) => a.value - b.value)
    .filter((a) => a.value > 0)
  /* According to Donna M. Wong, best way to display a pie chart is:
    - Place the largest segment at 12 o'clock on the right
    - Place the second biggest at 12 o'clock on the left, the rest follows counter clockwise

    This chart starts at 12 o'clock going clockwise, so the order should be by increasing value,
    except for the biggest element at the first place.
   */
  const biggestEl = sortedData.pop()
  if (biggestEl) sortedData.unshift(biggestEl)
  const colors: Record<string, string> = {
    cdi: "var(--artwork-minor-blue-cumulus)",
    cdd: "var(--artwork-minor-purple-glycine)",
    ctt: "var(--artwork-minor-pink-tuile)",
  }

  /* The code below handles overlapping labels for small shares of pie, and
    comes from: https://github.com/recharts/recharts/issues/490#issuecomment-1356721987
  */
  const renderCustomizedLabel = ({
    cx,
    cy,
    fill,
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
    const startX = cx + outerRadius * cos
    const startY = cy + outerRadius * -sin
    const middleY =
      cy * (1 + (sin >= 0 ? 1 : -1) * 0.1) + (outerRadius + 50 * Math.abs(sin)) * -sin
    let endX = startX + (cos >= 0 ? 1 : -1) * 60
    let textAnchor = cos >= 0 ? "start" : "end"
    const mirrorNeeded =
      midAngle > -270 && midAngle < -210 && percent / 100 < 0.04 && index % 2 === 1
    if (mirrorNeeded) {
      endX = startX + outerRadius * -cos * 2 + 50
      textAnchor = "start"
    }
    const label = String(name).toUpperCase()
    const percentage = formatNumber(Number(percent))
    const formattedLabel = `${label} : ${percentage}%`

    return (
      <g>
        <path
          d={`M${startX},${startY}L${startX},${middleY}L${endX},${middleY}`}
          fill="none"
          stroke={fill}
          strokeWidth={1.5}
        />
        <text
          fill={fill}
          x={endX + (cos >= 0 || mirrorNeeded ? 1 : -1) * 12}
          y={middleY + fontSize / 2}
          textAnchor={textAnchor}
          fontSize={fontSize}
        >
          {formattedLabel}
        </text>
      </g>
    )
  }

  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            data={sortedData}
            dataKey="value"
            label={renderCustomizedLabel}
            labelLine={false}
            startAngle={90}
            endAngle={-270}
            fontSize={14}
            fill="#8884d8"
            outerRadius={60}
            cx={"25%"}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.name]} />
            ))}
          </Pie>
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
                  {label} : {percent}% ({absoluteNumber} jours)
                </span>
              )
            }}
            layout="vertical"
            verticalAlign="middle"
            wrapperStyle={{ marginLeft: "10em" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}
