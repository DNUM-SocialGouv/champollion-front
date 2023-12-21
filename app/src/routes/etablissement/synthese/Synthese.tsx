import { useEffect } from "react"

import { useNavigation } from "react-router-dom"
import { useLoaderData } from "react-router-typesafe"

import { isAppError } from "../../../helpers/errors"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import ContractNatureIndicator from "../../../components/indicators/ContractNatureIndicator"
import Deferring from "../../../components/Deferring"
import EstablishmentInfo from "../../../components/establishment/EstablishmentInfo"
import JobProportionIndicator from "../../../components/indicators/JobProportionIndicator"
import { SyntheseLoader } from "./SyntheseLoader"
import OperatingDays from "./OperatingDays"
import HeadcountIndicator from "./HeadcountIndicator"

export default function Synthese() {
  const {
    deferredCalls,
    deferredCallsController,
    info,
    lastEffectif,
    publicHolidays,
    raisonSociale,
    siret,
  } = useLoaderData<typeof SyntheseLoader>()
  const navigation = useNavigation()
  if (navigation.state === "loading") {
    deferredCallsController.abort()
  }
  console.log("synthese", {
    deferredCalls,
    deferredCallsController,
    info,
    lastEffectif,
    publicHolidays,
    raisonSociale,
    siret,
  })

  useEffect(() => {
    document.title = `Synthèse - ${raisonSociale}`
  }, [])

  return (
    <>
      <h2 className="fr-text--xl fr-mb-1w">Informations sur l'établissement</h2>
      <hr />
      {isAppError(info) ? (
        <>
          <Alert
            className="fr-mb-2w"
            description="Pas de données disponibles"
            severity="error"
            title="Erreur"
          />
        </>
      ) : (
        <EstablishmentInfo
          info={info}
          siret={siret}
          lastEffectif={(!isAppError(lastEffectif) && lastEffectif) || null}
        />
      )}
      <div className="fr-py-3w flex w-full flex-col">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Modifier les jours d'ouverture</h2>
        <hr />

        {isAppError(publicHolidays) ? (
          <>
            <Alert
              className="fr-mb-2w"
              description="Problème de récupération des jours fériés, ré-essayez plus tard."
              severity="error"
              title="Erreur"
            />
          </>
        ) : (
          <OperatingDays publicHolidays={publicHolidays} />
        )}

        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Chiffres clés</h2>
        <hr />
        <h3 className="fr-text--md underline underline-offset-4">Effectifs</h3>
        <Deferring deferredPromise={deferredCalls.data.headcountIndicator}>
          <HeadcountIndicator />
        </Deferring>

        <h3 className="fr-text--md underline underline-offset-4">
          Natures de contrat les plus utilisées
        </h3>
        <Deferring deferredPromise={deferredCalls.data.contractNatureIndicator}>
          <ContractNatureIndicator tracking={{ category: "Synthèse" }} />
        </Deferring>

        <h3 className="fr-text--md underline underline-offset-4">
          Postes les plus occupés
        </h3>

        <Deferring deferredPromise={deferredCalls.data.jobProportionIndicator}>
          <JobProportionIndicator showLearnMore tracking={{ category: "Synthèse" }} />
        </Deferring>
      </div>
    </>
  )
}
