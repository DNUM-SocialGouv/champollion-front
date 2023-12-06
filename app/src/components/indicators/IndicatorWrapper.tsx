import { useState, type PropsWithChildren, type ReactNode } from "react"

import { trackEvent } from "../../helpers/analytics"

import { Table } from "@codegouvfr/react-dsfr/Table"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"

import Collapse from "../Collapse"

type IndicatorWrapperProps = {
  id: string
  readingNote: string
  subReadingNote?: string
  title: string
  subTitle?: string
  collapseReadingNote?: boolean
  bottomEl?: ReactNode
  table?: { headers: ReactNode[]; data: ReactNode[][] }
  tracking: { category: string }
}

export default function IndicatorWrapper({
  id,
  children,
  readingNote,
  subReadingNote,
  title,
  subTitle,
  collapseReadingNote = false,
  bottomEl,
  table,
  tracking,
}: PropsWithChildren<IndicatorWrapperProps>) {
  const [showTable, setShowTable] = useState(false)

  const readingNoteWithTitle = (
    <>
      <h5 className="fr-text--md fr-mb-1v font-bold">Note de lecture</h5>
      <p className={`fr-text--sm ${subReadingNote ? "fr-mb-0" : "fr-mb-1w"}`}>
        {readingNote}
      </p>
      {subReadingNote && <p className="fr-text--sm fr-mb-0 italic">{subReadingNote}</p>}
    </>
  )

  return (
    <>
      <h4 className="fr-text--md fr-mb-0">{title}</h4>
      {subTitle && <p className="fr-text--sm italic">{subTitle}</p>}

      {table !== undefined && showTable ? (
        <Table
          className="app-table--thin fr-mb-2w"
          headers={table.headers}
          data={table.data}
        />
      ) : (
        <>{children}</>
      )}

      {table !== undefined && (
        <ToggleSwitch
          label="Afficher les données sous forme de tableau"
          checked={showTable}
          onChange={(checked) => {
            setShowTable(checked)
            trackEvent({
              category: tracking.category,
              action: "Indicateur vue tableau",
              properties: checked ? "activée" : "désactivée",
            })
          }}
          classes={{ label: "w-full" }}
        />
      )}
      {collapseReadingNote ? (
        <Collapse
          className="fr-mb-1w"
          id={`${id}-collapse`}
          label="Voir la note de lecture"
          labelOpen="Fermer la note de lecture"
        >
          {readingNoteWithTitle}
        </Collapse>
      ) : (
        <>{readingNoteWithTitle}</>
      )}
      {bottomEl && <>{bottomEl}</>}
    </>
  )
}
