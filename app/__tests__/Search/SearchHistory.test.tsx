import { render, screen } from "@testing-library/react"
import SearchHistory from "../../src/routes/search/SearchHistory"
import { BrowserRouter as Router } from "react-router-dom"

describe("Search history component", () => {
  const renderComponent = (searchHistory: string[][]) =>
    render(
      <Router>
        <SearchHistory searchHistory={searchHistory} />
      </Router>
    )

  {
    test("SearchHistory renders correctly", () => {
      const history = [
        ["20001234000000", "LA BOISSOTTE"],
        ["12301234000000", "LA ROCHE"],
        ["27894234000000", "LA LA LAND"],
      ]
      renderComponent(history)
      expect(screen.getByText("La Boissotte")).toBeInTheDocument()
    })
  }
  {
    test("SearchHistory renders without search history", () => {
      renderComponent([])
      expect(screen.getByText("Aucun SIRET dans votre historique.")).toBeInTheDocument()
    })
  }
})
