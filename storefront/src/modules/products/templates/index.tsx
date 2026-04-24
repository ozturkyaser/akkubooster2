import React, { Suspense } from "react"
import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import ServiceTabs from "@modules/products/components/service-tabs"
import ProductFaq from "@modules/products/components/product-faq"
import { RepairSettingsData, ProductContentData } from "@lib/sanity/queries"
import {
  brandNameToHandle,
  getBrandServicesByName,
  type BrandService,
} from "@lib/data/akkubooster"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[] | null
  repairSettings?: RepairSettingsData | null
  productContent?: ProductContentData | null
}

/* ── helpers ─────────────────────────────────────────── */

function extractBrandFromMeta(product: HttpTypes.StoreProduct): string | null {
  const meta = product.metadata as Record<string, string> | null
  if (meta?.shopify_vendor && meta.shopify_vendor !== "Battery Cycle") {
    return meta.shopify_vendor
  }
  if (meta?.shopify_tags) {
    const tags = meta.shopify_tags.split(",").map((t) => t.trim())
    if (tags.length > 0 && tags[0]) return tags[0]
  }
  return null
}

function extractVoltage(title: string): string | null {
  const match = title.match(/(\d{2,3})\s*V\b/i)
  return match ? `${match[1]}V` : null
}

function shortenDescription(
  desc: string | null | undefined,
  maxLen = 250
): string {
  if (!desc) return ""
  if (desc.length <= maxLen) return desc
  return desc.substring(0, desc.lastIndexOf(" ", maxLen)) + "…"
}

/* ── CMS fallback defaults ──────────────────────────── */

const defaultTrustBadges = [
  { icon: "shield", title: "12 Monate Garantie", description: "Auf alle Zellen & Arbeit" },
  { icon: "truck", title: "Kostenloser Rückversand", description: "Versicherter Versand" },
  { icon: "clock", title: "Zahlung nach Reparatur", description: "Kein Risiko für Sie" },
  { icon: "check", title: "Zertifizierte Reparatur", description: "Hochwertige Markenzellen" },
]

const defaultProcessSteps = [
  { title: "Service wählen", description: "Zellentausch, Reparatur oder Diagnose" },
  { title: "Akku einsenden", description: "Kostenlos & versichert an uns senden" },
  { title: "Professionelle Arbeit", description: "Diagnose, Reparatur oder Zellentausch" },
  { title: "Akku zurück", description: "Reparierter Akku, wie neu!" },
]

const defaultServiceCards = [
  { title: "Zellentausch", preisText: "ab 199 €", description: "Alle Zellen werden durch neue Markenzellen ersetzt. Volle Kapazität & maximale Reichweite.", color: "green" as const },
  { title: "Reparatur", preisText: "ab 80 €", description: "BMS-Schäden, Tiefentladung, Elektronik-Fehler. Preise abhängig vom Problem.", color: "amber" as const },
  { title: "Diagnose", preisText: "49 €", description: "Umfassende Analyse mit Testprotokoll. Wird bei Reparatur angerechnet.", color: "blue" as const },
]

const defaultSymptomTags = [
  "Akku lädt nicht mehr", "Geringe Reichweite", "Plötzliches Abschalten",
  "Lange Ladezeit", "Display-Fehlermeldung", "Akku wird heiß",
  "Kapazitätsverlust", "Lässt sich nicht einschalten",
]

/**
 * Mappt ein Sidebar-Label (aus CMS oder Defaults) auf einen Service-Key,
 * um den passenden Brand-Override zu finden. Unbekannte Labels liefern null.
 */
function resolveSidebarOverride(
  label: string,
  overrides: Partial<Record<BrandService["key"], number>>
): number | null {
  const l = label.toLowerCase()
  let key: BrandService["key"] | null = null
  if (l.includes("bms")) {
    key = l.includes(">60") || l.includes("high") ? "bms_high_voltage" : "bms_standard"
  } else if (l.includes("tiefentlad")) {
    key = "tiefentladung"
  } else if (l.includes("balan") || l.includes("ausbal")) {
    key = "balancing"
  } else if (l.includes("diagnose")) {
    key = "diagnose"
  } else if (l.includes("ladebuchse") || l.includes("anschlussbuchse")) {
    key = "ladebuchse"
  } else if (l.includes("zellentausch")) {
    key = "zellentausch_from"
  }
  if (!key) return null
  const v = overrides[key]
  return typeof v === "number" ? v : null
}

