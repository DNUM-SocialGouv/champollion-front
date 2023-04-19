import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { ScrollRestoration } from "react-router-dom"

import { initMatomo, trackPageView } from "../helpers/analytics"

import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui"
import { StyledEngineProvider } from "@mui/material/styles"
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display"
import { Footer } from "@codegouvfr/react-dsfr/Footer"
import { Header } from "@codegouvfr/react-dsfr/Header"

const isProd: boolean = import.meta.env.PROD

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _paq: any[]
  }
}

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
  title: "Accueil VisuDSN - Ministère du travail, du plein emploi et de l'insertion",
}

const contentDescription = (
  <>
    VisuDSN est un outil développé dans le cadre du projet Champollion par les équipes de
    la Direction du numérique des ministères sociaux, en collaboration avec la Direction
    Générale du Travail (DGT).
    <br />
    <br />
    Pour nous contacter par courriel :{" "}
    <a href="mailto:visudsn@sg.social.gouv.fr">visudsn@sg.social.gouv.fr</a>
  </>
)

export default function Root() {
  const onWindowFocus = async () => {
    if (isProd) {
      try {
        const res = await fetch("/oauth2/auth")
        if (res?.status === 401) location.reload()
      } catch (err) {
        console.error("Error when checking authorization", err)
      }
    }
  }

  const routerLocation = useLocation()

  // Initialize Matomo script
  useEffect(() => {
    initMatomo(isProd)
  }, [])

  // Create Pageview for Matomo analytics
  useEffect(() => {
    trackPageView()
  }, [routerLocation])

  useEffect(() => {
    window.addEventListener("focus", onWindowFocus)
    return () => {
      window.removeEventListener("focus", onWindowFocus)
    }
  }, [])

  return (
    <StyledEngineProvider injectFirst>
      <MuiDsfrThemeProvider>
        <div className="App flex min-h-screen flex-col">
          <Header
            brandTop={brandTop}
            homeLinkProps={homeLinkProps}
            classes={{ serviceTagline: "fr-text--sm" }}
            serviceTagline="Outil d'exploration des données sociales et d'aide au contrôle de l'inspection du travail"
            serviceTitle="VisuDSN"
            quickAccessItems={[
              {
                iconId: "fr-icon-search-line",
                linkProps: {
                  to: "/",
                },
                text: "Rechercher un établissement",
              },
              {
                iconId: "fr-icon-questionnaire-line",
                linkProps: {
                  to: "/faq",
                },
                text: "FAQ",
              },
              {
                iconId: "fr-icon-bug-fill",
                linkProps: {
                  to: "/erreurs",
                },
                text: "Erreurs connues",
              },
            ]}
          />
          <main role="main" id="content">
            <Outlet />
          </main>
          <Footer
            accessibility="partially compliant"
            brandTop={brandTop}
            className="fr-mt-10v"
            contentDescription={contentDescription}
            homeLinkProps={homeLinkProps}
            bottomItems={[
              {
                text: "Conditions d'utilisation",
                linkProps: { to: "/cgu" },
              },
              {
                text: "Politique de confidentialité",
                linkProps: { to: "politique-confidentialite" },
              },
              headerFooterDisplayItem,
            ]}
            termsLinkProps={{ to: "mentions-legales" }}
            license=""
          />
          <ScrollRestoration />
        </div>
      </MuiDsfrThemeProvider>
    </StyledEngineProvider>
  )
}
