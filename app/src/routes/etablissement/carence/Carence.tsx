import { useSearchParams, useNavigation } from "react-router-dom"
import { useLoaderData } from "react-router-typesafe"
import { useEffect } from "react"

import type { IDCC } from "../../../api/types"
import {
  getLegislationOptionFromKey,
  legislationDetails,
  legislationOptions,
} from "../../../helpers/carence"
import { formatDate } from "../../../helpers/date"
import { createFiltersQuery } from "../../../helpers/format"

import { initJobOptions } from "../../../helpers/postes"
import { trackEvent } from "../../../helpers/analytics"

import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Select } from "@codegouvfr/react-dsfr/Select"

import Collapse from "../../../components/Collapse"
import Rebound from "../../../components/Rebound"
import Deferring from "../../../components/Deferring"
import EstablishmentFilters from "../../../components/establishment/EstablishmentFilters"
import NoticeCorrectData from "../../../components/NoticeCorrectData"
import { CarenceLoader } from "./CarenceLoader"
import { isAppError } from "../../../helpers/errors"
import CarenceInfraction from "./CarenceInfraction"

const modal = createModal({
  id: "export-modal",
  isOpenedByDefault: false,
})

export default function Carence() {
  const {
    deferredCalls,
    deferredCallsController,
    idccData,
    legislationCode,
    postes,
    queryJobs,
    queryStartDate,
    queryEndDate,
    raisonSociale,
    jobListWithoutMerges,
    formattedMergesIds,
  } = useLoaderData<typeof CarenceLoader>()
  const navigation = useNavigation()
  if (navigation.state === "loading") {
    deferredCallsController.abort()
  }

  const [searchParams, setSearchParams] = useSearchParams()

  const jobOptions = initJobOptions(postes)

  const carenceMotives = [2]
  const carenceNatures = ["02", "03"]

  const filtersQuery = createFiltersQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
    motives: carenceMotives,
    natures: carenceNatures,
    jobs: queryJobs,
  })

  let legislationData: Record<string, IDCC> | null = null
  if (!isAppError(idccData)) legislationData = idccData

  const initialLegislationOption =
    legislationData &&
    legislationOptions(legislationData).find((option) => option.value === legislationCode)

  const selectedLegislationDetail =
    legislationData &&
    legislationDetails(legislationData).find((idcc) => idcc.key == legislationCode)

  const detailElement = () => (
    <div className="fr-p-2w fr-mb-2w rounded-2xl border border-solid border-bd-default-grey bg-bg-alt-grey">
      <div>
        <b>Nom de l'accord : </b> {selectedLegislationDetail?.fullTitle}
      </div>
      {selectedLegislationDetail?.idccDate && (
        <div>
          <b>Date de l'accord : </b>
          {formatDate(selectedLegislationDetail.idccDate)}
        </div>
      )}
      {selectedLegislationDetail?.idccExtensionDate && (
        <div>
          <b>Date de l'arrêté d'extension : </b>
          {formatDate(selectedLegislationDetail.idccExtensionDate)}
        </div>
      )}
      <div className="fr-mt-2w">
        {selectedLegislationDetail?.description?.main}

        {selectedLegislationDetail?.description?.details && (
          <ul className="fr-my-0">
            {selectedLegislationDetail.description.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  const handleLegislationSelected = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newKey = Number(event.target.value)
    const newLegislationOption = legislationData
      ? getLegislationOptionFromKey(newKey, legislationData)
      : { value: "droitCommun" }
    const legislationValue = newLegislationOption?.value
    searchParams.set("legislation", legislationValue)
    setSearchParams(searchParams)
    trackEvent({
      category: "Carence",
      action: "IDCC sélectionné",
      properties: legislationValue,
    })
  }

  useEffect(() => {
    document.title = `Délai de carence - ${raisonSociale}`
  }, [])

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mb-1w">Module de filtres</h2>
        <hr />
        <EstablishmentFilters
          startDate={queryStartDate}
          endDate={queryEndDate}
          natures={carenceNatures}
          motives={carenceMotives}
          jobs={queryJobs}
          jobOptions={jobOptions}
          disabledFilters={{ natures: true, motives: true }}
        />

        <NoticeCorrectData />

        <div className="flex justify-between">
          <h2 className="fr-text--xl fr-mb-1w">
            Infractions potentielles au délai de carence
          </h2>

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
          <p>La fonctionnalité d'export est en cours de développement.</p>
          <p>Elle permettra de télécharger les tableaux d'infractions potentielles.</p>
        </modal.Component>

        <hr />

        {legislationData !== null && (
          <>
            <Select
              className="md:w-3/4"
              label="Accord de branche étendu"
              hint="Code - Date de l'accord (Date de signature) - Mots clés"
              nativeSelectProps={{
                onChange: handleLegislationSelected,
                value: initialLegislationOption?.key || "0",
              }}
            >
              {legislationOptions(legislationData).map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>

            {selectedLegislationDetail &&
              Object.keys(selectedLegislationDetail).length > 0 && (
                <>
                  <Collapse
                    id="legislation-collapse"
                    className="fr-mb-2w"
                    label="Plus d'informations sur l'accord de branche"
                    labelOpen="Moins d'informations sur l'accord de branche"
                  >
                    {detailElement()}
                  </Collapse>
                </>
              )}
          </>
        )}

        <Deferring deferredPromise={deferredCalls?.data?.carences}>
          <CarenceInfraction
            queryJobs={queryJobs}
            queryStartDate={queryStartDate}
            queryEndDate={queryEndDate}
            jobListWithoutMerges={jobListWithoutMerges}
            formattedMergesIds={formattedMergesIds}
          />
        </Deferring>

        <h2 className="fr-text--xl fr-mb-1w fr-mt-3w">Actions</h2>
        <hr />
        <div className="fr-grid-row fr-grid-row--gutters">
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
              tracking={{ category: "Carence" }}
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Consulter les contrats analysés"
              linkProps={{
                to: {
                  pathname: "../contrats",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Contrats"
              tracking={{ category: "Carence" }}
            />
          </div>
          <div className="fr-col-12 fr-col-md-4">
            <Rebound
              desc="Lancer le diagnostic d'emploi permanent sur les contrats sélectionnés"
              linkProps={{
                to: {
                  pathname: "../recours-abusif",
                  search: filtersQuery ? `?${filtersQuery}` : "",
                },
              }}
              title="Recours abusif"
              tracking={{ category: "Carence" }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
