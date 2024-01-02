import { any } from "prop-types"

const Modal = () => <div>{"Mocked Modal"}</div>

const createModal = () => {
  return <div>{"Mocked Modal"}</div>
}

const ExportContractsModal = (SunFunc: any) => (
  <form
    onSubmit={() => {
      SunFunc
    }}
  >
    {"Mocked ExportModal"}
    <button type="submit">Download</button>
  </form>
)

export { Modal, createModal, ExportContractsModal }
