import EstablishmentBanner from "../../src/components/establishment/EstablishmentBanner"

import { render, screen } from "@testing-library/react"

jest.mock("@codegouvfr/react-dsfr/Badge")

describe("Etablishment Banner component", () => {
  const renderComponent = (
    etabNameTest: string,
    siretTest: string,
    isOpenTest: boolean | undefined,
    isEttTest: boolean
  ) =>
    render(
      <EstablishmentBanner
        etabName={etabNameTest}
        siret={siretTest}
        isOpen={isOpenTest}
        isEtt={isEttTest}
      />
    )

  {
    test("Etablishment Banner renders correctly", () => {
      const etabNameT = "test"
      const siretT = "9999999999"
      const isOpenT = true
      const isEttT = true
      renderComponent(etabNameT, siretT, isOpenT, isEttT)
      expect(
        screen.getByText("Etablissement de Travail Temporaire", { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText(etabNameT, { exact: false })).toBeInTheDocument()
      expect(screen.getByText(siretT, { exact: false })).toBeInTheDocument()
      expect(screen.getByText("Badge", { exact: false })).toBeInTheDocument()
    })

    test("Etablishment Banner renders correctly when isOpen is undefined", () => {
      const etabNameT = "test"
      const siretT = "9999999999"
      const isOpenT = undefined
      const isEttT = true
      renderComponent(etabNameT, siretT, isOpenT, isEttT)
      expect(
        screen.getByText("Etablissement de Travail Temporaire", { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText(etabNameT, { exact: false })).toBeInTheDocument()
      expect(screen.getByText(siretT, { exact: false })).toBeInTheDocument()
    })
  }
})
