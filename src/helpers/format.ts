/* eslint-disable @typescript-eslint/no-explicit-any */

// keyToCamel code coming from https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript

const isObject = function (input: unknown) {
  return input === Object(input) && !Array.isArray(input) && typeof input !== "function"
}
const toCamel = (string: string) => {
  return string.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace("-", "").replace("_", "")
  })
}
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

export { isObject, toCamel, keysToCamel }
