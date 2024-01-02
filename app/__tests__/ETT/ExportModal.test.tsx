import { Button } from "@codegouvfr/react-dsfr/Button"
import { fireEvent, render, screen } from "@testing-library/react"
import { ExportContractsModal } from "../../__mocks__/@codegouvfr/react-dsfr/Modal"

describe("Testing the download button", () => {
  test("Button onSubmit function is called correctly", async () => {
    let Submitted = () => render(<div>Submitted</div>)

    const OriginalSubmitted = Submitted

    Submitted = jest.fn()

    const renderModal = () => {
      render(<ExportContractsModal onSubmit={Submitted} />)
    }

    renderModal()
    expect(screen.getByText(/mocked/i)).toBeInTheDocument()
    expect(screen.getByText(/Download/i)).toBeInTheDocument()
    expect(screen.getByRole("button")).toBeInTheDocument()
    fireEvent.submit(screen.getByRole("button"))
    expect(Submitted).toHaveBeenCalled

    OriginalSubmitted()

    expect(screen.getByText("Submitted", { exact: false })).toBeInTheDocument()
  })
})
