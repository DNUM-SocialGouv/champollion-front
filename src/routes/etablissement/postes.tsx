import { ReactNode, useState } from "react"
import * as dayjs from "dayjs"

import { Link } from "react-router-dom"
import Button from "@codegouvfr/react-dsfr/Button"
import Pagination from "@codegouvfr/react-dsfr/Pagination"
import AppTable from "../../components/AppTable"
import AppMultiSelect, { Option } from "../../components/AppMultiSelect"

type ApiPoste = {
  id: number
  employee: string
  contratType: "cdd" | "ctt" | "cdi" | null
  ettName: string | null
  ettSiret: string | null
  startDate: string
  expectedEndDate: string | null
  endDate: string | null
  motiveLabel: string | null
  motiveCode: string | null
  conventionCode: string
}

type FormattedPoste = {
  id: number
  employee: string
  contratType: string
  ett: ReactNode
  startDate: string
  expectedEndDate: string | null
  endDate: string | null
  motive: string | null
  conventionCode: string | null
}

type Column =
  | "employee"
  | "contratType"
  | "ett"
  | "startDate"
  | "expectedEndDate"
  | "endDate"
  | "motive"
  | "conventionCode"

type PostesHeader = {
  key: Column
  label: string
  width: string
}

const headers = [
  { key: "employee", label: "Salarié", width: "15%" },
  { key: "contratType", label: "Type de contrat", width: "9%" },
  { key: "ett", label: "ETT", width: "10%" },
  { key: "startDate", label: "Date de début", width: "10%" },
  { key: "expectedEndDate", label: "Date de fin prévisionnelle", width: "10%" },
  { key: "endDate", label: "Date de fin réelle", width: "10%" },
  { key: "motive", label: "Motif de recours", width: "20%" },
  { key: "conventionCode", label: "Conv. collective", width: "6%" },
] as PostesHeader[]

export default function EtabPostes() {
  const [selectedOptions, setSelectedOptions] = useState([] as Option[]) // updated live when Select changes
  const [selectedPostes, setSelectedPostes] = useState([] as Option[]) // updated only when validation button is clicked

  const formatDate = (date: string | null) =>
    dayjs(date).isValid() ? dayjs(date).format("DD/MM/YYYY") : ""

  const formattedPostes: FormattedPoste[] = items.map((poste: ApiPoste) => {
    const ett = <Link to={`/ett/${poste.ettSiret}`}>{poste.ettName}</Link>
    return {
      id: poste.id,
      employee: poste.employee,
      contratType: poste.contratType?.toUpperCase() || "",
      ett,
      startDate: formatDate(poste.startDate),
      expectedEndDate: formatDate(poste.expectedEndDate),
      endDate: formatDate(poste.endDate),
      motive: poste.motiveLabel,
      conventionCode: poste.conventionCode,
    }
  })

  return (
    <>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Sélection du poste</h2>
        <hr />
        <AppMultiSelect
          options={options}
          label="Poste(s)"
          hintText="Sélectionnez un ou plusieurs postes dans la liste"
          onChange={(newValue: readonly Option[]) => setSelectedOptions([...newValue])}
        />
        <Button
          disabled={selectedOptions.length == 0}
          onClick={() => {
            console.log("clicked!", selectedOptions)
            setSelectedPostes([...selectedOptions])
          }}
          type="button"
        >
          Valider la sélection
        </Button>
      </div>
      <div className="fr-mb-3w">
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">Évolution du nombre de salariés</h2>
        <hr />
        {selectedPostes.length > 0 ? (
          <p>Fonctionnalité à venir</p>
        ) : (
          <p className="italic text-tx-disabled-grey">
            Veuillez sélectionner un ou plusieurs postes.
          </p>
        )}
      </div>
      <div>
        <h2 className="fr-text--xl fr-mt-2w fr-mb-1w">
          Liste des contrats déclarés sur la période sélectionnée
        </h2>
        <hr />
        {selectedPostes.length > 0 ? (
          <>
            <AppTable headers={headers} items={formattedPostes} />
            <Pagination
              count={5}
              defaultPage={1}
              getPageLinkProps={() => ({ to: "#" })}
              showFirstLast
              classes={{
                list: "justify-center",
              }}
            />
          </>
        ) : (
          <p className="italic text-tx-disabled-grey">
            Veuillez sélectionner un ou plusieurs postes.
          </p>
        )}
      </div>
    </>
  )
}

