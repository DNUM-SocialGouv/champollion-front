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
import { AppSpinner } from "./Deferring"

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
  const [exportedData, setExportedData] = useState<undefined | AppError>()
  const [loading, setLoading] = useState(false)

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
      setLoading(true)
      try {
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
        setExportedData(newExportedCarences)
      } catch (error) {
        console.error("Failed to export carences:", error)
      } finally {
        setLoading(false)
      }
      trackEvent({
        category: "Carences",
        action: "Export téléchargé",
        properties: { format: fileExtension },
      })
    } else {
      setLoading(true)

      try {
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
        setExportedData(newExportedContracts)
      } catch (error) {
        console.error("Failed to export contracts:", error)
      } finally {
        setLoading(false)
      }
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
        <Button type="submit" disabled={loading}>
          {loading ? <AppSpinner /> : "Télécharger"}
        </Button>
      </form>
      <p className="fr-mt-2w italic">
        ⚠️ Si vous exportez un gros volume de {typeExport}, le téléchargement peut durer
        plusieurs secondes.
      </p>
      {isAppError(exportedData) && (
        <Alert
          className="fr-mb-2w"
          severity="error"
          title={exportedData.messageFr}
          description={errorDescription(exportedData)}
        />
      )}
    </exportModal.Component>
  )
}
