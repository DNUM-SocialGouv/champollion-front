import { EtablissementPoste } from "../api/types"
import { components, MultiValueProps, OptionProps, SingleValueProps } from "react-select"
import { Option } from "../components/AppMultiSelect"
import Badge from "@codegouvfr/react-dsfr/Badge"
import { AppError, isAppError } from "./errors"

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
  queryPostes: string[],
  mergesLabels: string[][] | null
): string[] => {
  if (mergesLabels && mergesLabels.length > 0) {
    const allMerges = mergesLabels.flat()

    return queryPostes
      .map((poste) => {
        if (allMerges.includes(poste)) {
          return mergesLabels.find((arr) => arr.includes(poste)) ?? []
        }
        return poste
      })
      .flat()
  }
  return queryPostes
}

export const initOptions = (
  postes: EtablissementPoste[] | AppError,
  mergesLabels: string[][] | null
) => {
  let options: Option[] = []
  if (!isAppError(postes)) {
    const jobListWithMerge = getJobListWithMerge(postes, mergesLabels)
    options = jobListWithMerge
      .filter((poste) => !poste.isRedundant)
      .map((poste) => {
        return {
          value: poste.label,
          label: poste.label,
          display: poste.isMergeResult ? "merge" : "",
        } as Option
      })
  }

  return options
}

export const OptionWithMerge = (props: OptionProps<Option>) => {
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

export const SingleValueWithMerge = (props: SingleValueProps<Option>) => {
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

export const MultiValueWithMerge = (props: MultiValueProps<Option>) => {
  const selectedData = props.data as Option
  const removeProps = props.removeProps as {
    onClick: () => void
    onTouchEnd: () => void
  }
  return (
    <>
      <button
        className="fr-btn--icon-right fr-icon-close-line fr-tag fr-tag--sm fr-m-1v"
        aria-label={`Retirer ${selectedData.label}`}
        onClick={() => removeProps?.onClick && removeProps.onClick()}
        onTouchEnd={() => removeProps?.onTouchEnd && removeProps.onTouchEnd()}
        type="button"
      >
        {selectedData.label}
        {selectedData?.display === "merge" && (
          <Badge severity="new" className="fr-ml-1w" small>
            Fusionné
          </Badge>
        )}
      </button>
    </>
  )
}