/**
 * Mappt einen „Verfuegbare Services"-Card-Titel (Zellentausch / Reparatur /
 * Diagnose) auf den passenden brand service_key. Bei „Reparatur" nehmen wir
 * BMS als repraesentativen Ab-Preis.
 */
function resolveServiceCardOverride(
  title: string,
  overrides: Partial<Record<BrandService["key"], number>>
): number | null {
  const t = title.toLowerCase()
  let key: BrandService["key"] | null = null
  if (t.includes("zellentausch")) key = "zellentausch_from"
  else if (t.includes("diagnose")) key = "diagnose"
  else if (t.includes("reparatur") || t.includes("bms")) key = "bms_standard"
  else if (t.includes("balan")) key = "balancing"
  else if (t.includes("ladebuchse")) key = "ladebuchse"
  else if (t.includes("tiefentlad")) key = "tiefentladung"
  if (!key) return null
  const v = overrides[key]
  return typeof v === "number" ? v : null
}

const defaultSidebarPreise = [
  { label: "BMS-Reparatur (≤60V)", preis: "120 €", highlight: false },
  { label: "Tiefentladung", preis: "150 €", highlight: false },
  { label: "Ausbalancieren", preis: "150 €", highlight: false },
  { label: "Diagnose", preis: "49 €", highlight: false },
  { label: "Rückversand", preis: "Kostenlos", highlight: true },
]

const defaultNichtReparierbarItems = [
  "Schwere Gehäuseschäden",
  "Brand-/Feuerschäden oder aufgeblähte Zellen",
  "Nicht verfügbare Zelltypen",
]

/* ── component ───────────────────────────────────────── */

