import { useState } from "react"
import { MuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { StyledEngineProvider } from "@mui/material/styles"

import { AppHeader } from "./components/AppHeader"
import AppFooter from "./components/AppFooter"

function App() {
  const [count, setCount] = useState(0)

  return (
    <StyledEngineProvider injectFirst>
      <MuiDsfrThemeProvider>
        <div className="App flex min-h-screen flex-col">
          <AppHeader />
          <div className="flex flex-auto">
            <div className="flex w-full flex-col items-center">
              <h1 className={"fr-m-10v"}>Champollion - Précarité</h1>
              <Button onClick={() => setCount((count) => count + 1)}>
                Compteur {count}
              </Button>
            </div>
          </div>
          <AppFooter />
        </div>
      </MuiDsfrThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
