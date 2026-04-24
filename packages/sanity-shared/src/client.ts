import { createClient, type ClientConfig } from "@sanity/client"

export const apiVersion = "2026-04-01"

export function getSanityClient(config: {
  projectId: string
  dataset?: string
  useCdn?: boolean
  token?: string
}) {
  return createClient({
    projectId: config.projectId,
    dataset: config.dataset || "production",
    apiVersion,
    useCdn: config.useCdn ?? true,
    token: config.token,
  })
}
