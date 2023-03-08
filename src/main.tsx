import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa"
import "./index.css"
import { Link } from "react-router-dom"
import ls from "localstorage-slim"

import Root from "./routes/root"
import Index, { action as homeAction } from "./routes/index"
import AppError from "./components/AppError"
import Etab, { loader as etabLoader } from "./routes/etablissement"
import EtabSynthese, {
  loader as etabSyntheseLoader,
} from "./routes/etablissement/synthese"
import EtabPostes, { loader as etabPostesLoader } from "./routes/etablissement/postes"
import ETT, { loader as ettLoader } from "./routes/ett"
import CarenceParametres, {
  action as carenceParamAction,
  loader as carenceParamLoader,
} from "./routes/etablissement/carence/parametres"
import CarencePostes, {
  action as carencePostesAction,
  loader as carencePostesLoader,
} from "./routes/etablissement/carence/postes"
import CarenceContrats from "./routes/etablissement/carence/contrats"
import { loader as carenceLoader } from "./routes/etablissement/carence"

// set localStorage expiration to 2 weeks (in seconds)
ls.config.ttl = 1209600
ls.config.encrypt = true

startReactDsfr({
  defaultColorScheme: "system",
  Link,
})
declare module "@codegouvfr/react-dsfr/spa" {
  interface RegisterLink {
    Link: typeof Link
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <AppError />,
    children: [
      {
        errorElement: <AppError />,
        children: [
          {
            index: true,
            element: <Index />,
            action: homeAction,
          },
        ],
      },
      {
        path: "etablissement/:siret",
        errorElement: <AppError />,
        element: <Etab />,
        loader: etabLoader,
        children: [
          {
            index: true,
            element: <EtabSynthese />,
            loader: etabSyntheseLoader,
          },
          {
            path: "postes",
            element: <EtabPostes />,
            loader: etabPostesLoader,
          },
          {
            path: "carence",
            children: [
              {
                index: true,
                loader: carenceLoader,
              },
              {
                path: "parametres",
                element: <CarenceParametres />,
                action: carenceParamAction,
                loader: carenceParamLoader,
              },
              {
                path: "postes",
                element: <CarencePostes />,
                action: carencePostesAction,
                loader: carencePostesLoader,
              },
              {
                path: "contrats",
                element: <CarenceContrats />,
              },
            ],
          },
        ],
      },
      {
        path: "ett/:siret/:page?",
        element: <ETT />,
        loader: ettLoader,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
