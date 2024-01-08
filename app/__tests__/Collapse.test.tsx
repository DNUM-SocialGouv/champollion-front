import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Collapse from "../src/components/Collapse"

describe("Collapse Component", () => {
  it("renders with default collapsed state", () => {
    render(
      <Collapse
        shortDesc="Short Description"
        id="test-collapse"
        label="Voir plus"
        labelOpen="Voir moins"
      >
        <div>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      </Collapse>
    )

    const contentElement = screen.getByText("Short Description")

    expect(contentElement).toHaveStyle({ visibility: "visible" })

    const expandedElement = document.querySelector(".fr-collapse--expanded")

    expect(expandedElement).not.toBeInTheDocument()
  })

  it("expands when button is clicked", async () => {
    render(
      <Collapse
        shortDesc="Short Description"
        id="test-collapse"
        label="Voir plus"
        labelOpen="Voir moins"
      >
        <div>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      </Collapse>
    )

    fireEvent.click(screen.getByText("Voir plus"))

    expect(screen.getByText("Item 1")).toHaveStyle({ visibility: "visible" })

    await waitFor(() => {
      const expandedElement = document.querySelector(".fr-collapse--expanded")
      expect(expandedElement).toBeInTheDocument()
    })
  })
})
