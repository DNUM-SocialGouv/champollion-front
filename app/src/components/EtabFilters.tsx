import { useEffect, useRef } from "react"
import { Form, useSearchParams } from "react-router-dom"

import { arrayEquals } from "../helpers/format"
import { MultiValueWithMerge, OptionWithMerge } from "../helpers/postes"

import Input from "@codegouvfr/react-dsfr/Input"
import Checkbox from "@codegouvfr/react-dsfr/Checkbox"
import Button from "@codegouvfr/react-dsfr/Button"
import AppMultiSelect, { MultiSelectInstance, Option } from "./AppMultiSelect"

type EtabFiltersProps = {
  startDate: string
  endDate: string
  motives: string[]
  natures: string[]
  jobs: string[]
  jobOptions: Option[]
}

const motiveOptions: Option[] = [
  { value: 1, label: "Remplacement d'un salarié" },
  { value: 2, label: "Accroissement temporaire d'activité" },
  { value: 3, label: "Autre" },
]

export default function EtabFilters({
  startDate,
  endDate,
  natures,
  motives,
  jobs,
  jobOptions,
}: EtabFiltersProps) {
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)
  const cdiRef = useRef<HTMLInputElement>(null)
  const cddRef = useRef<HTMLInputElement>(null)
  const cttRef = useRef<HTMLInputElement>(null)
  const motivesRef = useRef<MultiSelectInstance<Option> | null>(null)
  const jobsRef = useRef<MultiSelectInstance<Option> | null>(null)

  const [searchParams] = useSearchParams()
  const otherParamsToKeep: [string, string][] = []
  for (const entry of searchParams.entries()) {
    if (!["debut", "fin", "motif", "nature", "poste", "page"].includes(entry[0]))
      otherParamsToKeep.push(entry)
  }

  const natureArr = [
    { key: "cdi", label: "CDI", ref: cdiRef },
    { key: "cdd", label: "CDD", ref: cddRef },
    { key: "ctt", label: "CTT (intérim)", ref: cttRef },
  ]

  const natureOptions = natureArr.map((nature) => {
    return {
      label: nature.label,
      nativeInputProps: {
        name: "nature",
        value: nature.key,
        defaultChecked: natures.includes(nature.key),
        ref: nature.ref,
      },
    }
  })

  const motiveSelectedOptions = motives
    .map(
      (motive) =>
        motiveOptions.find((option) => option.value === Number(motive)) || ({} as Option)
    )
    .filter((option) => Object.keys(option).length > 0)

  const jobSelectedOptions = jobs
    .map((job) => jobOptions.find((option) => option.value === job) || ({} as Option))
    .filter((option) => Object.keys(option).length > 0)

  useEffect(() => {
    if (startDateRef.current) {
      startDateRef.current.value = startDate
    }
  }, [startDate])

  useEffect(() => {
    if (endDateRef.current) {
      endDateRef.current.value = endDate
    }
  }, [endDate])

  useEffect(() => {
    if (motivesRef.current) {
      const areStateAndPropsEquals = arrayEquals(
        motivesRef.current.state.selectValue.map((option) => String(option.value)),
        motives
      )
      if (!areStateAndPropsEquals) {
        motivesRef.current?.setValue(motiveSelectedOptions, "select-option")
      }
    }
  }, [motives])

  useEffect(() => {
    if (jobsRef.current) {
      const areStateAndPropsEquals = arrayEquals(
        jobsRef.current.state.selectValue.map((option) => String(option.value)),
        jobs
      )
      if (!areStateAndPropsEquals) {
        jobsRef.current?.setValue(jobSelectedOptions, "select-option")
      }
    }
  }, [jobs])

  useEffect(() => {
    natureArr.forEach((nature) => {
      if (nature.ref.current) {
        nature.ref.current.checked = natures.includes(nature.key)
      }
    })
  }, [natures])

  return (
    <Form
      method="get"
      className="fr-px-3w fr-py-2w fr-mb-2w border border-solid border-bd-default-grey bg-bg-alt-grey"
    >
      <div className="fr-grid-row fr-grid-row--gutters">
        <Input
          className="fr-col-12 fr-col-lg-6 fr-mb-1w"
          label="Date de début"
          nativeInputProps={{
            ref: startDateRef,
            name: "debut",
            defaultValue: startDate,
            type: "date",
            min: "2019-01-01",
          }}
        />
        <Input
          className="fr-col-12 fr-col-lg-6 fr-mb-1w"
          label="Date de fin"
          nativeInputProps={{
            name: "fin",
            ref: endDateRef,
            defaultValue: endDate,
            type: "date",
            min: "2019-01-01",
          }}
        />
        {/* // todo handle startDate after endDate */}
        {/* nature and motive are temporarily hidden, waiting for updated endpoints */}
        <div className="fr-col-12 fr-col-lg-6 fr-mb-1w hidden">
          {/* extra div necessary to display correctly checkboxes in the grid, since it has negative margins */}
          <Checkbox
            legend="Nature de contrat"
            options={natureOptions}
            orientation="horizontal"
          />
        </div>
        <AppMultiSelect
          className="fr-col-12 fr-col-lg-6 fr-mb-1w hidden"
          label="Motif de recours"
          name="motif"
          ref={motivesRef}
          options={motiveOptions}
          defaultValue={motiveSelectedOptions}
        />
        <AppMultiSelect
          className="fr-col-12 fr-col-lg-6 fr-mb-1w"
          customComponents={{
            Option: OptionWithMerge,
            MultiValue: MultiValueWithMerge,
          }}
          label="Postes"
          name="poste"
          ref={jobsRef}
          options={jobOptions}
          defaultValue={jobSelectedOptions}
        />
      </div>
      {otherParamsToKeep.length > 0 &&
        otherParamsToKeep.map((param) => (
          <input type="hidden" name={param[0]} value={param[1]} />
        ))}
      <div className="fr-mt-1w flex flex-col justify-end gap-3 lg:flex-row">
        <Button
          linkProps={{ to: "" }}
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
