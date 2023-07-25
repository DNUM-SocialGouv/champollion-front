import { ReactNode, useCallback, useState } from "react"

import { Button } from "@codegouvfr/react-dsfr/Button"

export default function AppCollapse({
  children,
  defaultExpanded = false,
  id = "app-collapse",
  label = "Voir plus",
  labelOpen: labelOpenProps,
  shortDesc,
}: {
  children: ReactNode
  defaultExpanded?: boolean
  id?: string
  label?: string
  labelOpen?: string
  shortDesc?: ReactNode
}) {
  const labelOpen = labelOpenProps || "Voir moins"
  const collapseElementId = `${id}-collapse`
  const [expandedState, setExpandedState] = useState(defaultExpanded)

  const onExtendButtonClick = useCallback(() => {
    setExpandedState((value) => !value)
  }, [])
  return (
    <>
      {shortDesc}
      <div
        className="fr-pl-2w fr-collapse border-0 border-l border-solid border-bd-default-grey"
        id={collapseElementId}
      >
        {children}
      </div>

      <Button
        iconId="fr-icon-arrow-down-s-line"
        iconPosition="right"
        onClick={onExtendButtonClick}
        nativeButtonProps={{
          "aria-expanded": expandedState,
          "aria-controls": collapseElementId,
          className:
            " after:content-['*'] after:transition-transform  after:duration-500 after:aria-expanded:-rotate-180",
        }}
        priority="tertiary no outline"
        size="small"
        type="button"
      >
        {!!labelOpenProps && expandedState ? labelOpen : label}
      </Button>
    </>
  )
}
