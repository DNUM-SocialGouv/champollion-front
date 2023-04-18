import { EtablissementPoste } from "../api/types"
import { components, OptionProps, SingleValueProps } from "react-select"
import { Option } from "../components/AppMultiSelect"
import Badge from "@codegouvfr/react-dsfr/Badge"
import { AppError, isAppError } from "./errors"

console.log("jello")
export type JobListWithMerge = {
  label: string
  isMergeResult: boolean
  isRedundant: boolean
}[]

export const getJobListWithMerge = (
  postes: EtablissementPoste[],
  mergesLabels: string[][] | null
): JobListWithMerge => {
  const mergedLabelsToDelete = mergesLabels?.map((merge) => merge.slice(1)).flat()
  const mergesResults = mergesLabels?.map((merge) => merge[0]).flat()

  return postes.map((poste) => {
    const label = poste.libelle
    const isRedundant = mergedLabelsToDelete?.includes(label) ?? false
    const isMergeResult = mergesResults?.includes(label) ?? false
    return {
      label,
      isMergeResult,
      isRedundant,
    }
  })
}

export const selectedPostesAfterMerge = (
  queryPoste: string,
  mergesLabels: string[][] | null
) => {
  let selectedPostesParam = queryPoste ? [queryPoste] : undefined
  if (
    mergesLabels &&
    mergesLabels.length > 0 &&
    mergesLabels.flat().includes(queryPoste)
  ) {
    selectedPostesParam = mergesLabels.find((arr) => arr.includes(queryPoste))
  }
  return selectedPostesParam
}

export const initOptions = (
  postes: EtablissementPoste[] | AppError,
  queryPoste: string,
  mergesLabels: string[][] | null
) => {
  let options: Option[] = []
  if (!isAppError(postes)) {
    const jobListWithMerge = getJobListWithMerge(postes, mergesLabels)

    options = jobListWithMerge
      .filter((poste) => !poste.isRedundant)
      .map((poste, index) => {
        return {
          value: index,
          label: poste.label,
          display: poste.isMergeResult ? "merge" : "",
        } as Option
      })
  }

  const initialPosteOption: Option =
    options.find((option) => option.label === queryPoste) || ({} as Option)

  return { options, initialPosteOption }
}

export const OptionComp = (props: OptionProps<Option>) => {
  return (
    <components.Option {...props}>
      {props.children}
      {props.data?.display === "merge" && (
        <Badge severity="new" className="fr-ml-1w" small>
          Fusionné
        </Badge>
      )}
    </components.Option>
  )
}

export const SingleValueComp = (props: SingleValueProps<Option>) => {
  return (
    <components.SingleValue {...props}>
      {props.children}
      {props.data?.display === "merge" && (
        <Badge severity="new" className="fr-ml-1w" small>
          Fusionné
        </Badge>
      )}
    </components.SingleValue>
  )
}
