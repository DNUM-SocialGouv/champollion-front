import { FormEvent, useEffect, useState } from "react"
import { useNavigation } from "react-router-dom"
import { useLoaderData } from "react-router-typesafe"

import { createFiltersQuery } from "../../../helpers/format"
import { initJobOptions } from "../../../helpers/postes"

import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"

import Rebound from "../../../components/Rebound"
import ContractNatureIndicator from "../../../components/indicators/ContractNatureIndicator"
import Deferring from "../../../components/Deferring"

import EstablishmentFilters from "../../../components/establishment/EstablishmentFilters"
import NoticeCorrectData from "../../../components/NoticeCorrectData"
import { RecoursLoader } from "./RecoursLoader"
import PostesEffectifs from "./PostesEffectifs"

import captureChart from "../../../components/indicators/ChartCapture"
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons"

const modal = createModal({
  id: "export-modal",
  isOpenedByDefault: false,
})

export default function Recours() {
  const {
    deferredCalls,
    deferredCallsController,
    postes,
    queryEndDate,
    queryJobs,
    queryMotives,
    queryStartDate,
    raisonSociale,
    unit,
    jobListWithoutMerges,
    formattedMergesIds,
  } = useLoaderData<typeof RecoursLoader>()
  const navigation = useNavigation()
  if (navigation.state === "loading") {
    deferredCallsController.abort()
  }

  const effectifsNatures = ["01", "02", "03"]

  const filtersQuery = createFiltersQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: queryMotives,
    natures: [], // all natures selected is equivalent to none selected
    jobs: queryJobs,
  })
  const jobOptions = initJobOptions(postes)

  const initialEffectifs = deferredCalls.data.effectifsData

  const [effectifs, setEffectifs] = useState(initialEffectifs)
  const [prevEffectifs, setPrevEffectifs] = useState(initialEffectifs)
  if (initialEffectifs !== prevEffectifs) {
    setPrevEffectifs(initialEffectifs)
    setEffectifs(initialEffectifs)
  }

  useEffect(() => {
    document.title = `Recours abusif - ${raisonSociale}`
  }, [])

  const initialExportOptions = [
    {
      label: "Évolution des effectifs",
      nativeInputProps: {
        defaultChecked: false,
        value: "PostesEffectifs",
      },
    },
    {
      label: "Natures de contrat les plus utilisées",
      nativeInputProps: {
        defaultChecked: true,
        value: "ContractsPieChart",
      },
    },
  ]

  const [exportOptions, setExportOptions] = useState(initialExportOptions)

  const exportButton = () => {
    document.querySelector("#PostesEffectifs") == null
      ? setExportOptions([initialExportOptions[1]])
      : setExportOptions(initialExportOptions)

    modal.open()
  }

  const onDownloadExportChart = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const selectedChart = formData.get("SelectChart")

    if (selectedChart) {
      const choiceChart = selectedChart.toString()

      captureChart(
        raisonSociale,
        queryJobs,
        queryStartDate,
        queryEndDate,
        choiceChart,
        postes,
        jobListWithoutMerges,
        queryMotives,
        formattedMergesIds
      )
    }

    modal.close()
  }

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mb-1w">Module de filtres</h2>
        <hr />
        <EstablishmentFilters
          startDate={queryStartDate}
          endDate={queryEndDate}
          natures={effectifsNatures}
          motives={queryMotives}
          jobs={queryJobs}
          jobOptions={jobOptions}
          disabledFilters={{ natures: true }}
        />
        <NoticeCorrectData />

        <div className="flex justify-between">
          <h2 className="fr-text--xl fr-mb-1w">Évolution des effectifs</h2>
          <Button
            onClick={exportButton}
            iconId="fr-icon-download-line"
            priority="tertiary no outline"
            type="button"
          >
            Exporter
          </Button>
        </div>
        <modal.Component title="Export Graphique">
          <p>Vous pouvez exporter les graphiques sous format image PNG.</p>
          <p>Tous les filtres sauvegardés seront pris en compte.</p>
          <form onSubmit={onDownloadExportChart}>
            <RadioButtons
              legend="Sélectionnez le graphique a télécharger"
              name="SelectChart"
              options={exportOptions}
            />
            <Button type="submit">Télécharger</Button>
          </form>
        </modal.Component>
        <hr />

        <Deferring deferredPromise={effectifs}>
          <PostesEffectifs defaultUnit={unit} />
        </Deferring>

        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">
          Natures de contrat les plus utilisées
        </h2>
        <hr />

        <Deferring deferredPromise={deferredCalls.data.contractNatureIndicator}>
          <ContractNatureIndicator
            hasMotives={queryMotives.length > 0}
            hasJobs={queryJobs.length > 0}
            tracking={{ category: "Recours abusif" }}
          />
        </Deferring>

        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
        <hr />
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Consulter les contrats correspondant à l'histogramme"
              linkProps={{
                to: {
                  pathname: "../contrats",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Contrats"
              tracking={{ category: "Recours abusif" }}
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Fusionner plusieurs libellés du même poste"
              linkProps={{
                to: {
                  pathname: "../postes",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Fusion de postes"
              tracking={{ category: "Recours abusif" }}
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Lancer le diagnostic d'anomalie des délais de carence sur les contrats sélectionnés"
              linkProps={{
                to: {
                  pathname: "../carence",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Délai de carence"
              tracking={{ category: "Recours abusif" }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
