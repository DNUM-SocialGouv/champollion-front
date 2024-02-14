import React from "react"

type TooltipProps = {
  text: string
  description: string
}

const Tooltip: React.FC<TooltipProps> = ({ text, description }) => {
  return (
    <div className=" flex place-items-center">
      {text}
      <button
        className="fr-btn--tooltip fr-btn"
        id="button-2995"
        aria-describedby="tooltip-2994"
      ></button>
      <span
        className="fr-tooltip fr-placement"
        id="tooltip-2994"
        role="tooltip"
        aria-hidden="true"
      >
        {description}
      </span>
    </div>
  )
}
export default Tooltip
