import React, { Fragment } from "react"
import { useAsyncValue } from "react-router-dom"
import { EtablissementPoste, Infractions, MetaCarences } from "../../../api/types"
import {
  FormattedCarenceContract,
  FormattedInfraction,
  formatInfractions,
} from "../../../helpers/carence"
import { groupSmallData } from "../../../components/indicators/Charts/ContractsPieChart"
import Collapse from "../../../components/Collapse"
import InfractionRatioIndicator from "../../../components/indicators/InfractionRatioIndicator"
import { Accordion } from "@codegouvfr/react-dsfr/Accordion"
import { Badge } from "@codegouvfr/react-dsfr/Badge"

import { DelayByJobIndicator } from "./DelayByJobIndicator"
import { filtersDetail } from "../../../helpers/filters"
import Table, { Header } from "../../../components/Table"

import CarenceCalendar from "./CarenceCalendar"

interface CarenceInfractionType {
  queryJobs: number[]
  queryStartDate: string
  queryEndDate: string
  jobListWithoutMerges: EtablissementPoste[]
  formattedMergesIds: number[][] | undefined
}

const headers: Header<FormattedCarenceContract>[] = [
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "startDate", label: "Date de début", width: "10%" },
  { key: "endDate", label: "Date de fin", width: "10%" },
  { key: "delay", label: "Délai de carence", width: "10%" },
  { key: "nextPossibleDate", label: "Date de prochain contrat possible", width: "15%" },
  { key: "motive", label: "Motif de recours", width: "20%" },
  { key: "nature", label: "Nature de contrat", width: "10%" },
]

const accordionLabel = (job: FormattedInfraction) => (
  <>
    {job.jobTitle}
    {Boolean(job.merged) && (
      <Badge severity="new" className={"fr-ml-1w"} small>
        Fusionné
      </Badge>
    )}{" "}
    – {job.count} infraction(s) potentielle(s)
  </>
)

const CarenceInfraction: React.FC<CarenceInfractionType> = ({
  queryJobs,
  queryStartDate,
  queryEndDate,
  jobListWithoutMerges,
  formattedMergesIds,
}) => {
  const defaultData = useAsyncValue() as { infractions: Infractions; meta: MetaCarences }

  if (!defaultData) {
    console.error(
      "EtabCarenceInfraction didn't receive async deferred data. It must be used in a <Await> component from react-router."
    )
    return null
  }

  const formattedInfractions = formatInfractions(defaultData.infractions)

  const totalInfractions: number = formattedInfractions.reduce(
    (acc, current) => acc + current.count,
    0
  )

  const filtersInfo = filtersDetail({
    queryJobs,
    jobListWithoutMerges,
    localMerges: formattedMergesIds,
  })

  const pieData = groupSmallData(
    Object.values(defaultData.infractions).map((job) => ({
      name: job.libelle,
      merged: job.merged,
      value: job.count,
      percent: job.ratio,
    }))
  )

  return (
    <>
      <p>
        <span className="font-bold">{totalInfractions} </span>infractions potentielles.
      </p>

      {queryJobs.length > 0 && (
        <Collapse
          id="filters-collapse"
          className="fr-mb-1w"
          label="Afficher les postes sélectionnés"
          labelOpen="Masquer les postes sélectionnés"
          keepBtnOnTop
        >
          {filtersInfo}
        </Collapse>
      )}

      {totalInfractions > 0 && (
        <>
          <h3 className="fr-text--md underline underline-offset-4">
            Ratio de contrats en infractions potentielles
          </h3>

          <InfractionRatioIndicator
            meta={defaultData.meta}
            startDate={queryStartDate}
            endDate={queryEndDate}
            hasJobs={queryJobs.length > 0}
            tracking={{ category: "Carence" }}
          />

          <h3 className="fr-text--md underline underline-offset-4">
            Répartition par poste
          </h3>

          <DelayByJobIndicator
            data={pieData}
            startDate={queryStartDate}
            endDate={queryEndDate}
            hasJobs={queryJobs.length > 0}
          />
        </>
      )}

      <div className="fr-accordions-group">
        {formattedInfractions.map((infractionByJobTitle) => (
          <Accordion
            label={accordionLabel(infractionByJobTitle)}
            key={infractionByJobTitle.jobTitle}
          >
            {infractionByJobTitle.list.map((posteInfraction, index) => {
              return (
                <Fragment key={posteInfraction.illegalContract.id}>
                  <p className="fr-mb-0">
                    {`${index + 1}) Le contrat temporaire de ${
                      posteInfraction.illegalContract.employee
                    }, employé(e)
                    en tant que ${posteInfraction.illegalContract.jobTitle}
                    du ${posteInfraction.illegalContract.startDate} au
                    ${
                      posteInfraction.illegalContract.endDate
                    } (renouvellement inclus) au motif
                    d'accroissement temporaire d'activité, ne respecte pas le délai de
                    carence des contrats ci-dessous :`}
                  </p>

                  <Table
                    headers={headers}
                    items={posteInfraction.carenceContracts}
                    className="mb-1"
                  />
                  {posteInfraction && <CarenceCalendar infractions={posteInfraction} />}
                </Fragment>
              )
            })}
          </Accordion>
        ))}
      </div>
    </>
  )
}

export default CarenceInfraction
