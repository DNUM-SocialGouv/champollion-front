import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa"
import "./index.css"
import { Link } from "react-router-dom"

import Root from "./routes/root"
import Index, { action as homeAction } from "./routes/index"
import AppError from "./components/AppError"
import Etab, { loader as etabLoader } from "./routes/etablissement"
import EtabSynthese, {
  loader as etabSyntheseLoader,
} from "./routes/etablissement/synthese"
import EtabPostes, { loader as etabPostesLoader } from "./routes/etablissement/postes"
import ETT, { loader as ettLoader } from "./routes/ett"

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
            loader: etabSyntheseLoader,
            element: <EtabSynthese />,
          },
          {
            path: "postes",
            loader: etabPostesLoader,
            element: <EtabPostes />,
          },
        ],
      },
      {
        path: "ett/:siret",
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
