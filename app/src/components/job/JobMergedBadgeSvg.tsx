export default function JobMergedBadgeSvg({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect
        width="18"
        height="18"
        rx="4"
        fill="var(--background-contrast-yellow-moutarde)"
        x={x}
        y={y}
      />
      <path
        transform={`translate(${x + 3}, ${y + 3}) scale(0.5)`}
        d="M13 10H20L11 23V14H4L13 1V10Z"
        fill="var(--text-action-high-yellow-moutarde)"
      />
    </>
  )
}
