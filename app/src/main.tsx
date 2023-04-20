import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa"
import "./index.css"
import { Link } from "react-router-dom"
import ls from "localstorage-slim"

import Root from "./routes/root"
import Index, { action as homeAction } from "./routes/index"
import Error from "./components/Error"
import Etab, { loader as etabLoader } from "./routes/etablissement"
import EtabSynthese, {
  loader as etabSyntheseLoader,
  action as etabSyntheseAction,
} from "./routes/etablissement/synthese"
import EtabPostes, {
  loader as etabPostesLoader,
  action as etabPostesAction,
} from "./routes/etablissement/postes"
import EtabContrats, {
  loader as etabContratsLoader,
} from "./routes/etablissement/contrats"
import EtabRecours, { loader as etabRecoursLoader } from "./routes/etablissement/recours"
import EtabCarence, { loader as etabCarenceLoader } from "./routes/etablissement/carence"
import ETT, { loader as ettLoader } from "./routes/ett"

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
    errorElement: <Error />,
    children: [
      {
        errorElement: <Error />,
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
        errorElement: <Error />,
        element: <Etab />,
        loader: etabLoader,
        children: [
          {
            index: true,
            element: <EtabSynthese />,
            action: etabSyntheseAction,
            loader: etabSyntheseLoader,
          },
          {
            path: "postes",
            element: <EtabPostes />,
            action: etabPostesAction,
            loader: etabPostesLoader,
          },
          {
            path: "contrats",
            element: <EtabContrats />,
            loader: etabContratsLoader,
          },
          {
            path: "recours-abusif",
            element: <EtabRecours />,
            loader: etabRecoursLoader,
          },
          {
            path: "carence",
            element: <EtabCarence />,
            loader: etabCarenceLoader,
          },
        ],
      },
      {
        path: "ett/:siret/:page?",
        element: <ETT />,
        errorElement: <Error />,
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
