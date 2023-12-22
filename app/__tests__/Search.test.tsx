import { screen, render } from "@testing-library/react"
import Search from "../src/routes/search/Search"
import { MemoryRouter } from "react-router-dom"

jest.mock("../src/api", () => ({
  getExternalLinks: jest.fn().mockResolvedValue([]),
  getEtablissementsType: jest.fn().mockResolvedValue([]),
}))
jest.mock("../src/api/config", () => ({ baseURL: "" }))
jest.mock("../src/helpers/errors", () => ({ isDevMode: true }))
jest.mock("react-router-typesafe", () => ({
  useLoaderData: jest.fn(),
  useActionData: jest.fn(),
}))
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  // @ts-ignore - Temporarily ignore TypeScript errors for the next line

  Link: ({ children }) => <a>{children}</a>,
  // @ts-ignore - Temporarily ignore TypeScript errors for the next line

  Form: ({ children, onSubmit }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {children}
    </form>
  ),
}))

jest.mock("@codegouvfr/react-dsfr/Alert")

describe("Search component", () => {
  test("rendres without crash", () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    )
    expect(screen.getByText("Rechercher un établissement")).toBeInTheDocument()
  })
})
