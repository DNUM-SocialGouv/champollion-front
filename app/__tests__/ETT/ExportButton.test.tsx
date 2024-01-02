import { Button } from "@codegouvfr/react-dsfr/Button"
import { fireEvent, render, screen } from "@testing-library/react"
import { ExportContractsModal } from "../../__mocks__/@codegouvfr/react-dsfr/Modal"

jest.mock("../../src/helpers/errors", () => ({
  NODE_ENV: "test",
  DEV: true,
}))

jest.mock("../../src/api/config.ts", () => ({
  NODE_ENV: "test",
  VITE_API_BASE_URL: "http://mocked-base-url",
}))

jest.mock("../../src/api/config.ts", () => ({
  NODE_ENV: "test",
  DEV: "http://mocked-base-url",
}))

jest.mock("../../src/helpers/analytics", () => ({
  NODE_ENV: "test",
  VITE_MATOMO_SITE_ID: "http://mocked-base-url",
}))

jest.mock("../../src/helpers/analytics", () => ({
  NODE_ENV: "test",
  VITE_MATOMO_URL: "http://mocked-base-url",
}))

jest.mock("@codegouvfr/react-dsfr/Button")

describe("Testing Export button", () => {
  const renderComponent = (
    onClick: () => void,
    iconId: "fr-icon-download-line",
    priority: "tertiary no outline",
    type: "button"
  ) =>
    render(
      <Button onClick={onClick} iconId={iconId} priority={priority} type={type}>
        Exporter
      </Button>
    )

  test("Button onClick function is called correctly", () => {
    const handleClick = jest.fn()
    renderComponent(handleClick, "fr-icon-download-line", "tertiary no outline", "button")
    expect(screen.getByText(/Exporter/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Exporter", { exact: false }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test("ExportContractsModal is rendered correctly", () => {
    let renderModal = () => {
      render(<ExportContractsModal />)
    }

    const originalRenderModal = renderModal
    renderModal = jest.fn()

    renderComponent(renderModal, "fr-icon-download-line", "tertiary no outline", "button")
    expect(screen.getByText(/Exporter/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText("Exporter", { exact: false }))
    expect(renderModal).toHaveBeenCalledTimes(1)

    originalRenderModal()

    expect(screen.getByText("ExportModal", { exact: false })).toBeInTheDocument()
  })
})
