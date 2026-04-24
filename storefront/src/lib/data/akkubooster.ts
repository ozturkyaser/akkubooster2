/**
 * AkkuBooster Custom API Client
 *
 * Holt Daten von unseren Custom Endpoints (/store/brands, /store/symptoms, etc.)
 */

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function akFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "x-publishable-api-key": PUBLISHABLE_KEY,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    next: { revalidate: 60 }, // ISR: 60 Sekunden Cache
  })

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// ===== BRANDS =====

export type BrandContent = {
  intro?: string
  series?: { name: string; capacity: string; note: string }[]
  compatibleBrands?: string[]
  problems?: {
    icon: string
    title: string
    description: string
    severity: "critical" | "warning" | "info"
  }[]
  faqs?: { question: string; answer: string }[]
  testimonials?: {
    name: string
    location: string
    rating: number
    text: string
  }[]
}

export type Brand = {
  id: string
  handle: string
  name: string
  description: string | null
  logo_url: string | null
  country: string | null
  founded_year: number | null
  website: string | null
  is_featured: boolean
  sort_order: number
  created_at: string
  content?: BrandContent | null
  service_prices?: Record<string, number> | null
}

export async function listBrands(params?: {
  featured?: boolean
  limit?: number
  offset?: number
  q?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.featured) searchParams.set("featured", "true")
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.offset) searchParams.set("offset", String(params.offset))
  if (params?.q) searchParams.set("q", params.q)

  const qs = searchParams.toString()
  return akFetch<{ brands: Brand[]; count: number }>(
    `/store/brands${qs ? `?${qs}` : ""}`
  )
}

export async function getBrand(handle: string) {
  return akFetch<{ brand: Brand }>(`/store/brands/${handle}`)
}

export async function getBrandProducts(handle: string, params?: { limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.offset) searchParams.set("offset", String(params.offset))
  const qs = searchParams.toString()
  return akFetch<{ products: any[]; count: number }>(
    `/store/brands/${handle}/products${qs ? `?${qs}` : ""}`
  )
}

export type BrandService = {
  key:
    | "diagnose"
    | "bms_standard"
    | "bms_high_voltage"
    | "zellentausch_from"
    | "balancing"
    | "ladebuchse"
    | "tiefentladung"
  title: string
  product_handle: string | null
  variant_id: string | null
  price: number | null
  default_price: number | null
  overridden: boolean
}

export async function getBrandServices(handle: string) {
  return akFetch<{
    brand: { handle: string; name: string }
    services: BrandService[]
  }>(`/store/brands/${handle}/services`)
}

/**
 * Slug aus einem Marken-Namen (wie er in Produkt-Metadaten steht),
 * z.B. "Bosch" → "bosch", "Panasonic" → "panasonic".
 */
export function brandNameToHandle(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Versucht Brand-Services ueber den Marken-Namen zu laden (slugifizierter
 * Handle). Gibt null zurueck, wenn keine Marke mit diesem Slug existiert
 * oder keine Overrides gesetzt sind.
 */
export async function getBrandServicesByName(name: string | null | undefined) {
  if (!name) return null
  const handle = brandNameToHandle(name)
  if (!handle) return null
  try {
    return await akFetch<{
      brand: { handle: string; name: string }
      services: BrandService[]
    }>(`/store/brands/${handle}/services`)
  } catch {
    return null
  }
}

// ===== SYMPTOMS =====

export type Symptom = {
  id: string
  handle: string
  title: string
  short_description: string | null
  long_description: string | null
  severity: "info" | "warning" | "critical"
  icon: string | null
  diagnostic_questions: any | null
  probable_causes: string[] | null
  recommended_action: "repair" | "replace" | "diagnosis" | "contact"
  sort_order: number
  is_published: boolean
  created_at: string
}

export async function listSymptoms(params?: {
  severity?: string
  action?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.severity) searchParams.set("severity", params.severity)
  if (params?.action) searchParams.set("action", params.action)

  const qs = searchParams.toString()
  return akFetch<{ symptoms: Symptom[]; count: number }>(
    `/store/symptoms${qs ? `?${qs}` : ""}`
  )
}

export async function getSymptom(handle: string) {
  return akFetch<{ symptom: Symptom }>(`/store/symptoms/${handle}`)
}

// ===== REPAIR ORDERS =====

export type RepairOrder = {
  id: string
  reference: string
  status: string
  customer_email: string
  customer_name: string | null
  brand_name: string | null
  vehicle_model_name: string | null
  reported_symptoms: any[] | null
  customer_notes: string | null
  timeline: RepairTimelineEvent[]
  created_at: string
}

export type RepairTimelineEvent = {
  id: string
  type: string
  title: string
  description: string | null
  actor: string
  is_customer_visible: boolean
  created_at: string
}

export async function getRepairOrder(idOrRef: string) {
  return akFetch<{ repair_order: RepairOrder }>(
    `/store/repair-orders/${idOrRef}`
  )
}

export async function createRepairOrder(data: {
  customer_email: string
  customer_name?: string
  customer_phone?: string
  brand_name?: string
  vehicle_model_name?: string
  reported_symptoms?: { handle: string; title: string }[]
  customer_notes?: string
}) {
  return akFetch<{ repair_order: RepairOrder }>("/store/repair-orders", {
    method: "POST",
    body: JSON.stringify(data),
    next: { revalidate: 0 }, // no cache for mutations
  })
}
