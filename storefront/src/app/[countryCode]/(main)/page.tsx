import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import Stats from "@modules/home/components/stats"
import ServiceCards from "@modules/home/components/service-cards"
import ProcessSteps from "@modules/home/components/process-steps"
import ProductHighlights from "@modules/home/components/product-highlights"
import BrandGrid from "@modules/home/components/brand-grid"
import SymptomGrid from "@modules/home/components/symptom-grid"
import TrustSection from "@modules/home/components/trust-section"
import FAQSection from "@modules/home/components/faq-section"
import CTASection from "@modules/home/components/cta-section"
import { listBrands, listSymptoms } from "@lib/data/akkubooster"
import { getHomePage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function fetchFeaturedProducts(handles: string[]) {
  if (!handles.length) return []

  try {
    const products = await Promise.all(
      handles.map(async (handle) => {
        try {
          const res = await fetch(
            `${BACKEND_URL}/store/products?handle=${handle}&fields=id,handle,title,description,thumbnail,variants.calculated_price`,
            {
              headers: {
                "x-publishable-api-key": PUBLISHABLE_KEY,
                "Content-Type": "application/json",
              },
              next: { revalidate: 60 },
            }
          )
          if (!res.ok) return null
          const data = await res.json()
          return data.products?.[0] || null
        } catch {
          return null
        }
      })
    )
    return products.filter(Boolean)
  } catch {
    return []
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getHomePage(false)
  return {
    title: cms?.seo?.title || "AkkuBooster — E-Bike Akku Reparatur | Zellentausch & Diagnose",
    description: cms?.seo?.description ||
      "E-Bike, E-Scooter & E-Cargo Akku reparieren. Zellentausch ab 299 EUR. 25+ Marken. Kostenlose KI-Diagnose. 12 Monate Garantie. Werkstatt in Berlin, Versand DE/AT/CH.",
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const draft = await draftMode()
  const [brandsResult, symptomsResult, cms] = await Promise.all([
    listBrands({ featured: true, limit: 12 }).catch(() => ({ brands: [] })),
    listSymptoms().catch(() => ({ symptoms: [] })),
    getHomePage(draft.isEnabled),
  ])

  const brands = brandsResult.brands
  const symptoms = symptomsResult.symptoms

  // Fetch featured products from CMS handles
  const productHandles = cms?.featuredProductHandles?.map((p) => p.handle).filter(Boolean) || []
  const featuredProducts = await fetchFeaturedProducts(productHandles)

  // Add badges from CMS
  const productsWithBadges = featuredProducts.map((p: any) => ({
    ...p,
    badge: cms?.featuredProductHandles?.find((h) => h.handle === p.handle)?.badge,
  }))

  return (
    <>
      <Hero cms={cms} />
      <Stats cms={cms} />
      <ServiceCards cms={cms} />
      <ProcessSteps cms={cms} />
      {productsWithBadges.length > 0 && (
        <ProductHighlights products={productsWithBadges} cms={cms} />
      )}
      {brands.length > 0 && <BrandGrid brands={brands} cms={cms} />}
      {(symptoms.length > 0 || (cms?.symptomItems?.length ?? 0) > 0) && (
        <SymptomGrid symptoms={symptoms} cms={cms} />
      )}
      <TrustSection cms={cms} />
      <CTASection cms={cms} />
      <FAQSection cms={cms} />
    </>
  )
}
