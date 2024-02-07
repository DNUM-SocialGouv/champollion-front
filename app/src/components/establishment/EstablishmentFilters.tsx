import { useEffect, useRef } from "react"
import { Form, useSearchParams } from "react-router-dom"

import { contractNatures, motiveOptions } from "../../helpers/filters"
import { minDateWithData } from "../../helpers/date"
import { arrayEquals } from "../../helpers/format"
import { MultiValueWithMerge, OptionWithMerge } from "../../helpers/postes"

import { Button } from "@codegouvfr/react-dsfr/Button"
import { Input } from "@codegouvfr/react-dsfr/Input"
import { Select } from "@codegouvfr/react-dsfr/Select"

import MultiSelect from "../MultiSelect"
import type { MultiSelectInstance, Option } from "../MultiSelect"

type EstablishmentFiltersProps = {
  startDate: string
  endDate: string
  motives?: number[]
  natures?: string[]
  jobs?: number[]
  jobOptions?: Option[]
  employee?: number
  employeeOptions?: Option[]
  disabledFilters?: Record<string, boolean>
}

const defaultDisabledFilters = {
  natures: false,
  motives: false,
  jobs: false,
}

export default function EstablishmentFilters({
  startDate,
  endDate,
  natures,
  motives,
  jobs,
  jobOptions,
  employee,
  employeeOptions,
  disabledFilters = defaultDisabledFilters,
}: EstablishmentFiltersProps) {
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)
  const naturesRef = useRef<MultiSelectInstance<Option> | null>(null)
  const motivesRef = useRef<MultiSelectInstance<Option> | null>(null)
  const jobsRef = useRef<MultiSelectInstance<Option> | null>(null)
  const employeesRef = useRef<HTMLSelectElement | null>(null)

  const [searchParams] = useSearchParams()
  const otherParamsToKeep: [string, string][] = []
  for (const entry of searchParams.entries()) {
    if (
      !["debut", "fin", "motif", "nature", "poste", "page", "salarie"].includes(entry[0])
    )
      // keep filters outside of EstablishmentFilters, such as unit in recours.tsx
      otherParamsToKeep.push(entry)
  }

  const natureOptions: Option[] = contractNatures.map((nature) => ({
    value: nature.code,
    label: nature.label,
  }))

  const natureSelectedOptions = natures
    ? natures
        .map(
          (nature) =>
            natureOptions.find((option) => option.value === nature) || ({} as Option)
        )
        .filter((option) => Object.keys(option).length > 0)
    : []

  const motiveSelectedOptions = motives
    ? motives
        .map(
          (motive) =>
            motiveOptions.find((option) => Number(option.value) === motive) ||
            ({} as Option)
        )
        .filter((option) => Object.keys(option).length > 0)
    : []

  const jobSelectedOptions =
    jobs &&
    jobOptions &&
    jobs
      .map((job) => jobOptions.find((option) => option.value === job) || ({} as Option))
      .filter((option) => Object.keys(option).length > 0)

  useEffect(() => {
    if (startDateRef.current) {
      const startDateInputEl = startDateRef.current.children[1]
        .lastChild as HTMLInputElement
      if (startDateInputEl && startDateInputEl?.value) startDateInputEl.value = startDate
    }
  }, [startDate])

  useEffect(() => {
    if (natures && naturesRef.current) {
      const areStateAndPropsEquals = arrayEquals(
        naturesRef.current.state.selectValue.map((option) => option.value),
        natures
      )
      if (!areStateAndPropsEquals && natureSelectedOptions) {
        naturesRef.current?.setValue(natureSelectedOptions, "select-option")
      }
    }
  }, [natures])

  useEffect(() => {
    if (endDateRef.current) {
      const endDateInputEl = endDateRef.current.children[1].lastChild as HTMLInputElement
      if (endDateInputEl && endDateInputEl?.value) endDateInputEl.value = endDate
    }
  }, [endDate])

  useEffect(() => {
    if (motives && motivesRef.current) {
      const areStateAndPropsEquals = arrayEquals(
        motivesRef.current.state.selectValue.map((option) => option.value),
        motives
      )
      if (!areStateAndPropsEquals && motiveSelectedOptions) {
        motivesRef.current?.setValue(motiveSelectedOptions, "select-option")
      }
    }
  }, [motives])

  useEffect(() => {
    if (jobs && jobsRef.current) {
      const areStateAndPropsEquals = arrayEquals(
        jobsRef.current.state.selectValue.map((option) => Number(option.value)),
        jobs
      )
      if (!areStateAndPropsEquals && jobSelectedOptions) {
        jobsRef.current?.setValue(jobSelectedOptions, "select-option")
      }
    }
  }, [jobs])

  useEffect(() => {
    if (employee && employeesRef.current) {
      employeesRef.current.value = String(employee)
    }
  }, [employee])

  return (
    <Form
      // reloadDocument // Todo remove reload document & fix filter reactivity (when nature or date change, contractDates are empty)
      method="get"
      className="fr-px-3w fr-py-2w fr-mb-2w border border-solid border-bd-default-grey bg-bg-alt-grey"
    >
      <div className="fr-grid-row fr-grid-row--gutters">
        <Input
          className="fr-col-12 fr-col-lg-6 fr-mb-1w"
          label="Début de la période"
          ref={startDateRef}
          nativeInputProps={{
            name: "debut",
            defaultValue: startDate,
            type: "date",
            min: minDateWithData,
          }}
        />
        <Input
          className="fr-col-12 fr-col-lg-6 fr-mb-1w"
          label="Fin de la période"
          ref={endDateRef}
          nativeInputProps={{
            name: "fin",
            defaultValue: endDate,
            type: "date",
            min: minDateWithData,
          }}
        />
        <MultiSelect
          className="fr-col-12 fr-col-lg-6 fr-mb-1w"
          label="Nature de contrat"
          name="nature"
          ref={naturesRef}
          options={natureOptions}
          defaultValue={natureSelectedOptions}
          disabled={disabledFilters?.natures ?? false}
        />
        <MultiSelect
          className="fr-col-12 fr-col-lg-6 fr-mb-1w"
          label="Motif de recours (ne s'applique pas au CDI)"
          name="motif"
          ref={motivesRef}
          options={motiveOptions}
          defaultValue={motiveSelectedOptions}
          disabled={disabledFilters?.motives ?? false}
        />
        {Boolean(jobOptions) && (
          <MultiSelect
            className="fr-col-12 fr-col-lg-6 fr-mb-1w"
            customComponents={{
              Option: OptionWithMerge,
              MultiValue: MultiValueWithMerge,
            }}
            label="Postes"
            name="poste"
            ref={jobsRef}
            options={jobOptions ?? []}
            defaultValue={jobSelectedOptions ?? []}
            disabled={disabledFilters?.jobs ?? false}
          />
        )}
        {Boolean(employeeOptions) && (
          <Select
            className="fr-col-12 fr-col-lg-6 fr-mb-1w"
            label="Salarié"
            nativeSelectProps={{
              name: "salarie",
              defaultValue: 0,
              ref: employeesRef,
            }}
          >
            <option key={0} value={0} className="italic text-tx-disabled-grey">
              Sélectionnez un salarié
            </option>
            {employeeOptions &&
              employeeOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
          </Select>
        )}
      </div>
      {otherParamsToKeep.length > 0 &&
        otherParamsToKeep.map((param) => (
          <input type="hidden" key={param[0]} name={param[0]} value={param[1]} />
        ))}
      <div className="fr-mt-1w flex flex-col justify-end gap-3 lg:flex-row">
        <Button
          linkProps={{ to: "", reloadDocument: false }}
          priority="secondary"
          className="w-full justify-center lg:w-auto"
        >
          Réinitialiser les paramètres
        </Button>
        <Button className="w-full justify-center lg:w-auto" type="submit">
          Sauvegarder
        </Button>
      </div>
    </Form>
  )
}
