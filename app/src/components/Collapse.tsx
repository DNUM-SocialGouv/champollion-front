import React from "react"

import { type ReactNode, useCallback, useState } from "react"

import { Button } from "@codegouvfr/react-dsfr/Button"

type CollapseProps = {
  borderLeft?: boolean
  children: ReactNode
  className?: string
  defaultExpanded?: boolean
  id: string
  keepBtnOnTop?: boolean
  label?: string
  labelOpen?: string
  shortDesc?: ReactNode
}

export default function Collapse({
  borderLeft,
  className,
  children,
  defaultExpanded = false,
  id,
  label = "Voir plus",
  labelOpen: labelOpenProps,
  shortDesc,
  keepBtnOnTop = false,
}: CollapseProps) {
  const labelOpen = labelOpenProps || "Voir moins"
  const collapseElementId = `${id}-collapse`
  const [expandedState, setExpandedState] = useState(defaultExpanded)

  const onExtendButtonClick = useCallback(() => {
    setExpandedState((value) => !value)
  }, [])
  return (
    <div className="flex flex-col">
      {shortDesc}
      <div
        className={`fr-collapse ${
          borderLeft
            ? "fr-pl-2w border-0 border-l border-solid border-bd-default-grey"
            : ""
        } ${expandedState ? "fr-collapse--expanded" : ""}`}
        id={collapseElementId}
      >
        {children}
      </div>

      <Button
        className={`-ml-3 ${className} ${keepBtnOnTop ? "order-first" : ""}`}
        iconId="fr-icon-arrow-down-s-line"
        iconPosition="right"
        onClick={onExtendButtonClick}
        nativeButtonProps={{
          "aria-expanded": expandedState,
          "aria-controls": collapseElementId,
          className:
            "after:content-['*'] after:transition-transform  after:duration-500 after:aria-expanded:-rotate-180",
        }}
        priority="tertiary no outline"
        size="small"
        type="button"
      >
        {!!labelOpenProps && expandedState ? labelOpen : label}
      </Button>
    </div>
  )
}
