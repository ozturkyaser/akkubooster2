import { createClient } from "@sanity/client"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ""
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
const apiVersion = "2026-04-01"

// Standard-Client (published content, CDN)
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    enabled: false,
  },
})

// Draft-Client (unpublished content, stega encoding for click-to-edit)
export const sanityDraftClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "drafts",
  stega: {
    enabled: true,
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333",
  },
})

/**
 * Fetches content from Sanity.
 * In draft mode: returns unpublished drafts with stega encoding for click-to-edit.
 * In production: returns published content from CDN.
 */
export async function fetchPage<T>(
  query: string,
  params?: Record<string, unknown>,
  isDraftMode?: boolean
): Promise<T | null> {
  if (!projectId) {
    return null
  }

  try {
    const client = isDraftMode ? sanityDraftClient : sanityClient
    const data = await client.fetch<T>(query, params || {}, {
      next: isDraftMode ? { revalidate: 0 } : { revalidate: 60 },
    } as any)
    return data
  } catch (err) {
    console.error("Sanity Fetch Fehler:", err)
    return null
  }
}
