import Root from "./Root"
import Index, { action as homeAction, loader as homeLoader } from "./Index"
import Error from "../components/Error"
import Etablissement from "./etablissement"
import Synthese from "./etablissement/synthese/Synthese"
import Recours from "./etablissement/recours/Recours"
import ETT from "./ett/ETT"
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
import { CarenceLoader } from "./etablissement/carence/CarenceLoader"
import Carence from "./etablissement/carence/Carence"
import Contrats from "./etablissement/contrats/Contrats"
import { ContratsLoader } from "./etablissement/contrats/ContratsLoader"
import { PostesLoader } from "./etablissement/postes/PostesLoader"
import Postes from "./etablissement/postes/Postes"
import { RecoursLoader } from "./etablissement/recours/RecoursLoader"
import { SyntheseLoader } from "./etablissement/synthese/SyntheseLoader"
import { EtablissementLoader } from "./etablissement/EtablissementLoader"
import { ETTLoader } from "./ett/ETTLoader"

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
        loader: EtablissementLoader,
        children: [
          {
            index: true,
            element: <Synthese />,
            loader: SyntheseLoader,
          },
          {
            path: "postes",
            element: <Postes />,
            loader: PostesLoader,
          },
          {
            path: "contrats",
            element: <Contrats />,
            loader: ContratsLoader,
          },
          {
            path: "recours-abusif",
            element: <Recours />,
            loader: RecoursLoader,
          },
          {
            path: "carence",
            element: <Carence />,
            loader: CarenceLoader,
          },
        ],
      },
      {
        path: "ett/:siret/:page?",
        element: <ETT />,
        errorElement: <Error />,
        loader: ETTLoader,
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
