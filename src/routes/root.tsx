import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui"
import { StyledEngineProvider } from "@mui/material/styles"
import { Outlet } from "react-router-dom"

import { AppHeader } from "../components/AppHeader"
import AppFooter from "../components/AppFooter"

export default function Root() {
  return (
    <StyledEngineProvider injectFirst>
      <MuiDsfrThemeProvider>
        <div className="App flex min-h-screen flex-col">
          <AppHeader />
          <div className="flex flex-auto">
            <Outlet />
          </div>
          <AppFooter />
        </div>
      </MuiDsfrThemeProvider>
    </StyledEngineProvider>
  )
}
