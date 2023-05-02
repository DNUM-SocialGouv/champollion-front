import { Accordion } from "@codegouvfr/react-dsfr/Accordion"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import AppTable, { Header } from "../../components/AppTable"
import { Fragment } from "react"
import {
  FormattedPreviousContractWithDelay,
  formatInfractions,
  infractions,
} from "../../helpers/carence"

export async function loader() {
  // working with mock while waiting for endpoint
  return 0
}

const headers = [
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "startDate", label: "Date de début", width: "10%" },
  { key: "endDate", label: "Date de fin", width: "10%" },
  { key: "delay", label: "Délai de carence", width: "10%" },
  { key: "nextPossibleDate", label: "Date de prochain contrat possible", width: "15%" },
  { key: "motive", label: "Motif de recours", width: "20%" },
  { key: "contractType", label: "Nature de contrat", width: "10%" },
] as Header<FormattedPreviousContractWithDelay>[]

export default function EtabCarence() {
  const { ExportModal, exportModalButtonProps } = createModal({
    name: "Export",
    isOpenedByDefault: false,
  })

  const formattedInfractions = formatInfractions(infractions)

  const totalInfractions: number = formattedInfractions.reduce(
    (acc, current) => acc + current.count,
    0
  )

  return (
    <>
      <div className="fr-mb-3w">
        <div className="flex justify-between">
          <h2 className="fr-text--xl fr-mb-1w">
            Infractions potentielles au délai de carence
          </h2>
          <Button
            {...exportModalButtonProps}
            iconId="fr-icon-download-line"
            priority="tertiary no outline"
            type="button"
          >
            Exporter
          </Button>
        </div>
        <ExportModal title="Fonctionnalité d'export à venir">
          <p>La fonctionnalité d'export est en cours de développement.</p>
          <p>Elle permettra de télécharger les tableaux d'infractions présumées.</p>
        </ExportModal>
        <hr />
        <p>{totalInfractions} infractions potentielles.</p>
        <div className="fr-accordions-group">
          {formattedInfractions.map((infractionByJobTitle) => (
            <Accordion
              label={`${infractionByJobTitle.jobTitle}  –  ${infractionByJobTitle.count} infraction(s) potentielle(s)`}
              key={infractionByJobTitle.jobTitle}
            >
              {infractionByJobTitle.list.map((posteInfraction, index) => (
                <Fragment key={posteInfraction.contract.id}>
                  <p className="fr-mb-0">
                    {`${index + 1}) Le contrat temporaire de ${
                      posteInfraction.contract.employee
                    }, employé(e)
                  en tant que ${posteInfraction.contract.jobTitle}
                  du ${posteInfraction.contract.startDate} au
                  ${posteInfraction.contract.endDate} (renouvellement inclus) au motif
                  d'accroissement temporaire d'activité, ne respecte pas le délai de
                  carence des contrats ci-dessous :`}
                  </p>
                  <AppTable headers={headers} items={posteInfraction.previousContracts} />
                </Fragment>
              ))}
            </Accordion>
          ))}
        </div>
      </div>
    </>
  )
}
