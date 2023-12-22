import { render, screen } from "@testing-library/react"
import IndicatorWrapper from "../src/components/indicators/IndicatorWrapper"

jest.mock("../src/helpers/analytics", () => ({
  trackEvent: jest.fn(),
}))

jest.mock("@codegouvfr/react-dsfr/Table", () => ({
  Table: () => <div data-testid="mocked-table">Mocked Table Component</div>,
}))

jest.mock("@codegouvfr/react-dsfr/ToggleSwitch", () => ({
  ToggleSwitch: () => (
    <div data-testid="mocked-toggle-switch">Mocked ToggleSwitch Component</div>
  ),
}))
jest.mock("../src/components/Collapse", () => "MockCollapse")

describe("IndicatorWrapper", () => {
  test("render component", () => {
    const minimalProps = {
      id: "id",
      readingNote: "Ceci est un indicateur",
      title: "Mon indicateur",
      tracking: { category: "homepage" },
    }

    render(<IndicatorWrapper {...minimalProps} />)

    expect(screen.getByText(minimalProps.title)).toBeInTheDocument()
    expect(screen.getByText("Note de lecture")).toBeInTheDocument()
    expect(screen.getByText(minimalProps.readingNote)).toBeInTheDocument()
  })

  test("Table should be hidden by default", () => {
    const minimalProps = {
      id: "id",
      readingNote: "Ceci est un indicateur",
      title: "Mon indicateur",
      tracking: { category: "homepage" },
      table: { headers: ["Colonne 1"], data: [["a"], ["b"]] },
    }

    render(<IndicatorWrapper {...minimalProps} />)

    const mockedTable = screen.queryByTestId("mocked-table")
    expect(mockedTable).not.toBeInTheDocument()
  })
})
