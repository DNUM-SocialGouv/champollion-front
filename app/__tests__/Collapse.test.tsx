import { fireEvent, render, screen } from "@testing-library/react"

import Collapse from "../src/components/Collapse"

jest.mock("@codegouvfr/react-dsfr/Button")

describe("Collapse component", () => {
  test("renders with default props", () => {
    render(
      <Collapse id="test-collapse">
        <div>Test content </div>
      </Collapse>
    )
    // expect(screen.queryByText("Test content")).toBeVisible()
  })

  test("Extend visibility on button click", () => {
    render(
      <Collapse id="test-collapse">
        <div>Test content </div>
      </Collapse>
    )
  })
})
