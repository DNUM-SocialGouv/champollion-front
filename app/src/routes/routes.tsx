import Root from "./Root"
import Index, { action as homeAction, loader as homeLoader } from "./Index"
import Error from "../components/Error"
import Etablissement, { loader as etabLoader } from "./etablissement"
import Synthese, { loader as etabSyntheseLoader } from "./etablissement/Synthese"
import Postes, { loader as etabPostesLoader } from "./etablissement/Postes"
import Contrats, { loader as etabContratsLoader } from "./etablissement/Contrats"
import Recours, { loader as etabRecoursLoader } from "./etablissement/Recours"
import Carence, { loader as etabCarenceLoader } from "./etablissement/Carence"
import ETT, { loader as ettLoader } from "./ETT"
import FAQ, { loader as faqLoader } from "./FAQ"
import CGU, { loader as cguLoader } from "./CGU"
import LegalNotice, { loader as legalNoticeLoader } from "./LegalNotice"
import Bugs from "./Bugs"
import News from "./News"
import PersonalData, { loader as personalDataLoader } from "./PersonalData"
import Labellisation, {
  loader as labellisationLoader,
  action as labellisationAction,
} from "./Labellisation"

export default [
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
        element: <Etablissement />,
        loader: etabLoader,
        children: [
          {
            index: true,
            element: <Synthese />,
            loader: etabSyntheseLoader,
          },
          {
            path: "postes",
            element: <Postes />,
            loader: etabPostesLoader,
          },
          {
            path: "contrats",
            element: <Contrats />,
            loader: etabContratsLoader,
          },
          {
            path: "recours-abusif",
            element: <Recours />,
            loader: etabRecoursLoader,
          },
          {
            path: "carence",
            element: <Carence />,
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
]
