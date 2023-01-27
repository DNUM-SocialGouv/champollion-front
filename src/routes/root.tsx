import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui"
import { StyledEngineProvider } from "@mui/material/styles"
import { Outlet } from "react-router-dom"

import { Display, headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display"
import { Footer } from "@codegouvfr/react-dsfr/Footer"
import { Header } from "@codegouvfr/react-dsfr/Header"

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
  to: "/",
  title: "Accueil Champollion - Ministère du travail, du plein emploi et de l'insertion",
}

const contentDescription =
  "Champollion est un projet développé par les équipes de la Direction du numérique des ministères sociaux, en collaboration avec la Direction Générale du Travail (DGT)."

export default function Root() {
  return (
    <StyledEngineProvider injectFirst>
      <MuiDsfrThemeProvider>
        <div className="App flex min-h-screen flex-col">
          <Header
            brandTop={brandTop}
            homeLinkProps={homeLinkProps}
            serviceTagline="Outil d'aide au contrôle précarité à destination de l'inspection du travail"
            serviceTitle="Champollion"
            quickAccessItems={[headerFooterDisplayItem]}
          />
          <div className="flex flex-auto">
            <Outlet />
          </div>
          <Footer
            accessibility="partially compliant"
            brandTop={brandTop}
            className="fr-mt-10v"
            contentDescription={contentDescription}
            homeLinkProps={homeLinkProps}
            bottomItems={[headerFooterDisplayItem]}
          />
          <Display />
        </div>
      </MuiDsfrThemeProvider>
    </StyledEngineProvider>
  )
}
