import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa"
import "./index.css"
import { Link } from "react-router-dom"

import Root from "./routes/root"
import Index, { action as homeAction } from "./routes/index"
import AppError from "./components/AppError"
import EtabBanner, { loader as etabBannerLoader } from "./routes/etablissement"
import EtabSynthese from "./routes/etablissement/synthese"
import EtabPostes from "./routes/etablissement/postes"

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
        path: "etablissement/:etabId",
        element: <EtabBanner />,
        loader: etabBannerLoader,
        children: [
          {
            index: true,
            element: <EtabSynthese />,
          },
          {
            path: "postes",
            element: <EtabPostes />,
          },
        ],
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
