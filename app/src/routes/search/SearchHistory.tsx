import { Link } from "react-router-dom"
import Collapse from "../../components/Collapse"

export default function SearchHistory({ searchHistory }: { searchHistory: string[][] }) {
  const etablissement = (siret?: string, name?: string) => (
    <li key={siret} className="list-inside">
      SIRET <b>{siret}</b> –{" "}
      <Link to={`/etablissement/${siret}`}>
        {name &&
          name.replace(/\w+/g, function (w) {
            return w?.[0]?.toUpperCase() + w.slice(1).toLowerCase()
          })}
      </Link>
    </li>
  )

  const firstTwo = () =>
    searchHistory
      .slice(0, 2)
      .map(([siret, raisonSociale]) => etablissement(siret, raisonSociale))

  return (
    <>
      <h2 className="fr-text--lg fr-mb-1w font-bold">
        Vos dernières recherches d'établissement
      </h2>
      {searchHistory.length > 0 ? (
        searchHistory.length > 2 ? (
          <>
            <ul className="fr-m-0">
              <Collapse
                shortDesc={firstTwo()}
                id="search-history-collapse"
                label="Voir plus"
                labelOpen="Voir moins"
              >
                <ul className="fr-pl-0 fr-my-0">
                  {searchHistory
                    .slice(2)
                    .map(([siret, raisonSociale]) => etablissement(siret, raisonSociale))}
                </ul>
              </Collapse>
            </ul>
          </>
        ) : (
          <ul>
            {searchHistory.map(([siret, raisonSociale]) =>
              etablissement(siret, raisonSociale)
            )}
          </ul>
        )
      ) : (
        <p className="italic text-tx-disabled-grey">Aucun SIRET dans votre historique.</p>
      )}
    </>
  )
}
