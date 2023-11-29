import { render, screen } from "@testing-library/react"
import { BrowserRouter as Router } from "react-router-dom"
import PictoTile from "../PictoTile"

describe("PictoTile", () => {
  const sampleProps = {
    title: "Sample Title",
    desc: "Sample Description",
    pictogramUrl: "sample-pictogram-url",
    horizontal: true,
    linkProps: {
      to: "/sample-link",
    },
    anchorProps: {
      href: "/sample-anchor",
      target: "_blank",
    },
  }

  test("renders PictoTile with link", () => {
    // Add router to ensure the title is rendered as a link
    render(
      <Router>
        <PictoTile {...sampleProps} />
      </Router>
    )

    const linkElement = screen.getByRole("link", { name: /Sample Title/i })
    expect(linkElement).toBeInTheDocument()
  })

  test("renders PictoTile with anchor", () => {
    // Ensure the title is rendered as an anchor
    render(<PictoTile {...sampleProps} linkProps={undefined} />)

    const anchorElement = screen.getByRole("link", { name: /Sample Title/i })
    expect(anchorElement).toBeInTheDocument()
  })
})
