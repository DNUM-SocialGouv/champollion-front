import Alert from "@codegouvfr/react-dsfr/Alert"
import Button from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons"
import { AppError, errorDescription, isAppError } from "../helpers/errors"
import { CorrectedDates, extensions, radioBtnOptions } from "../helpers/contrats"
import { FormEvent, useState } from "react"
import { postCarencesExport } from "../api"
import { postContratsExport } from "../api"
import { FileExtension } from "../api/types"
import { trackEvent } from "../helpers/analytics"

export const exportModal = createModal({
  id: "export-modal",
  isOpenedByDefault: false,
})

type ExportModalProps = {
  isCarence: boolean
  companyName: string
  correctedDates: CorrectedDates | undefined
  queryEndDate: string | undefined
  etabId: number
  queryJobs: number[]
  siret: string
  queryStartDate: string
  mergedPostesIds?: number[][] | undefined
  queryEmployee?: number | undefined
  queryMotives?: number[]
  queryNature?: string[]
  page?: number
}

export default function ExportModal({
  isCarence,
  companyName,
  correctedDates,
  queryEmployee,
  queryEndDate,
  etabId,
  queryMotives,
  queryNature,
  page,
  queryJobs,
  siret,
  queryStartDate,
  mergedPostesIds,
}: ExportModalProps) {
  const [exportedContracts, setExportedContracts] = useState<undefined | AppError>()

  let typeExport: "Carences" | "Contrats"
  let modalTitle: string

  const onDownloadExport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const fileExtension = formData.get("file-extension") as FileExtension
    const format: FileExtension =
      typeof fileExtension === "string" && extensions.includes(fileExtension)
        ? fileExtension
        : "ods"

    if (isCarence) {
      const newExportedCarences = await postCarencesExport({
        companyName,
        correctedDates,
        endDate: queryEndDate,
        format,
        id: etabId,
        mergedPostesIds,
        postesIds: queryJobs,
        siret,
        startDate: queryStartDate,
      })
      setExportedContracts(newExportedCarences)
      trackEvent({
        category: "Carences",
        action: "Export téléchargé",
        properties: { format: fileExtension },
      })
    } else {
      const newExportedContracts = await postContratsExport({
        companyName,
        correctedDates,
        employeesIds: queryEmployee ? [queryEmployee] : undefined,
        endDate: queryEndDate,
        format,
        id: etabId,
        mergedPostesIds,
        motives: queryMotives,
        natures: queryNature,
        page,
        postesIds: queryJobs,
        siret,
        startDate: queryStartDate,
      })
      setExportedContracts(newExportedContracts)
      trackEvent({
        category: "Contrats",
        action: "Export téléchargé",
        properties: { format: fileExtension },
      })
    }

    exportModal.close()
  }

  if (isCarence) {
    typeExport = "Carences"
    modalTitle = "Exporter les carences"
  } else {
    typeExport = "Contrats"
    modalTitle = "Exporter les contrats"
  }

  return (
    <exportModal.Component title={modalTitle}>
      <p>
        Vous pouvez exporter les {typeExport} au format tableur (Excel, LibreOffice ou
        CSV).
      </p>
      <p>
        Tous les filtres sauvegardés, les fusions de postes et les corrections de date
        seront pris en compte.
      </p>
      <form onSubmit={onDownloadExport}>
        <RadioButtons
          legend="Sélectionnez le format de fichier :"
          name="file-extension"
          options={radioBtnOptions}
        />
        <Button type="submit">Télécharger</Button>
      </form>
      <p className="fr-mt-2w italic">
        ⚠️ Si vous exportez un gros volume de {typeExport}, le téléchargement peut durer
        plusieurs secondes.
      </p>
      {isAppError(exportedContracts) && (
        <Alert
          className="fr-mb-2w"
          severity="error"
          title={exportedContracts.messageFr}
          description={errorDescription(exportedContracts)}
        />
      )}
    </exportModal.Component>
  )
}
