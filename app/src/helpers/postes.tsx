import type { EtablissementPoste, Salarie } from "../api/types"
import type { AppError } from "./errors"
import { isAppError } from "./errors"
import { JobMergedBadge } from "./contrats"

import { components } from "react-select"
import type { MultiValueProps, OptionProps, SingleValueProps } from "react-select"

import type { Option } from "../components/AppMultiSelect"

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

export const initEmployeeOptions = (employees: Salarie[] | AppError) => {
  let options: Option[] = []
  if (!isAppError(employees)) {
    options = employees.map((employee) => {
      return {
        value: employee.salarieId,
        label: `${employee.nomFamille} ${employee.prenoms} – ${employee.dateNaissance}`,
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
