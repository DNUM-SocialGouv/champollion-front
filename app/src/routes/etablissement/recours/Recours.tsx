import { useEffect, useState } from "react"
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
            onClick={() => modal.open()}
            iconId="fr-icon-download-line"
            priority="tertiary no outline"
            type="button"
          >
            Exporter
          </Button>
        </div>
        <modal.Component title="Fonctionnalité d'export à venir">
          <p>
            La fonctionnalité d'export est en cours de développement. Elle permettra de
            copier l'histogramme en tant qu'image.
          </p>
          <p>
            En attendant, vous pouvez réaliser une capture d'écran de l'histogramme
            (raccourci clavier : Touche Windows + Maj + S).
          </p>
          <p>
            Vous pouvez également copier le tableau des effectifs dans votre presse-papier
            via le bouton <i>Copier le tableau</i>, et le coller dans un logiciel de
            traitement de texte ou un tableur.
          </p>
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