const ProductTemplate = async ({
  product,
  region,
  countryCode,
  images,
  repairSettings,
  productContent,
}: ProductTemplateProps) => {
  if (!product || !product.id) {
    return notFound()
  }

  const brand = extractBrandFromMeta(product)
  const voltage = extractVoltage(product.title || "")
  const safeImages = images ?? product.images ?? []
  const thumbnail = safeImages[0]?.url || product.thumbnail

  // Produkt-Content-Fallback-Kette:
  //   1. productContent (Sanity, per Produkt-Handle)
  //   2. repairSettings (Sanity Singleton, globale Defaults)
  //   3. Medusa Produkt-Felder / hardcoded Defaults
  const pc = productContent ?? ({} as NonNullable<typeof productContent>)
  const effectiveTitle = pc.titleOverride || product.title
  const heroSubtitle = pc.subtitle
  const shortDesc =
    pc.shortDescription ?? shortenDescription(product.description)
  const descriptionHeading = pc.descriptionHeading || "Über diesen Akku"
  const descriptionText = pc.descriptionPlain ?? product.description
  const serviceCardsHeading = pc.serviceCardsHeading || "Verfügbare Services"
  const sidebarHeading = pc.sidebarHeading || "Reparatur-Preise"

  const trustBadges =
    (pc.trustBadges && pc.trustBadges.length ? pc.trustBadges : undefined) ??
    repairSettings?.trustBadges ??
    defaultTrustBadges
  const processHeading =
    pc.processHeading ?? repairSettings?.processHeading ?? "So funktioniert es"
  const processSteps =
    (pc.processSteps && pc.processSteps.length ? pc.processSteps : undefined) ??
    repairSettings?.processSteps ??
    defaultProcessSteps
  const serviceCards =
    (pc.serviceCards && pc.serviceCards.length ? pc.serviceCards : undefined) ??
    repairSettings?.serviceCards ??
    defaultServiceCards
  const symptomTags =
    (pc.symptomTags && pc.symptomTags.length ? pc.symptomTags : undefined) ??
    repairSettings?.symptomTags ??
    defaultSymptomTags
  const sidebarPreise =
    (pc.sidebarPreise && pc.sidebarPreise.length
      ? pc.sidebarPreise
      : undefined) ??
    repairSettings?.sidebarPreise ??
    defaultSidebarPreise
  const sidebarHinweis =
    pc.sidebarHinweis ??
    repairSettings?.sidebarHinweis ??
    "Zahlung erst nach erfolgreicher Reparatur. Diagnose-Kosten werden bei Reparaturauftrag angerechnet."
  const nichtReparierbarHeading =
    pc.nichtReparierbarHeading ??
    repairSettings?.nichtReparierbarHeading ??
    "Wann ist keine Reparatur möglich?"
  const nichtReparierbarItems =
    (pc.nichtReparierbarItems && pc.nichtReparierbarItems.length
      ? pc.nichtReparierbarItems
      : undefined) ??
    repairSettings?.nichtReparierbarItems ??
    defaultNichtReparierbarItems
  const garantieTitle =
    pc.garantieTitle ?? repairSettings?.garantieTitle ?? "Reparatur-Garantie"
  const garantieText =
    pc.garantieText ??
    repairSettings?.garantieText ??
    "Keine Vorauszahlung nötig. Sie zahlen erst nach erfolgreicher Reparatur. 12 Monate Garantie auf alle Zellen und unsere Arbeit."
  const faqHeading =
    pc.faqHeading ?? repairSettings?.faqHeading ?? "Häufige Fragen"
  const faqItems =
    (pc.faqItems && pc.faqItems.length ? pc.faqItems : undefined) ??
    repairSettings?.faqItems
  const ctaHeading =
    pc.ctaHeading ??
    repairSettings?.ctaHeading ??
    "Bereit für einen Akku wie neu?"
  const ctaSubheading =
    pc.ctaSubheading ??
    repairSettings?.ctaSubheading ??
    "Professioneller Service mit 12 Monaten Garantie. Kostenloser Rückversand. Zahlung nach Reparatur."
  const ctaPrimaryLabel =
    pc.ctaPrimaryLabel ??
    repairSettings?.ctaPrimaryLabel ??
    "Jetzt Service wählen ↑"
  const ctaSecondaryLabel =
    pc.ctaSecondaryLabel ??
    repairSettings?.ctaSecondaryLabel ??
    "Kostenloser Akku-Check →"
  const ctaSecondaryHref =
    pc.ctaSecondaryHref ?? repairSettings?.ctaSecondaryHref ?? "/ki-check"

  // Brand-spezifische Service-Preise (Overrides aus Admin-UI) laden.
  // Wenn keine Marke erkannt oder keine Overrides existieren, bleibt
  // brandServicesData null und die Default-Preise werden verwendet.
  const brandServicesData = await getBrandServicesByName(brand)
  const brandHandle = brand ? brandNameToHandle(brand) : null
  const brandServices: BrandService[] =
    brandServicesData?.services?.filter((s) => s.overridden) ?? []
  const brandOverrideMap: Partial<Record<BrandService["key"], number>> = {}
  for (const s of brandServices) {
    if (s.price != null) brandOverrideMap[s.key] = s.price
  }
  const hasBrandOverrides = brandServices.length > 0

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────── */}
      <div className="bg-grey-5 border-b border-grey-20">
        <div className="content-container py-3">
          <nav className="flex items-center gap-2 text-sm text-grey-50">
            <LocalizedClientLink
              href="/"
              className="hover:text-brand-500 transition-colors"
            >
              Startseite
            </LocalizedClientLink>
            <span>/</span>
            <LocalizedClientLink
              href="/store"
              className="hover:text-brand-500 transition-colors"
            >
              Reparatur
            </LocalizedClientLink>
            {brand && (
              <>
                <span>/</span>
                <span className="text-grey-60">{brand}</span>
              </>
            )}
            <span>/</span>
            <span className="text-grey-90 font-medium truncate max-w-[200px]">
              {effectiveTitle}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="content-container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image */}
          <div className="relative">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-grey-20 overflow-hidden aspect-square relative">
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={effectiveTitle || "Produkt"}
                    fill
                    priority
                    className="object-contain p-6"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-grey-5">
                    <svg
                      className="w-24 h-24 text-grey-30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {safeImages.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {safeImages.map((img, i) => (
                    <div
                      key={img.id}
                      className="flex-shrink-0 w-20 h-20 rounded-lg border border-grey-20 overflow-hidden bg-white"
                    >
                      {img.url && (
                        <Image
                          src={img.url}
                          alt={`Bild ${i + 1}`}
                          width={80}
                          height={80}
                          className="object-contain p-1 w-full h-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Trust badges under image on desktop */}
              <div className="hidden lg:grid grid-cols-2 gap-3 mt-6">
                {trustBadges.map((b, i) => (
                  <TrustBadge key={i} icon={b.icon} title={b.title} desc={b.description} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Info + Service Tabs */}
          <div className="flex flex-col gap-6">
            {/* Title & Badges */}
            <div>
              {brand && (
                <span className="text-sm font-semibold text-brand-500 uppercase tracking-wide">
                  {brand}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-grey-90 mt-1 leading-tight">
                {effectiveTitle}
              </h1>
              {heroSubtitle && (
                <p className="text-grey-60 mt-2 font-medium text-[15px]">
                  {heroSubtitle}
                </p>
              )}
              {shortDesc && (
                <p className="text-grey-50 mt-3 leading-relaxed text-[15px]">
                  {shortDesc}
                </p>
              )}
            </div>

            {/* Info Badges */}
            <div className="flex flex-wrap gap-2">
              {voltage && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {voltage}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Zellentausch möglich
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                3–5 Werktage
              </span>
            </div>

            {/* Mobile Trust Badges */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              {trustBadges.map((b, i) => (
                <TrustBadge key={i} icon={b.icon} title={b.title} desc={b.description} />
              ))}
            </div>

            <hr className="border-grey-20" />

            {/* ── Service Tabs (Zellentausch / Reparatur / Diagnose) ── */}
            <ServiceTabs
              product={product}
              region={region}
              brand={brand}
              brandHandle={brandHandle}
              brandOverrides={brandOverrideMap}
              voltage={voltage}
              repairSettings={repairSettings}
            />

            {/* Repair Guarantee */}
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-grey-90">{garantieTitle}</p>
                  <p className="text-sm text-grey-50 mt-1">{garantieText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process Steps ───────────────────────────────── */}
      <section className="bg-grey-5 py-12 md:py-16">
        <div className="content-container">
          <h2 className="text-xl md:text-2xl font-bold text-grey-90 text-center mb-10">
            {processHeading}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {processSteps.map((ps, i) => (
              <ProcessStep key={i} step={i + 1} title={ps.title} desc={ps.description} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Description + Details + Sidebar ─────────────── */}
      <section className="content-container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            {descriptionText && (
              <div>
                <h2 className="text-xl font-bold text-grey-90 mb-4">
                  {descriptionHeading}
                </h2>
                <div className="text-grey-60 leading-relaxed whitespace-pre-line text-[15px] max-h-[400px] overflow-hidden relative group">
                  {descriptionText}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
                </div>
              </div>
            )}

            {/* Tech Data */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-grey-90 mb-4">
                Technische Daten
              </h3>
              <div className="rounded-xl border border-grey-20 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {brand && (
                      <tr className="border-b border-grey-10">
                        <td className="py-3 px-4 font-medium text-grey-60 bg-grey-5 w-1/3">
                          Hersteller
                        </td>
                        <td className="py-3 px-4 text-grey-90">{brand}</td>
                      </tr>
                    )}
                    {voltage && (
                      <tr className="border-b border-grey-10">
                        <td className="py-3 px-4 font-medium text-grey-60 bg-grey-5 w-1/3">
                          Spannung
                        </td>
                        <td className="py-3 px-4 text-grey-90">{voltage}</td>
                      </tr>
                    )}
                    <tr className="border-b border-grey-10">
                      <td className="py-3 px-4 font-medium text-grey-60 bg-grey-5 w-1/3">
                        Services
                      </td>
                      <td className="py-3 px-4 text-grey-90">
                        Zellentausch, BMS-Reparatur, Diagnose
                      </td>
                    </tr>
                    <tr className="border-b border-grey-10">
                      <td className="py-3 px-4 font-medium text-grey-60 bg-grey-5 w-1/3">
                        Garantie
                      </td>
                      <td className="py-3 px-4 text-grey-90">12 Monate</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-grey-60 bg-grey-5 w-1/3">
                        Bearbeitungszeit
                      </td>
                      <td className="py-3 px-4 text-grey-90">3–5 Werktage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Services Overview */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-grey-90 mb-4 flex items-center gap-2">
                {serviceCardsHeading}
                {hasBrandOverrides && brand && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500 text-white">
                    {brand}-Preise
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {serviceCards.map(
                  (sc, i) => {
                    const overridden = resolveServiceCardOverride(
                      sc.title,
                      brandOverrideMap
                    )
                    return (
                      <ServiceCard
                        key={i}
                        title={sc.title}
                        price={
                          overridden != null
                            ? `ab ${new Intl.NumberFormat("de-DE", {
                                style: "currency",
                                currency: "EUR",
                              }).format(overridden / 100)}`
                            : sc.preisText
                        }
                        desc={sc.description}
                        color={sc.color}
                      />
                    )
                  }
                )}
              </div>
            </div>

            {/* Symptoms */}
            <div className="mt-10">
              <h3 className="text-lg font-bold text-grey-90 mb-4">
                Typische Symptome
              </h3>
              <div className="flex flex-wrap gap-2">
                {symptomTags.map((symptom) => (
                  <span
                    key={symptom}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-grey-5 border border-grey-20 text-sm text-grey-60"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Repair Pricing Overview */}
              <div className="bg-white rounded-xl border border-grey-20 overflow-hidden">
                <div className="bg-grey-90 text-white px-5 py-3 flex items-center justify-between">
                  <h3 className="font-semibold">{sidebarHeading}</h3>
                  {hasBrandOverrides && brand && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500 text-white">
                      {brand}
                    </span>
                  )}
                </div>
                <div className="p-5 space-y-3 text-sm">
                  {(() => {
                    const baseItems = sidebarPreise
                    return baseItems.map((sp, i) => {
                      const overridden = resolveSidebarOverride(
                        sp.label,
                        brandOverrideMap
                      )
                      return (
                        <div key={i} className="flex justify-between">
                          <span className="text-grey-60">{sp.label}</span>
                          <span
                            className={`font-semibold ${
                              sp.highlight
                                ? "text-green-600"
                                : overridden != null
                                ? "text-brand-600"
                                : "text-grey-90"
                            }`}
                          >
                            {overridden != null
                              ? `${new Intl.NumberFormat("de-DE", {
                                  style: "currency",
                                  currency: "EUR",
                                }).format(overridden / 100)}`
                              : sp.preis}
                          </span>
                        </div>
                      )
                    })
                  })()}
                  <hr className="border-grey-10" />
                  <p className="text-xs text-grey-40 leading-relaxed">
                    {sidebarHinweis}
                  </p>
                </div>
              </div>

              {/* Not repairable */}
              <div className="bg-white rounded-xl border border-grey-20 overflow-hidden">
                <div className="px-5 py-3 border-b border-grey-10">
                  <h3 className="font-semibold text-grey-90 text-sm">
                    {nichtReparierbarHeading}
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {nichtReparierbarItems.map((item, i) => (
                    <NotRepairableItem key={i} text={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="bg-grey-5 py-12 md:py-16">
        <div className="content-container max-w-3xl">
          <h2 className="text-xl md:text-2xl font-bold text-grey-90 text-center mb-8">
            {faqHeading}
          </h2>
          <ProductFaq brand={brand} voltage={voltage} faqItems={faqItems} />
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bg-brand-500 py-12 md:py-16">
        <div className="content-container text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {ctaHeading}
          </h2>
          <p className="text-brand-100 mb-8 max-w-xl mx-auto">
            {ctaSubheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#product-info"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-brand-600 font-semibold hover:bg-grey-5 transition-colors"
            >
              {ctaPrimaryLabel}
            </a>
            <LocalizedClientLink
              href={ctaSecondaryHref}
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              {ctaSecondaryLabel}
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      {/* ── Related Products ────────────────────────────── */}
      <div
        className="content-container my-12 md:my-16"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

/* ── Sub-Components ────────────────────────────────────── */

function TrustBadge({
  icon,
  title,
  desc,
}: {
  icon: string
  title: string
  desc: string
}) {
  const icons: Record<string, React.ReactNode> = {
    shield: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
    truck: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
      />
    ),
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      />
    ),
  }

  return (
    <div className="flex items-start gap-3 bg-white rounded-lg border border-grey-10 p-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
        <svg
          className="w-4 h-4 text-brand-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icons[icon]}
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-grey-90 leading-tight">
          {title}
        </p>
        <p className="text-xs text-grey-40 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function ProcessStep({
  step,
  title,
  desc,
}: {
  step: number
  title: string
  desc: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-lg mb-3">
        {step}
      </div>
      <h3 className="font-semibold text-grey-90 text-sm">{title}</h3>
      <p className="text-xs text-grey-50 mt-1">{desc}</p>
    </div>
  )
}

function ServiceCard({
  title,
  price,
  desc,
  color,
}: {
  title: string
  price: string
  desc: string
  color: "green" | "amber" | "blue"
}) {
  const colors = {
    green: "border-green-200 bg-green-50",
    amber: "border-amber-200 bg-amber-50",
    blue: "border-blue-200 bg-blue-50",
  }
  const textColors = {
    green: "text-green-700",
    amber: "text-amber-700",
    blue: "text-blue-700",
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <h4 className={`font-bold text-sm ${textColors[color]}`}>{title}</h4>
      <p className={`text-lg font-bold mt-1 ${textColors[color]}`}>{price}</p>
      <p className="text-xs text-grey-50 mt-2 leading-relaxed">{desc}</p>
    </div>
  )
}

function NotRepairableItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <svg
        className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <span className="text-sm text-grey-60">{text}</span>
    </div>
  )
}

export default ProductTemplate
