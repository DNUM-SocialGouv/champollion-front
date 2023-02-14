import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import { getEtablissementInfo, getEtablissementType } from "../../api/etablissement"
import { EtablissementInfo } from "../../api/types"

import EtabInfo from "../../components/EtabInfo"

import AppBarChart from "../../components/AppBarChart"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"
import { useState } from "react"
import { MonthData } from "../../components/AppBarChart"

import * as dayjs from "dayjs"
import "dayjs/locale/fr"
dayjs.locale("fr")

export async function loader({ params }: LoaderFunctionArgs) {
  const siret = params.siret ? String(params.siret) : ""
  const { id: etabId } = await getEtablissementType(siret)
  const info = await getEtablissementInfo(etabId)

  return { info, siret }
}

export default function EtabSynthese() {
  const { info, siret } = useLoaderData() as { info: EtablissementInfo; siret: string }
  const [areTempContractsStacked, setAreTempContractsStacked] = useState(false)
  const [isETP, setIsETP] = useState(false)

  const startDate = "2021-01-01"
  function getRandomInt(max: number, min = 0) {
    return Math.floor(Math.random() * max + min)
  }

  const createFakeData = (length = 12) => {
    const fakeData: MonthData[] = []
    const addMonth = (index: number, arr: MonthData[]) => {
      const date = dayjs(startDate).add(index, "month")

      arr.push({
        date: date.format("YYYY-MM-DD"),
        label: dayjs(date).format("MMM YY"),
        name: dayjs(date).format("MMM YY"),
        cdd: getRandomInt(20),
        cdi: getRandomInt(50, 10),
        ctt: getRandomInt(30),
      })
    }
    for (let index = 0; index < length; index++) {
      addMonth(index, fakeData)
    }
    return fakeData
  }
  const [data, setData] = useState(createFakeData)

  const handleClick = () => {
    const date = dayjs(startDate).add(data.length, "month")

    setData([
      ...data,
      {
        date: date.format("YYYY-MM-DD"),
        label: dayjs(date).format("MMM YY"),
        name: dayjs(date).format("MMM YY"),
        cdd: getRandomInt(20),
        cdi: getRandomInt(50, 10),
        ctt: getRandomInt(30),
      },
    ])
  }

  return (
    <>
      <EtabInfo info={info} siret={siret} />
      <div className="fr-py-3w flex w-full flex-col">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Vue globale des contrats</h2>
        <hr />
        <div className="fr-mb-2w flex flex-wrap">
          <ToggleSwitch
            className="w-1/2"
            label="Empiler les barres des CDD et CTT"
            checked={areTempContractsStacked}
            onChange={(checked) => setAreTempContractsStacked(checked)}
          />
          <ToggleSwitch
            className="w-1/2"
            label="En ETP"
            checked={isETP}
            onChange={(checked) => {
              setIsETP(checked)
              const dataLength = data.length
              setData(createFakeData(dataLength))
            }}
          />
          <div className="w-1/2">
            <Button
              priority="secondary"
              size="medium"
              type="submit"
              onClick={handleClick}
            >
              Ajouter un mois
            </Button>
          </div>
        </div>
        <div className="h-[500px]">
          <AppBarChart
            isStacked={areTempContractsStacked}
            unit={isETP ? "ETP" : "contrats"}
            data={data}
          />
        </div>
      </div>
    </>
  )
}
