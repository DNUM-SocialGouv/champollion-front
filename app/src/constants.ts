const getConfig = () => {
  return import.meta.env?.VITE_APP_URL || ""
}

export default getConfig
