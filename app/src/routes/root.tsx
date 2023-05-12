import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui"
import { StyledEngineProvider } from "@mui/material/styles"
import { Outlet } from "react-router-dom"
import { ScrollRestoration } from "react-router-dom"

import { Display, headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display"
import { Footer } from "@codegouvfr/react-dsfr/Footer"
import { Header } from "@codegouvfr/react-dsfr/Header"
import { useEffect } from "react"

const logoutURL: string = import.meta.env.VITE_LOGOUT_URL as string
const isProd: boolean = import.meta.env.PROD

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
            serviceTagline="L'outil d'aide au contrôle précarité"
            serviceTitle="Champollion"
            quickAccessItems={[
              {
                iconId: "fr-icon-search-line",
                linkProps: {
                  to: "/",
                },
                text: "Rechercher un établissement",
              },
              {
                iconId: "fr-icon-lock-line",
                linkProps: {
                  to: logoutURL,
                  reloadDocument: true,
                },
                text: "Se déconnecter",
              },
              headerFooterDisplayItem,
            ]}
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
          <ScrollRestoration />
        </div>
      </MuiDsfrThemeProvider>
    </StyledEngineProvider>
  )
}
