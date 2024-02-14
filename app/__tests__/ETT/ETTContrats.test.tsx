import { EttContrat, PaginationMetaData } from "../../src/api/types"
import { render, screen } from "@testing-library/react"
import ETTContrats from "../../src/routes/ett/ETTContrats"
import { BrowserRouter as Router } from "react-router-dom"

jest.mock("../../src/helpers/analytics", () => ({
  NODE_ENV: "test",
  VITE_MATOMO_URL: "http://mocked-base-url",
}))

jest.mock("../../src/helpers/analytics", () => ({
  NODE_ENV: "test",
  REACT_APP_BASE_URL: "http://mocked-base-url",
}))

jest.mock("../../src/helpers/analytics", () => ({
  NODE_ENV: "test",
  VITE_MATOMO_SITE_ID: "http://mocked-base-url",
}))

describe("Contracts Info component", () => {
  const metaTest = {
    currentPage: 1,
    nextPage: null,
    perPage: 20,
    prevPage: null,
    totalPages: 1,
    totalCount: 2,
  }

  const metaTest2 = {
    currentPage: 1,
    nextPage: null,
    perPage: 20,
    prevPage: null,
    totalPages: 2,
    totalCount: 1,
  }

  const metaVide = {
    currentPage: 0,
    nextPage: null,
    perPage: null,
    prevPage: null,
    totalPages: 20,
    totalCount: 0,
  }

  const contrat1 = {
    nomUsage: "",
    codeConventionCollective: "2378",
    codeMotifRecours: "02",
    codeNatureContrat: "03",
    contratId: 53,
    dateDebut: "2022-07-01",
    dateFin: "2022-09-01",
    dateNaissance: "05/06/1976",
    etuCodePostal: "01000",
    etuRaisonSociale: "EtabTest",
    etuSiret: "99999",
    libelleConventionCollective: "Accord test",
    libelleMotifRecours: "Accroissement temporaire de l'activité de l'entreprise",
    libelleNatureContrat: "Contrat  de mission (contrat de travail temporaire)",
    libellePoste: "Technicien",
    nomFamille: "testFamille",
    posteId: null,
    prenoms: "testPrenom",
    sexe: 2,
    statutDebut: 2,
    statutFin: 2,
    dateDerniereDeclaration: "2023-11-01",
  }

  const contrat2 = {
    nomUsage: "",
    codeConventionCollective: "2378",
    codeMotifRecours: "02",
    codeNatureContrat: "03",
    contratId: 54,
    dateDebut: "2023-07-01",
    dateFin: "2023-09-01",
    dateNaissance: "05/07/1990",
    etuCodePostal: "02000",
    etuRaisonSociale: "EttTest",
    etuSiret: "99998",
    libelleConventionCollective:
      "Accords professionnels nationaux concernant le personnel intérimaire des entreprises de travail temporaire",
    libelleMotifRecours: "Accroissement test",
    libelleNatureContrat: "CTT",
    libellePoste: "Chef",
    nomFamille: "contrat2Famille",
    posteId: null,
    prenoms: "contrat2Prenom",
    sexe: 2,
    statutDebut: 2,
    statutFin: 2,
    dateDerniereDeclaration: "2023-11-01",
  }

  const contrat: EttContrat[] = [contrat1, contrat2]

  const contratVide: EttContrat[] = []

  const renderComponent = (contratsTest: EttContrat[], metaTest: PaginationMetaData) =>
    render(
      <Router>
        <ETTContrats contrats={contratsTest} meta={metaTest} />
      </Router>
    )

  {
    test("ETTContrats renders correctly when pagination is not present", () => {
      renderComponent(contrat, metaTest)

      expect(screen.getByRole("table")).toBeVisible()

      expect(screen.getByText("Poste", { exact: false })).toBeVisible()
      expect(
        screen.getByText("Etablissement utilisateur", { exact: false })
      ).toBeVisible()
      expect(screen.getByText("Salarié", { exact: false })).toBeVisible()
      expect(screen.getByText("Date de début", { exact: false })).toBeVisible()
      expect(screen.getByText("Date de fin", { exact: false })).toBeVisible()
      expect(screen.getByText("Nature contrat", { exact: false })).toBeVisible()
      expect(screen.getByText("Motif de recours", { exact: false })).toBeVisible()

      expect(screen.getByText(contrat1.prenoms, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat1.nomFamille, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat1.dateNaissance, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat1.etuRaisonSociale, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat1.libellePoste, { exact: false })).toBeVisible()
      // verifier que le formatDate fonctionne correctement
      expect(screen.getByText("01/07/2022", { exact: false })).toBeVisible()
      expect(screen.getByText("01/09/2022", { exact: false })).toBeVisible()

      expect(screen.getByText(contrat2.prenoms, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat2.nomFamille, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat2.dateNaissance, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat2.etuRaisonSociale, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat2.libellePoste, { exact: false })).toBeVisible()
      // verifier que le formatDate fonctionne correctement
      expect(screen.getByText("01/07/2023", { exact: false })).toBeVisible()
      expect(screen.getByText("01/09/2023", { exact: false })).toBeVisible()

      // verifier que le lien vers l'etablissement utilisateur fonctionne correctement
      const href = `/etablissement/${contrat1.etuSiret}`

      const linkElement = screen.getByText(
        `${contrat1.etuRaisonSociale} (${contrat1.etuCodePostal})`
      )
      expect(linkElement).toBeInTheDocument()
      expect(linkElement).toHaveAttribute("href", href)
    })

    test("ETTContrats renders correctly when pagination is present", () => {
      renderComponent(contrat, metaTest2)

      expect(screen.getByRole("table")).toBeVisible()

      expect(screen.getByText("Poste", { exact: false })).toBeVisible()
      expect(
        screen.getByText("Etablissement utilisateur", { exact: false })
      ).toBeVisible()
      expect(screen.getByText("Salarié", { exact: false })).toBeVisible()
      expect(screen.getByText("Date de début", { exact: false })).toBeVisible()
      expect(screen.getByText("Date de fin", { exact: false })).toBeVisible()
      expect(screen.getByText("Nature contrat", { exact: false })).toBeVisible()
      expect(screen.getByText("Motif de recours", { exact: false })).toBeVisible()

      expect(screen.getByText(contrat1.prenoms, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat1.nomFamille, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat1.dateNaissance, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat1.etuRaisonSociale, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat1.libellePoste, { exact: false })).toBeVisible()
      // verifier que le formatDate fonctionne correctement
      expect(screen.getByText("01/07/2022", { exact: false })).toBeVisible()
      expect(screen.getByText("01/09/2022", { exact: false })).toBeVisible()

      expect(screen.getByText(contrat2.prenoms, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat2.nomFamille, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat2.dateNaissance, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat2.etuRaisonSociale, { exact: false })).toBeVisible()
      expect(screen.getByText(contrat2.libellePoste, { exact: false })).toBeVisible()
      // verifier que le formatDate fonctionne correctement
      expect(screen.getByText("01/07/2023", { exact: false })).toBeVisible()
      expect(screen.getByText("01/09/2023", { exact: false })).toBeVisible()

      expect(screen.getByText("Pagination", { exact: false })).toBeInTheDocument()
    })

    test("ETTContrats renders correctly when there is no data", () => {
      renderComponent(contratVide, metaVide)

      expect(screen.getByText("Aucun résultat", { exact: false })).toBeVisible()
    })
  }
})
