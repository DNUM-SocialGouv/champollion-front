/* eslint-disable @typescript-eslint/no-explicit-any */

const arrayEquals = <T>(a: Array<T>, b: Array<T>): boolean => {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  )
}

const findDuplicates = <T>(arr: Array<T>): Array<T> => {
  const uniqueSet: Set<T> = new Set()
  const duplicatesSet: Set<T> = new Set()

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i]
    if (uniqueSet.has(element)) {
      duplicatesSet.add(element)
    } else {
      uniqueSet.add(element)
    }
  }

  return Array.from(duplicatesSet)
}

// keyToCamel code coming from https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript
const isObject = function (input: unknown) {
  return input === Object(input) && !Array.isArray(input) && typeof input !== "function"
}
const toCamel = (string: string) => {
  return string.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "")
  })
}
const camelToSnakeCase = (string: string) =>
  string.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

const keysToCamel = (input: any): any => {
  if (isObject(input)) {
    const res: Record<string, string> = {}

    Object.keys(input).forEach((key) => {
      Object.assign(res, {
        [toCamel(key)]: keysToCamel(input[key]),
      })
    })

    return res
  } else if (Array.isArray(input)) {
    return input.map((index) => {
      return keysToCamel(index)
    })
  }

  return input
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
const uncapitalize = (str: string) => str.charAt(0).toLowerCase() + str.slice(1)

const formatNumber = (value: number | string) =>
  value && Number(value)
    ? value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })
    : value

const getQueryAsString = (searchParams: URLSearchParams, key: string) =>
  decodeURIComponent(searchParams.get(key) ?? "")

const getQueryAsNumber = (searchParams: URLSearchParams, key: string) => {
  const query = decodeURIComponent(searchParams.get(key) ?? "")
  return query ? Number(query) : undefined
}

const getQueryAsArray = (searchParams: URLSearchParams, key: string) =>
  searchParams
    .getAll(key)
    .map((value) => decodeURIComponent(value))
    .filter(Boolean)

const getQueryAsNumberArray = (searchParams: URLSearchParams, key: string) =>
  searchParams
    .getAll(key)
    .map((value) => Number(decodeURIComponent(value)))
    .filter(Boolean)

const getQueryPage = (searchParams: URLSearchParams) =>
  parseInt(searchParams.get("page") || "1")

const createFiltersQuery = ({
  startDate,
  endDate,
  motives,
  natures,
  jobs,
}: {
  startDate?: string
  endDate?: string
  motives?: number[]
  natures?: string[]
  jobs?: number[]
}) => {
  let query = ""
  // todo refacto with map english key <=> french query param
  if (startDate) query += "&debut=" + startDate
  if (endDate) query += "&fin=" + endDate
  if (motives) motives.forEach((motive) => (query += `&motif=${motive}`))
  if (natures) natures.forEach((nature) => (query += `&nature=${nature}`))
  if (jobs) jobs.forEach((job) => (query += `&poste=${job}`))

  return query
}

/* Format unknow data from localstorage */

export const formatLocalMerges = (data: unknown): number[][] | undefined => {
  let formattedMergesIds: number[][] | undefined
  if (Array.isArray(data)) {
    formattedMergesIds = [] as number[][]
    data.forEach((merge) => {
      if (Array.isArray(merge)) {
        Array.isArray(formattedMergesIds) &&
          formattedMergesIds.push(merge.map(Number).filter(Boolean))
      }
    })
    formattedMergesIds = formattedMergesIds.filter((merge) => merge.length > 0)
  } else formattedMergesIds = undefined

  return formattedMergesIds
}

export type DayCode = "0" | "1" | "2" | "3" | "4" | "5" | "6"
export type OpenDay = { code: DayCode; label: string; checked: boolean }
export type PublicHolidaysClosed = "yes" | "no"

export const formatLocalOpenDays = (
  dataFromLocalStorage: unknown
): DayCode[] | undefined => {
  let formattedOpenDaysCode: DayCode[] | undefined

  if (Array.isArray(dataFromLocalStorage)) {
    formattedOpenDaysCode = dataFromLocalStorage.filter((item) => {
      return (
        typeof item === "string" && ["0", "1", "2", "3", "4", "5", "6"].includes(item)
      )
    })
  }

  return formattedOpenDaysCode
}

export const formatLocalExceptionalDates = (
  dataFromLocalStorage: unknown
): string[] | undefined => {
  let formattedExceptionalDate: string[] | undefined

  if (Array.isArray(dataFromLocalStorage)) {
    formattedExceptionalDate = dataFromLocalStorage.map((item) => String(item))
  }

  return formattedExceptionalDate
}

export const formatLocalClosedPublicHolidays = (
  dataFromLocalStorage: unknown
): PublicHolidaysClosed => {
  if (
    typeof dataFromLocalStorage === "string" &&
    ["yes", "no"].includes(dataFromLocalStorage)
  )
    return dataFromLocalStorage as PublicHolidaysClosed

  return "yes"
}

export const weekendDayCodes = (openDays: OpenDay[]) =>
  openDays.filter((day) => !day.checked).map((day) => Number(day.code))

export const addArrayParams = <T>(
  params: string,
  array: Array<T> | undefined,
  key: string
) => {
  if (array && array.length > 0) {
    const stringParam = array.map((element) => `${key}=${element}`).join("&")
    params += `&${stringParam}`
  }
  return params
}

export const splitSentenceAtMiddle = (sentence: string) => {
  const middleIndex = Math.floor(sentence.length / 2)
  // Find the first whitespace of the second half of the sentence
  let splitIndex = sentence.indexOf(" ", middleIndex)
  // If no whitespace was found to the right of the middle, try to find it to the left
  if (splitIndex === -1) splitIndex = sentence.lastIndexOf(" ", middleIndex)

  if (splitIndex != -1) {
    // Split the sentence into two parts
    const firstPart = sentence.substring(0, splitIndex).trim()
    const secondPart = sentence.substring(splitIndex + 1).trim()

    return [firstPart, secondPart]
  } else return [sentence]
}

export {
  arrayEquals,
  camelToSnakeCase,
  capitalize,
  createFiltersQuery,
  findDuplicates,
  formatNumber,
  getQueryAsArray,
  getQueryAsNumber,
  getQueryAsNumberArray,
  getQueryAsString,
  getQueryPage,
  isObject,
  keysToCamel,
  toCamel,
  uncapitalize,
}
