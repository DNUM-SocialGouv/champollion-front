import React from "react"
import { render, screen } from "@testing-library/react"
import MessageComponent from "../../src/components/Message"
import getConfig from "../../src/constants"

jest.mock("../../src/constants")

describe("MessageComponent", () => {
  it("renders nothing when APP_URL is not the expected URL", () => {
    // @ts-ignore -hsh
    getConfig.mockImplementation(() => "visudsn.dev.intranet.travail.gouv.fr")
    render(<MessageComponent />)

    expect(screen.getByTestId("custom-notice-element")).toBeInTheDocument()
    expect(
      screen.getByText(/Vous consultez le site de développement de l’application VISUDSN/)
    ).toBeInTheDocument()
  })
  it("renders nothing when APP_URL is not the expected URL", () => {
    // @ts-ignore -hsh
    getConfig.mockImplementation(() => "")
    const { container } = render(<MessageComponent />)

    expect(container).toBeEmptyDOMElement()
  })
})
