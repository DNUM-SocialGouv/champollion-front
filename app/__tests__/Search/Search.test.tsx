import { screen, render, fireEvent } from "@testing-library/react"
import Search, { action, loader } from "../../src/routes/search/Search"
import { MemoryRouter, redirect } from "react-router-dom"
import { isAppError } from "../../src/helpers/errors"
import { getExternalLinks } from "../../src/api"
const mockedExtenalData = [
  {
    key: "1",
    desc: "Description 1",
    title: "Title 1",
    href: "https://example.com/link1",
    picto: "data-viz",
  },

  {
    key: "2",
    desc: "Description 2",
    title: "Title 2",
    href: "https://example.com/link2",
    picto: "document",
  },
]

jest.mock("../../src/api", () => ({
  getExternalLinks: jest.fn().mockResolvedValue([
    {
      key: "1",
      desc: "Description 1",
      title: "Title 1",
      href: "https://example.com/link1",
      picto: "data-viz",
    },
    {
      key: "2",
      desc: "Description 2",
      title: "Title 2",
      href: "https://example.com/link2",
      picto: "document",
    },
  ]),
  getEtablissementsType: jest.fn((x) => {
    if (x === "123")
      return { message: "siret not found", type: "not_found", context: null }
    return { ett: x === "27894234000000" ? true : false, raisonSociale: "Some Company" }
  }),
}))

jest.mock("../../src/routes/search/SearchHistory", () => jest.fn(() => <div> </div>))
jest.mock("../../src/api/config", () => ({ baseURL: "" }))
jest.mock("../../src/helpers/errors", () => ({
  isDevMode: true,
  isAppError: jest.fn(),
}))
jest.mock("react-router-typesafe", () => ({
  useLoaderData: jest.fn(() => [
    {
      key: "1",
      desc: "Description 1",
      title: "Title 1",
      href: "https://example.com/link1",
      picto: "data-viz",
    },
    {
      key: "2",
      desc: "Description 2",
      title: "Title 2",
      href: "https://example.com/link2",
      picto: "document",
    },
  ]),
  useActionData: jest.fn(),
}))
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as object),
  useNavigate: () => jest.fn(),
  redirect: jest.fn(),
  // @ts-ignore - Temporarily ignore TypeScript errors for the next line

  Link: ({ children }) => <a>{children}</a>,
  // @ts-ignore - Temporarily ignore TypeScript errors for the next line

  Form: ({ children }) => <form data-testid="custom-form-element">{children}</form>,
}))

// jest.mock("../../src/components/Message.tsx", () => (
//   <div title="Mock MessageComponent"></div>
// ))

jest.mock("@codegouvfr/react-dsfr/Alert")

describe("Search component", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test("rendres without crash", () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    )
    expect(screen.getByText("Rechercher un établissement")).toBeInTheDocument()
    expect(screen.getByText("Title 1")).toBeInTheDocument()
  })

  test("submits the form with the SIRET number", async () => {
    jest.mock("../../src/routes/search/Search", () => ({
      ...jest.requireActual("../../src/routes/search/Search"),
      action: jest.fn(),
    }))

    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>
    )
    const inputElement = screen.getByTestId("custom-input-element") as HTMLInputElement
    fireEvent.change(inputElement, { target: { value: "27894234000000" } })
    expect(inputElement.value).toBe("27894234000000")
    fireEvent.click(screen.getByTestId("custom-form-element"))
  })
})

describe("Action and Loader Functions", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it("should handle action correctly", async () => {
    const mockedIsAppError = isAppError as unknown as jest.Mock
    mockedIsAppError.mockReturnValue(false)
    const mockFormData = new FormData()
    mockFormData.append("siret", "123456789")

    const mockRequest = {
      formData: () => Promise.resolve(mockFormData),
    }
    const mockParams = {}

    await action({
      request: mockRequest as any,
      params: mockParams as any,
    })
    expect(isAppError).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith("/etablissement/123456789")
  })

  it("should handle action correctly for ett", async () => {
    const mockedIsAppError = isAppError as unknown as jest.Mock
    mockedIsAppError.mockReturnValue(false)

    const mockFormData = new FormData()
    mockFormData.append("siret", "27894234000000")

    const mockRequest = {
      formData: () => Promise.resolve(mockFormData),
    }
    const mockParams = {}

    await action({
      request: mockRequest as any,
      params: mockParams as any,
    })
    expect(isAppError).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith("/ett/27894234000000")
  })

  it("should handle action error", async () => {
    const mockedIsAppError = isAppError as unknown as jest.Mock
    mockedIsAppError.mockReturnValue(true)

    const mockFormData = new FormData()
    mockFormData.append("siret", "123")

    const mockRequest = {
      formData: () => Promise.resolve(mockFormData),
    }
    const mockParams = {}

    await action({
      request: mockRequest as any,
      params: mockParams as any,
    })
    expect(isAppError).toHaveBeenCalled()
  })

  it("should handle loder correctly", async () => {
    const mockedIsAppError = isAppError as unknown as jest.Mock
    mockedIsAppError.mockReturnValue(false)
    const result = await loader()
    expect(getExternalLinks).toHaveBeenCalled()
    expect(result).toEqual(mockedExtenalData)
  })

  it("should handle loder error", async () => {
    const mockedIsAppError = isAppError as unknown as jest.Mock
    mockedIsAppError.mockReturnValue(true)
    const result = await loader()
    expect(getExternalLinks).toHaveBeenCalled()
    expect(result).toEqual([])
  })
})
