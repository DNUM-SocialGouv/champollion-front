import { ChangeEvent, useState } from "react"
import ls from "localstorage-slim"
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router-dom"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"
import { Stepper } from "@codegouvfr/react-dsfr/Stepper"
import { Input } from "@codegouvfr/react-dsfr/Input"

type DateRange = { startDate: string; endDate: string }

type CarenceParametresLoader = {
  savedDates: DateRange
  savedOpenDays: string[]
}

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const openDays = Object.keys(data)
    .filter((key) => key.includes("open-day"))
    .map((key) => data[key])
  ls.set(`carence.${params.siret}.dates`, {
    startDate: data["start-date"],
    endDate: data["end-date"],
  })
  ls.set(`carence.${params.siret}.openDays`, openDays)
  return redirect("../postes")
}

export function loader({ params }: LoaderFunctionArgs) {
  const localDates = ls.get(`carence.${params.siret}.dates`) as DateRange
  const localOpenDays = ls.get(`carence.${params.siret}.openDays`)
  const savedDates: DateRange = {
    startDate: localDates?.startDate || "",
    endDate: localDates?.endDate || "",
  }
  const savedOpenDays: string[] = Array.isArray(localOpenDays) ? localOpenDays : []
  return {
    savedDates,
    savedOpenDays,
  } as CarenceParametresLoader
}

export default function CarenceParametres() {
  const { savedDates, savedOpenDays } = useLoaderData() as CarenceParametresLoader
  const daysName = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ]
  const openDaysCheckboxValues = [0, 1, 2, 3, 4, 5, 6].map(
    (key) => !!savedOpenDays.find((day) => day === String(key))
  )
  const initialOpenDays =
    savedOpenDays.length > 0
      ? openDaysCheckboxValues
      : [true, true, true, true, true, false, false]
  const [openDays, setOpenDays] = useState([...initialOpenDays])
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const dayIdx = parseInt(event.target.value)
    const newOpenDays = [...openDays]
    newOpenDays[dayIdx] = event.target.checked
    setOpenDays(newOpenDays)
  }
  const openDaysOptions = daysName.map((day, idx) => {
    return {
      label: day,
      nativeInputProps: {
        name: `open-day-${day}`,
        checked: openDays[idx],
        value: idx,
        onChange: handleChange,
      },
    }
  })

  const [dates, setDates] = useState(savedDates)
  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === "start-date")
      setDates({ ...dates, startDate: event.target.value })
    if (event.target.name === "end-date")
      setDates({ ...dates, endDate: event.target.value })
  }

  return (
    <>
      <Stepper
        currentStep={1}
        nextTitle="Fusionner des postes"
        stepCount={3}
        title="Choix des paramètres d'analyse"
      />
      <Form className="flex flex-col" method="post">
        <div className="fr-mb-3w md:w-1/2">
          <Input
            label="Date de début"
            nativeInputProps={{
              type: "date",
              name: "start-date",
              value: dates.startDate,
              onChange: handleDateChange,
              required: true,
            }}
          />
          <Input
            label="Date de fin"
            nativeInputProps={{
              type: "date",
              name: "end-date",
              value: dates.endDate,
              onChange: handleDateChange,
              required: true,
            }}
          />
        </div>
        <Checkbox
          legend="Jours d'ouverture habituels"
          options={openDaysOptions}
          orientation="horizontal"
          state="default"
          stateRelatedMessage="State description"
        />
        <Button className="self-end" type="submit">
          Suivant
        </Button>
      </Form>
    </>
  )
}