// Pole Emploi ROME appellations catégorie F17, 02/2023
const btpJobs = [
  { title: "Agent / Agente de fabrication de l'industrie du béton" },
  { title: "Agent / Agente de précontrainte de l'industrie du béton" },
  { title: "Agent / Agente de préfabrication de l'industrie du béton" },
  { title: "Agent / Agente de réseaux de canalisation" },
  { title: "Agent / Agente d'entretien de la voie ferrée" },
  { title: "Aide maçon / maçonne Voiries et Réseaux Divers VRD" },
  { title: "Aide-maçon / Aide-maçonne" },
  { title: "Armaturier / Armaturière de l'industrie du béton" },
  { title: "Atrier / Atrière" },
  { title: "Atrier-fumiste / Atrière-fumiste" },
  { title: "Bancheur / Bancheuse" },
  { title: "Bancheur-coffreur / Bancheuse-coffreuse" },
  { title: "Bâtisseur / Bâtisseuse du génie militaire" },
  { title: "Batteur / Batteuse de pieux" },
  { title: "Bétonneur / Bétonneuse" },
  { title: "Bétonnier / Bétonnière" },
  { title: "Boiseur / Boiseuse" },
  { title: "Borneur / Borneuse" },
  { title: "Brasqueur / Brasqueuse" },
  { title: "Briqueteur / Briqueteuse" },
  { title: "Canalisateur / Canalisatrice" },
  { title: "Chapiste" },
  { title: "Chef d'application d'enrobés" },
  { title: "Chef d'entretien de la voie ferrée" },
  { title: "Chef d'équipe canalisateur / canalisatrice" },
  { title: "Chef d'équipe coffreur / coffreuse" },
  { title: "Chef d'équipe de l'industrie du béton" },
  { title: "Chef d'équipe des travaux de voirie communale" },
  { title: "Chef d'équipe ferrailleur / ferrailleuse du BTP" },
  { title: "Chef d'équipe maçon / maçonne" },
  { title: "Chef d'équipe mise en oeuvre d'enrobés" },
  { title: "Chef d'équipe produits noirs" },
  { title: "Cimentier / Cimentière" },
  { title: "Cimentier applicateur / Cimentière applicatrice" },
  { title: "Cimentier enduiseur / Cimentière enduiseuse" },
  { title: "Coffreur / Coffreuse" },
  { title: "Coffreur bancheur / Coffreuse bancheuse" },
  { title: "Coffreur / Coffreuse béton armé" },
  { title: "Coffreur / Coffreuse génie civil" },
  { title: "Coffreur glissant / Coffreuse glissante" },
  { title: "Coffreur / Coffreuse métallique" },
  { title: "Coffreur-boiseur / Coffreuse-boiseuse" },
  { title: "Coffreur-boiseur-escaliéteur / Coffreuse-boiseuse-escaliéteuse" },
  { title: "Coffreur-ferrailleur / Coffreuse-ferrailleuse" },
  { title: "Compagnon routier / Compagnonne routière" },
  { title: "Compagnon / Compagnonne Voiries et Réseaux Divers -VRD-" },
  { title: "Conducteur / Conductrice de répandeuses" },
  { title: "Constructeur / Constructrice en béton armé" },
  {
    title:
      "Constructeur / Constructrice en canalisations d'hygiène publique et voies urbaines",
  },
  { title: "Constructeur / Constructrice en maçonnerie et béton armé" },
  { title: "Démolisseur / Démolisseuse" },
  { title: "Démolisseur-récupérateur / Démolisseuse-récupératrice de matériaux du BTP" },
  { title: "Façonneur-assembleur-ferrailleur / Façonneuse-assembleuse-ferrailleuse" },
  { title: "Ferrailleur / Ferrailleuse du BTP" },
  { title: "Ferrailleur-attacheur / Ferrailleuse-attacheuse du BTP" },
  { title: "Finisseur / Finisseuse de l'industrie du béton" },
  { title: "Fumiste" },
  { title: "Gravatier / Gravatière" },
  { title: "Gravillonneur / Gravillonneuse" },
  { title: "Installateur-poseur / Installatrice-poseuse de piscines préfabriquées" },
  { title: "Maçon / Maçonne" },
  { title: "Maçon bâtisseur / Maçonne bâtisseuse de pierres sèches" },
  { title: "Maçon / Maçonne du paysage" },
  { title: "Maçon / Maçonne en monuments funéraires" },
  { title: "Maçon / Maçonne en rénovation" },
  { title: "Maçon / Maçonne en thermique industrielle" },
  { title: "Maçon / Maçonne pierre" },
  { title: "Maçon / Maçonne Voiries et Réseaux Divers -VRD-" },
  { title: "Maçon-applicateur / Maçonne-applicatrice" },
  { title: "Maçon-boiseur / Maçonne-boiseuse" },
  { title: "Maçon-briqueteur / Maçonne-briqueteuse" },
  { title: "Maçon-carreleur / Maçonne-carreleuse" },
  { title: "Maçon-cimentier / Maçonne-cimentière" },
  { title: "Maçon-coffreur / Maçonne-coffreuse" },
  { title: "Maçon-couvreur / Maçonne-couvreuse" },
  { title: "Maçon-enduiseur / Maçonne-enduiseuse" },
  { title: "Maçon-ferrailleur / Maçonne-ferrailleuse" },
  { title: "Maçon-finisseur / Maçonne-finisseuse" },
  { title: "Maçon-fumiste / Maçonne-fumiste" },
  { title: "Maçon-fumiste / Maçonne-fumiste en verrerie" },
  { title: "Maçon-limousinant / Maçonne-limousinante" },
  { title: "Maçon-monteur industriel / Maçonne-monteuse industrielle" },
  { title: "Maçon-piscinier / Maçonne-piscinière" },
  { title: "Maçon-plâtrier / Maçonne-plâtrière" },
  { title: "Magasinier / Magasinière de dépÃ´t d'entreprise du BTP" },
  { title: "Manoeuvre bâtiment" },
  { title: "Manoeuvre de chantier" },
  { title: "Manoeuvre gros oeuvre" },
  { title: "Manoeuvre routier / routière" },
  { title: "Manoeuvre travaux publics" },
  { title: "Moellonneur / Moellonneuse" },
  { title: "Monteur / Monteuse d'éléments préfabriqués" },
  { title: "Monteur / Monteuse en préfabrications lourdes" },
  { title: "Monteur-assembleur / Monteuse-assembleuse en treillis soudés" },
  { title: "Mouleur / Mouleuse de l'industrie du béton" },
  { title: "Ouvrier / Ouvrière de la maçonnerie" },
  { title: "Ouvrier / Ouvrière du béton" },
  { title: "Ouvrier / Ouvrière en démolition" },
  { title: "Ouvrier / Ouvrière en voiries" },
  { title: "Ouvrier / Ouvrière génie civil" },
  { title: "Ouvrier poseur / Ouvrière poseuse de voies ferrées" },
  { title: "Ouvrier régleur / Ouvrière régleuse d'enrobés" },
  { title: "Ouvrier / Ouvrière Voiries et Réseaux Divers -VRD-" },
  { title: "Parpineur / Parpineuse" },
  { title: "Paveur / Paveuse" },
  { title: "Piscinier / Piscinière en piscines collectives en béton" },
  { title: "Poseur / Poseuse de bordures et caniveaux" },
  { title: "Poseur / Poseuse de canalisations" },
  { title: "Poseur / Poseuse de panneaux de signalisation" },
  { title: "Poseur / Poseuse de tuyaux" },
  { title: "Poseur / Poseuse de voies ferrées" },
  {
    title:
      "Préparateur monteur / Préparatrice monteuse de moules de l'industrie du béton",
  },
  { title: "Régaleur / Régaleuse sur voiries" },
  { title: "Régaleur-répandeur / Régaleuse-répandeuse" },
  { title: "Sapeur / Sapeuse travaux lourds et voies ferrées" },
  { title: "Terrassier / Terrassière" },
  { title: "Tireur / Tireuse au râteau" },
  { title: "Scieur carotteur / Scieuse carotteuse de béton" },
  { title: "Maçon poseur / Maçonne poseuse de cheminées et poÃªles" },
  { title: "Batteur / Batteuse de palplanches" },
  { title: "Murailler / Muraillère" },
]

