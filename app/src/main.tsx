import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa"
import "./index.css"
import { Link } from "react-router-dom"
import ls from "localstorage-slim"

import Root from "./routes/root"
import Index, { action as homeAction, loader as homeLoader } from "./routes/index"
import Error from "./components/Error"
import Etab, { loader as etabLoader } from "./routes/etablissement"
import EtabSynthese, {
  loader as etabSyntheseLoader,
} from "./routes/etablissement/synthese"
import EtabPostes, { loader as etabPostesLoader } from "./routes/etablissement/postes"
import EtabContrats, {
  loader as etabContratsLoader,
} from "./routes/etablissement/contrats"
import EtabRecours, { loader as etabRecoursLoader } from "./routes/etablissement/recours"
import EtabCarence, { loader as etabCarenceLoader } from "./routes/etablissement/carence"
import ETT, { loader as ettLoader } from "./routes/ett"
import FAQ, { loader as faqLoader } from "./routes/faq"
import CGU, { loader as cguLoader } from "./routes/cgu"
import LegalNotice, { loader as legalNoticeLoader } from "./routes/legalNotice"
import Bugs from "./routes/bugs"
import News from "./routes/news"
import PersonalData, { loader as personalDataLoader } from "./routes/personalData"
import Labellisation, {
  loader as labellisationLoader,
  action as labellisationAction,
} from "./routes/labellisation"

// encrypt localStorage
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
            loader: homeLoader,
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
            loader: etabSyntheseLoader,
          },
          {
            path: "postes",
            element: <EtabPostes />,
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
      {
        path: "faq",
        element: <FAQ />,
        errorElement: <Error />,
        loader: faqLoader,
      },
      {
        path: "cgu",
        element: <CGU />,
        errorElement: <Error />,
        loader: cguLoader,
      },
      {
        path: "mentions-legales",
        element: <LegalNotice />,
        errorElement: <Error />,
        loader: legalNoticeLoader,
      },
      {
        path: "politique-confidentialite",
        element: <PersonalData />,
        errorElement: <Error />,
        loader: personalDataLoader,
      },
      {
        path: "erreurs",
        element: <Bugs />,
        errorElement: <Error />,
      },
      {
        path: "nouveautes",
        element: <News />,
        errorElement: <Error />,
      },
      {
        path: "labellisation",
        element: <Labellisation />,
        errorElement: <Error />,
        action: labellisationAction,
        loader: labellisationLoader,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
