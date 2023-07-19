import { EtablissementPoste } from "../api/types"
import { components, MultiValueProps, OptionProps, SingleValueProps } from "react-select"
import { Option } from "../components/AppMultiSelect"
import { AppError, isAppError } from "./errors"
import { JobMergedBadge } from "./contrats"

export type MergeOptionObject = {
  id: number | string
  mergedOptions: Option[]
}

export const initJobOptions = (postes: EtablissementPoste[] | AppError) => {
  let options: Option[] = []
  if (!isAppError(postes)) {
    options = postes.map((poste) => {
      return {
        value: poste.posteId,
        label: poste.libellePoste,
        display: poste.merged ? "merge" : "",
      } as Option
    })
  }

  return options
}

export const OptionWithMerge = (props: OptionProps<Option>) => {
  return (
    <components.Option {...props}>
      {props.children}
      <JobMergedBadge merged={props.data?.display === "merge"} />
    </components.Option>
  )
}

export const SingleValueWithMerge = (props: SingleValueProps<Option>) => {
  return (
    <components.SingleValue {...props}>
      {props.children}
      <JobMergedBadge merged={props.data?.display === "merge"} />
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
        <JobMergedBadge merged={selectedData?.display === "merge"} />
      </button>
    </>
  )
}
