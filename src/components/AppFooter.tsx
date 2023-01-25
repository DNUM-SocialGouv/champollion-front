import React, { Component } from "react"
import { Footer } from "@codegouvfr/react-dsfr/Footer"

// TODO
type Props = object
type State = object

const contentDescription =
  "Champollion est un projet développé par les équipes de la Direction du numérique des ministères sociaux, en collaboration avec la Direction Générale du Travail (DGT)."

const homeLinkProps = {
  to: "/",
  title: "Accueil Champollion - Ministère du travail, du plein emploi et de l'insertion",
}
export default class AppFooter extends Component<Props, State> {
  state = {}

  render() {
    return (
      <Footer
        accessibility="partially compliant"
        brandTop={
          <>
            Ministère
            <br />
            du travail,
            <br />
            du plein emploi
            <br />
            et de l'insertion
          </>
        }
        className="fr-mt-10v"
        contentDescription={contentDescription}
        homeLinkProps={homeLinkProps}
      />
    )
  }
}