const options = btpJobs.map(
  (job, index) => ({ value: index, label: job.title } as Option)
)

const items: ApiPoste[] = [
  {
    id: 1,
    employee: "John Doe",
    contratType: "cdd",
    ettName: "",
    ettSiret: "",
    startDate: "2022-06-01",
    expectedEndDate: "2022-09-15",
    endDate: null,
    motiveLabel: "Remplacement de salarié absent",
    motiveCode: "3",
    conventionCode: "2034",
  },

  {
    id: 2,
    employee: "John Doe",
    contratType: "ctt",
    ettName: "Adecco",
    ettSiret: "00542012000015",
    startDate: "2022-07-01",
    expectedEndDate: "2022-09-15",
    endDate: "2022-09-15",
    motiveLabel: "Accroissement temporaire d'activité",
    motiveCode: "2",
    conventionCode: "2034",
  },
  {
    id: 3,
    employee: "Marco Polo",
    contratType: "ctt",
    ettName: "Manpower",
    ettSiret: "00542012000015",
    startDate: "2022-07-01",
    expectedEndDate: "2022-09-15",
    endDate: "2022-09-15",
    motiveLabel: "Accroissement temporaire d'activité",
    motiveCode: "2",
    conventionCode: "2034",
  },
  {
    id: 4,
    employee: "Jeanne Dupont",
    contratType: "cdi",
    ettName: null,
    ettSiret: null,
    startDate: "2021-11-23",
    expectedEndDate: null,
    endDate: null,
    motiveLabel: null,
    motiveCode: null,
    conventionCode: "2034",
  },
]
