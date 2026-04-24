"use client"

import { enableVisualEditing } from "@sanity/visual-editing"
import { useEffect } from "react"

export default function SanityVisualEditing() {
  useEffect(() => {
    const disable = enableVisualEditing({
      history: {
        // Sync URL changes between Studio and preview
        update: (update) => {
          if (update.type === "push" || update.type === "replace") {
            window.history[`${update.type}State`](null, "", update.url)
          } else if (update.type === "pop") {
            window.history.back()
          }
        },
        subscribe: (navigate) => {
          const handler = () => {
            navigate({
              type: "push",
              url: `${window.location.pathname}${window.location.search}`,
            })
          }
          window.addEventListener("popstate", handler)
          return () => window.removeEventListener("popstate", handler)
        },
      },
    })
    return () => disable()
  }, [])

  return null
}
