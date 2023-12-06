import { useEffect } from "react"
import { Notice } from "@codegouvfr/react-dsfr/Notice"

export default function Bugs() {
  const notice = () => (
    <>
      Si vous rencontrez d'autres problèmes, veuillez nous en faire part à{" "}
      <a href="mailto:visudsn@sg.social.gouv.fr">visudsn@sg.social.gouv.fr</a>
    </>
  )

  useEffect(() => {
    document.title = "VisuDSN - Erreurs connues"
  }, [])

  return (
    <>
      <div className="fr-container fr-py-4w flex flex-col">
        <h1 className="fr-h2 fr-pt-4w text-center">Liste des erreurs connues</h1>
        <hr className="fr-mb-2w w-full" />
        <p>
          Nous avons connaissances de certains bugs de l'application, en attendant de les
          corriger voici la liste :
        </p>
        <ul>
          <li>
            <b>Problème de données ETP en février 2022</b>
            <p>
              Une erreur s'est produite lors de l'import des données DSN de février 2022 :
              1/3 des établissements ont des données manquantes en matière d'heures
              travaillées. Ainsi, les effectifs en ETP-heures pour le mois de février 2022
              doivent être considérés avec prudence. Ce sera corrigé lors de la prochaine
              importation de données, d'ici fin août, où nous mettrons à jour le site avec
              des données plus récentes.
            </p>
          </li>

          <li>
            <b>Perte des données modifiées</b>
            <p>
              Aujourd'hui vous pouvez apporter 3 types de corrections aux données DSN :
              les jours ouvrés, les dates de début et fin d'un contrat, et les fusions de
              libellé de poste. Pour proposer ces changements au plus vite, nous avons
              utilisé une méthode non pérenne. Les données sont sauvegardées localement
              sur votre navigateur. Donc si vous passez en navigation privée, sur un autre
              navigateur ou un autre ordinateur, vos modifications seront malheureusement
              perdues. C'est un point important pour nous mais qui demande du temps de
              développement. En 1e fix nous pensons créer des sauvegarde que vous pourrez
              stocker sur votre ordinateur, puis ultimemement les modifications seront
              sauvegardées de manière pérenne sur le site.
            </p>
          </li>
        </ul>

        <Notice title={notice()} />
      </div>
    </>
  )
}
