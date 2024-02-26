const getConfig = () => {
  console.log(import.meta.env)
  return import.meta.env?.VITE_APP_URL || ""
}

export default getConfig
