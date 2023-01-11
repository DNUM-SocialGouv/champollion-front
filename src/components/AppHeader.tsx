import React, { Component } from "react"
import { Header } from "@codegouvfr/react-dsfr/Header"

// TODO
type Props = object
type State = object

const brandTop = (
  <>
    Ministère
    <br />
    du travail,
    <br />
    du plein emploi
    <br />
    et de l'insertion
  </>
)

const homeLinkProps = {
  href: "/",
  title: "Accueil Champollion - Ministère du travail, du plein emploi et de l'insertion",
}

export class AppHeader extends Component<Props, State> {
  state = {}

  render() {
    return (
      <Header
        brandTop={brandTop}
        homeLinkProps={homeLinkProps}
        serviceTagline="Outil d'aide au contrôle précarité à destination de l'inspection du travail"
        serviceTitle="Champollion"
      />
    )
  }
}
