import { EtablissementInfo, LastEffectif } from "../../src/api/types"

import { render, screen } from "@testing-library/react"
import EstablishmentInfo from "../../src/components/establishment/EstablishmentInfo"

jest.mock("@codegouvfr/react-dsfr/Badge")

describe("Etablishment Info component", () => {
  const renderComponent = (
    infoTest: EtablissementInfo,
    lastEffectifTest: LastEffectif | null,
    siretTest: string
  ) =>
    render(
      <EstablishmentInfo
        info={infoTest}
        lastEffectif={lastEffectifTest}
        siret={siretTest}
      />
    )

  {
    test("EtablishmentInfo renders correctly", () => {
      const adresse = "22 rue victor hugo"
      const codeConventionCollective = "Accords professionnels"
      const codeNaf = "7820Z"
      const codePostal = "56100"
      const commune = "Lorient"
      const siretT = "88888"

      const infoT = { adresse, codeConventionCollective, codeNaf, codePostal, commune }

      const value = 0
      const date = "oct. 2020"

      const lastEffectifT = { value, date }

      const href = `https://suit.intranet.travail.gouv.fr/suit/desktop/#/etablissements/${siretT}`

      const href2 = `https://fce.fabrique.social.gouv.fr/establishment/${siretT}`

      renderComponent(infoT, lastEffectifT, siretT)

      const linkElement = screen.getByText("Lien vers SUIT")
      expect(linkElement).toBeInTheDocument()
      expect(linkElement).toHaveAttribute("href", href)
      expect(linkElement).toHaveAttribute("target", "_blank")

      const linkElement2 = screen.getByText("Lien vers FCE")
      expect(linkElement2).toBeInTheDocument()
      expect(linkElement2).toHaveAttribute("href", href2)
      expect(linkElement2).toHaveAttribute("target", "_blank")

      expect(screen.getByText(adresse, { exact: false })).toBeInTheDocument()
      expect(
        screen.getByText(codeConventionCollective, { exact: false })
      ).toBeInTheDocument()
      expect(screen.getByText(codeNaf, { exact: false })).toBeInTheDocument()

      expect(screen.getByText(lastEffectifT.date, { exact: false })).toBeInTheDocument()

      expect(screen.getByText(codePostal, { exact: false })).toBeInTheDocument()
    })
  }
})
