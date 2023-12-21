import { Fragment, useEffect, useState } from "react"
import { Form, Link, redirect } from "react-router-dom"
import type { ActionFunctionArgs } from "react-router-dom"
import { useActionData, useLoaderData } from "react-router-typesafe"
import ls from "localstorage-slim"

import { getEtablissementsType, getExternalLinks } from "../api"
import { isAppError } from "../helpers/errors"
import { releaseNotes } from "../helpers/news"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Input } from "@codegouvfr/react-dsfr/Input"
import { Notice } from "@codegouvfr/react-dsfr/Notice"
import artworkDataViz from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/data-visualization.svg"
import artworkDocument from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/document/document.svg"
import artworkMail from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/mail-send.svg"
import artworkCommunity from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/leisure/community.svg"
import artworkPassport from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/document/passport.svg"

import Collapse from "../components/Collapse"
import PictoTile from "../components/PictoTile"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const siret = formData.get("siret") ? String(formData.get("siret")) : ""
  const etabType = await getEtablissementsType(siret)

  if (!isAppError(etabType)) {
    let lsSirets = (ls.get("lastSirets") as string[][]) || []
    lsSirets = lsSirets.filter((element) => element && element[0] !== siret)
    lsSirets.unshift([siret, etabType.raisonSociale])
    if (lsSirets.length >= 10) lsSirets.splice(9, lsSirets.length - 1)
    ls.set("lastSirets", lsSirets)
    const redirectTo = etabType.ett ? `/ett/${siret}` : `/etablissement/${siret}`
    return redirect(redirectTo)
  } else {
    return etabType
  }
}

export async function loader() {
  const externalLinks = await getExternalLinks()

  if (!isAppError(externalLinks)) {
    return externalLinks
  } else {
    return []
  }
}

export default function Index() {
  const error = useActionData<typeof action>()
  const externalLinks = useLoaderData<typeof loader>()
  const [input, setInput] = useState("")
  const noticeText = `Vous consultez le site de démonstration, disposant uniquement de données fictives.
  Vous pouvez tester avec les SIRET suivants : établissement 12345678912345, ETT 98765432112345.`

  const externalLinksPicto: Record<string, string> = {
    dataviz: artworkDataViz,
    document: artworkDocument,
    passport: artworkPassport,
    mail: artworkMail,
    community: artworkCommunity,
  }
  const lsSirets = ls.get("lastSirets") as string[][]
  const searchHistory =
    lsSirets && lsSirets.length > 0
      ? lsSirets.filter((siretData) => siretData.length == 2)
      : []

  useEffect(() => {
    document.title = "VisuDSN - Accueil"
  }, [])

  return (
    <>
      <div className="fr-container">
        <div className="fr-mt-4w fr-grid-row--center fr-grid-row fr-mb-2w xxl:!mt-12">
          <div className="fr-col fr-col-lg-7 flex flex-col items-center">
            <h1 className="fr-h4 fr-mb-1w">Rechercher un établissement</h1>
            <hr className="fr-p-1w w-full" />
            <div className="flex w-full flex-col ">
              <Form className="fr-pt-1w flex items-end justify-center" method="post">
                <Input
                  className="w-3/4"
                  label="Entrez un SIRET"
                  nativeInputProps={{
                    name: "siret",
                    minLength: 14,
                    value: input,
                    onChange: (event) => setInput(event.target.value.replace(/\s/g, "")),
                  }}
                />
                <Button
                  priority="primary"
                  size="medium"
                  className="fr-mb-6v w-1/4 justify-center"
                  type="submit"
                >
                  Rechercher
                </Button>
              </Form>
              {Boolean(error) && isAppError(error) && (
                <Alert
                  className="fr-mb-2w"
                  description={error.messageFr}
                  severity="error"
                  title="Erreur"
                />
              )}
              <Notice className="fr-mb-2w" isClosable title={noticeText} />
            </div>
            <div className="fr-px-3w fr-py-2w w-full border border-solid border-bd-default-grey">
              <SearchHistory searchHistory={searchHistory} />
            </div>
          </div>
        </div>
      </div>

      {externalLinks.length > 0 && (
        <div className="fr-container-fluid fr-my-2w bg-bg-alt-blue-france xxl:!my-8">
          <div className="fr-container fr-py-2w xxl:!py-6">
            <h2 className="fr-text--xl fr-mb-2w font-bold">Liens utiles</h2>
            <div className="fr-grid-row fr-grid-row--gutters">
              {externalLinks.map(({ key, desc, title, href, picto }) => (
                <Fragment key={key}>
                  <div className="fr-col-12 fr-col-sm-6 fr-col-md-4 fr-col-lg-3">
                    <PictoTile
                      title={title}
                      desc={desc}
                      anchorProps={{
                        href,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }}
                      pictogramUrl={externalLinksPicto[picto]}
                    />
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="fr-container-fluid fr-my-2w bg-bg-alt-blue-france xxl:!my-8">
        <div className="fr-container fr-py-2w xxl:!py-6">
          <h2 className="fr-text--lg fr-mb-1w font-bold">
            Les nouvelles fonctionnalités !
          </h2>
          <ul>
            {releaseNotes[0].news[0].list.map((note, index) => (
              <li key={index}>{note.desc}</li>
            ))}
            <li>...</li>
          </ul>

          <Button
            iconId="fr-icon-arrow-right-line"
            iconPosition="right"
            priority="secondary"
            linkProps={{ to: "/nouveautes" }}
            size="small"
          >
            Voir toutes les dernières nouveautés
          </Button>
        </div>
      </div>
    </>
  )
}

function SearchHistory({ searchHistory }: { searchHistory: string[][] }) {
  const etablissement = (siret: string, name: string) => (
    <li key={siret} className="list-inside">
      SIRET <b>{siret}</b> –{" "}
      <Link to={`/etablissement/${siret}`}>
        {name.replace(/\w+/g, function (w) {
          return w[0].toUpperCase() + w.slice(1).toLowerCase()
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
              <Collapse shortDesc={firstTwo()} id="search-history-collapse">
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
