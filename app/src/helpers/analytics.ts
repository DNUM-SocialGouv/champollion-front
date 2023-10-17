type TrackEventArgs = {
  category: string
  action: string
  properties?: string | Record<string, string>
  value?: number
}

export const trackEvent = ({ category, action, properties, value }: TrackEventArgs) => {
  const _paq = (window._paq = window._paq || [])

  const name =
    typeof properties === "string"
      ? properties
      : typeof properties === "object"
      ? JSON.stringify(properties)
      : ""
  _paq.push(["trackEvent", category, action, name, value])
}

export const trackPageView = () => {
  const _paq = (window._paq = window._paq || [])

  _paq.push(["setCustomUrl", "/" + window.location.pathname])
  _paq.push(["setDocumentTitle", document.title])
  _paq.push(["trackPageView"])
}

export const initMatomo = (isProd: boolean) => {
  const url = import.meta.env.VITE_MATOMO_URL
  const id = import.meta.env.VITE_MATOMO_SITE_ID

  if (isProd && url && id) {
    const _paq = (window._paq = window._paq || [])

    _paq.push(["trackPageView"])
    _paq.push(["enableLinkTracking"])
    ;(function () {
      _paq.push(["setTrackerUrl", url + "piwik.php"])
      _paq.push(["setSiteId", id])
      const d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0]
      g.async = true
      g.src = url + "piwik.js"
      s.parentNode && s.parentNode.insertBefore(g, s)
    })()
  }
}
