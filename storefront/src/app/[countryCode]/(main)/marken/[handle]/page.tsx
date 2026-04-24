import { Metadata } from "next"
import Image from "next/image"
import {
  getBrand,
  getBrandProducts,
  getBrandServices,
  listSymptoms,
  type BrandService,
  type BrandContent,
} from "@lib/data/akkubooster"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DynamicIcon from "@modules/common/components/dynamic-icon"
import { getBrandContent } from "@lib/sanity/queries"

type Props = { params: Promise<{ handle: string; countryCode: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
  try {
    const { brand } = await getBrand(handle)
    return {
      title: `${brand.name} E-Bike Akku Reparatur | AkkuBooster`,
      description: `${brand.name} E-Bike Akku reparieren lassen. Zellentausch, Diagnose und Reparatur. Alle ${brand.name} Modelle. 12 Monate Garantie.`,
    }
  } catch {
    return { title: "Marke nicht gefunden | AkkuBooster" }
  }
}

/* ── Brand-spezifische Inhalte ───────────────────────── */

type BrandInfo = {
  intro: string
  series: { name: string; capacity: string; note: string }[]
  compatibleBrands: string[]
}

const BRAND_DATA: Record<string, BrandInfo> = {
  bosch: {
    intro:
      "Bosch gehoert zu den fuehrenden Herstellern von E-Bike Antrieben in Europa. Die Akkus sind modular aufgebaut und lassen sich nahezu vollstaendig reparieren — vom Zellentausch bis zur BMS-Revision.",
    series: [
      { name: "PowerPack Classic Line", capacity: "300 Wh", note: "Rahmen & Gepaecktraeger" },
      { name: "PowerPack Active/Performance", capacity: "300 – 500 Wh", note: "Rahmen & Gepaecktraeger" },
      { name: "PowerTube", capacity: "400 – 750 Wh", note: "Integriert im Rahmen" },
    ],
    compatibleBrands: ["Kalkhoff", "Haibike", "Trek", "Cube", "Scott", "Hercules", "Canyon", "Bulls", "Gazelle", "Riese & Mueller"],
  },
  shimano: {
    intro:
      "Shimano STEPS ist bekannt fuer zuverlaessige Mid-Drive-Systeme und langlebige Akkus. Wir reparieren alle Modelle der BT-E Serie mit Original-Qualitaetszellen.",
    series: [
      { name: "BT-E6000 / E6010", capacity: "418 Wh", note: "Gepaecktraeger" },
      { name: "BT-E8010 / E8014", capacity: "504 – 630 Wh", note: "Rahmen integriert" },
      { name: "BT-E8035 / E8036", capacity: "504 – 630 Wh", note: "InTube" },
    ],
    compatibleBrands: ["Merida", "Focus", "Scott", "Giant", "Kalkhoff", "Raleigh", "Lapierre"],
  },
  yamaha: {
    intro:
      "Yamaha zaehlt zu den aeltesten E-Bike Antriebs-Herstellern und baut besonders robuste Akkus. Unsere Techniker sind auf die gesamte PW-Serie spezialisiert.",
    series: [
      { name: "PW-X / PW-TE", capacity: "400 – 500 Wh", note: "Standard" },
      { name: "PW-ST / PW-CE", capacity: "500 – 630 Wh", note: "Mid & Touring" },
      { name: "InTube Integration", capacity: "400 – 630 Wh", note: "Rahmen integriert" },
    ],
    compatibleBrands: ["Haibike", "Giant", "Winora", "Raleigh", "Diamant", "Victoria"],
  },
  brose: {
    intro:
      "Brose-Antriebe sind leise, kraftvoll und werden in Premium-E-Bikes verbaut. Die Akkus reparieren wir fachgerecht mit hochwertigen Markenzellen.",
    series: [
      { name: "Brose Drive S/T", capacity: "500 – 630 Wh", note: "Mid-Drive" },
      { name: "Integrierte Akkus", capacity: "500 – 750 Wh", note: "InTube" },
    ],
    compatibleBrands: ["Specialized", "BULLS", "Rotwild", "Conway", "Koga"],
  },
  panasonic: {
    intro:
      "Panasonic E-Bike Akkus gehoerten zu den ersten am Markt und sind fuer ihre Langlebigkeit bekannt. Wir reparieren auch aeltere Modelle mit modernen Zellen.",
    series: [
      { name: "Akku 26V", capacity: "10 – 12 Ah", note: "Aeltere Systeme" },
      { name: "Akku 36V", capacity: "8 – 14 Ah", note: "Standard" },
    ],
    compatibleBrands: ["Flyer", "KTM", "Kalkhoff", "Raleigh", "Hercules"],
  },
}

function getBrandInfo(brandName: string): BrandInfo {
  const key = brandName.toLowerCase()
  return (
    BRAND_DATA[key] || {
      intro: `${brandName} E-Bike Akkus werden von unseren Technikern mit hochwertigen Markenzellen repariert. Zellentausch, BMS-Reparatur und vollstaendige Diagnose.`,
      series: [
        { name: "Rahmen-Akkus", capacity: "300 – 500 Wh", note: "Standard" },
        { name: "Gepaecktraeger-Akkus", capacity: "300 – 500 Wh", note: "Rueckbau" },
        { name: "InTube-Akkus", capacity: "400 – 750 Wh", note: "Integriert" },
      ],
      compatibleBrands: [],
    }
  )
}

function getBrandTestimonials(brandName: string) {
  return [
    {
      name: "Markus W.",
      location: "Hamburg",
      rating: 5,
      text: `Mein ${brandName} Akku hatte nach 4 Jahren kaum noch Reichweite. Nach dem Zellentausch laeuft er wie am ersten Tag — schnelle Abwicklung und faire Preise.`,
    },
    {
      name: "Sandra K.",
      location: "Muenchen",
      rating: 5,
      text: `Super Beratung vor der Reparatur. Der ${brandName} Akku war in 4 Tagen wieder da, perfekt verpackt und mit ausfuehrlichem Messprotokoll.`,
    },
    {
      name: "Thomas R.",
      location: "Berlin",
      rating: 5,
      text: `Ich war skeptisch, ob sich die Reparatur meines ${brandName} Akkus lohnt — absolut! Deutlich guenstiger als ein Neuakku und volle Garantie dazu.`,
    },
  ]
}

function getBrandProblems(brandName: string) {
  return [
    {
      icon: "BatteryWarning",
      title: `${brandName} Akku laed nicht mehr`,
      description: `Haeufiges Problem bei ${brandName} E-Bikes: Der Akku reagiert nicht auf das Ladegeraet oder bricht den Ladevorgang ab.`,
      severity: "critical" as const,
    },
    {
      icon: "TrendingDown",
      title: "Reichweite stark reduziert",
      description: `Dein ${brandName} Akku schafft nur noch die Haelfte der gewohnten Strecke? Ursache sind meist gealterte Zellen.`,
      severity: "warning" as const,
    },
    {
      icon: "ZapOff",
      title: "Akku schaltet ploetzlich ab",
      description: `Mitten in der Fahrt geht der ${brandName} Akku aus — typisch fuer BMS-Fehler oder defekte Einzelzellen.`,
      severity: "critical" as const,
    },
    {
      icon: "AlertTriangle",
      title: "Fehlermeldung am Display",
      description: `${brandName} zeigt einen Fehlercode an? Wir kennen alle gaengigen Fehlercodes und finden die Ursache.`,
      severity: "warning" as const,
    },
    {
      icon: "Thermometer",
      title: "Akku wird ungewoehnlich heiss",
      description: `Waermeentwicklung beim Laden oder Fahren kann auf defekte Zellen oder BMS-Probleme hindeuten.`,
      severity: "critical" as const,
    },
    {
      icon: "Activity",
      title: "Ladevorgang bricht ab",
      description: `Das Laden startet, stoppt aber vorzeitig. Oft liegt es an einer Zell-Imbalance oder defekten Ladebuchse.`,
      severity: "warning" as const,
    },
  ]
}

function getBrandFAQ(brandName: string) {
  return [
    {
      question: `Was kostet eine ${brandName} Akku Reparatur?`,
      answer: `Die Kosten haengen vom Defekt ab. Eine BMS-Reparatur beginnt ab 120 EUR, ein Zellentausch ab 299 EUR. Die Diagnose kostet 49 EUR und wird bei Reparaturauftrag angerechnet. Alle Preise inkl. kostenlosem Rueckversand.`,
    },
    {
      question: `Wie lange dauert die ${brandName} Akku Reparatur?`,
      answer: `In der Regel 3-5 Werktage nach Eingang in unserer Werkstatt. Inklusive umfassender Tests und Qualitaetskontrolle. Der Rueckversand ist versichert und kostenlos.`,
    },
    {
      question: `Repariert ihr alle ${brandName} Akku-Modelle?`,
      answer: `Ja, wir reparieren alle gaengigen ${brandName} E-Bike Akkus — unabhaengig von Modell, Baujahr oder Kapazitaet. Unsere Techniker sind auf ${brandName} Systeme spezialisiert.`,
    },
    {
      question: `Lohnt sich die Reparatur meines ${brandName} Akkus?`,
      answer: `In den meisten Faellen ja! Ein Zellentausch kostet 30-60% weniger als ein neuer Originalakku. Dazu kommt: Ihr Gehaeuse bleibt erhalten, alles passt perfekt und Sie schonen die Umwelt.`,
    },
    {
      question: `Welche Garantie erhalte ich auf die ${brandName} Reparatur?`,
      answer: `Sie erhalten 12 Monate Garantie auf alle von uns verbauten Zellen und die durchgefuehrte Arbeit. Wir verwenden ausschliesslich hochwertige Markenzellen von Samsung, LG oder Panasonic.`,
    },
    {
      question: `Kann ich meinen ${brandName} Akku auch vorbeibringen?`,
      answer: `Ja! Sie koennen Ihren Akku direkt in unserer Werkstatt in Berlin abgeben. Oder Sie nutzen unseren kostenlosen Versandservice — wir senden Ihnen ein vorfrankiertes Paketlabel zu.`,
    },
  ]
}

const severityColors = {
  critical: "bg-red-50 border-red-200",
  warning: "bg-amber-50 border-amber-200",
  info: "bg-blue-50 border-blue-200",
}
const severityIconBg = {
  critical: "bg-red-100 text-red-500",
  warning: "bg-amber-100 text-amber-500",
  info: "bg-blue-100 text-blue-500",
}
const severityBadge = {
  critical: "bg-red-100 text-red-600",
  warning: "bg-amber-100 text-amber-600",
  info: "bg-blue-100 text-blue-600",
}

export default async function BrandDetailPage(props: Props) {
  const { handle, countryCode } = await props.params

  let brand
  try {
    const data = await getBrand(handle)
    brand = data.brand
  } catch {
    notFound()
  }

  // Produkte, Services und Sanity-Content parallel laden
  const [productsData, servicesData, sanityContent] = await Promise.all([
    getBrandProducts(handle, { limit: 12 }).catch(() => ({ products: [], count: 0 })),
    getBrandServices(handle).catch(() => ({
      brand: { handle, name: handle },
      services: [] as BrandService[],
    })),
    getBrandContent(handle).catch(() => null),
  ])

  const products = productsData.products
  const services = servicesData.services
  const productCount = productsData.count || products.length

  // Content-Fallback-Kette:
  //   1. Sanity brandContent (per Marke, editierbar im Studio)
  //   2. Medusa brand.content JSONB (Legacy, Admin-UI)
  //   3. Hardcoded BRAND_DATA Defaults
  const sc = sanityContent ?? ({} as NonNullable<typeof sanityContent>)
  const dbContent: BrandContent = (brand as any).content ?? {}
  const displayName = sc.displayName || brand.name

  const info = {
    intro:
      sc.intro ?? dbContent.intro ?? getBrandInfo(brand.name).intro,
    series:
      sc.series && sc.series.length
        ? sc.series
        : dbContent.series && dbContent.series.length
          ? dbContent.series
          : getBrandInfo(brand.name).series,
    compatibleBrands:
      sc.compatibleBrands && sc.compatibleBrands.length
        ? sc.compatibleBrands
        : dbContent.compatibleBrands && dbContent.compatibleBrands.length
          ? dbContent.compatibleBrands
          : getBrandInfo(brand.name).compatibleBrands,
  }
  const problems =
    sc.problems && sc.problems.length
      ? sc.problems
      : dbContent.problems && dbContent.problems.length
        ? dbContent.problems
        : getBrandProblems(brand.name)
  const faqs =
    sc.faqs && sc.faqs.length
      ? sc.faqs
      : dbContent.faqs && dbContent.faqs.length
        ? dbContent.faqs
        : getBrandFAQ(brand.name)
  const testimonials =
    sc.testimonials && sc.testimonials.length
      ? sc.testimonials
      : dbContent.testimonials && dbContent.testimonials.length
        ? dbContent.testimonials
        : getBrandTestimonials(brand.name)

  const heroTitle = sc.heroTitle || `${displayName} E-Bike Akku Reparatur`
  const heroSubtitle =
    sc.heroSubtitle ||
    brand.description ||
    `Professionelle Reparatur fuer alle ${displayName} E-Bike Akkus. Zellentausch, BMS-Reparatur und Diagnose mit 12 Monaten Garantie.`
  const introHeading = sc.introHeading || `Ueber ${displayName} Akkus`
  const problemeHeading =
    sc.problemeHeading || `Typische ${displayName} Akku-Probleme`
  const faqHeading =
    sc.faqHeading || `Haeufige Fragen zur ${displayName} Akku Reparatur`
  const ctaHeading = sc.ctaHeading || `${displayName} Akku pruefen lassen`
  const ctaSubheading =
    sc.ctaSubheading ||
    `Lade ein Foto hoch oder sende deinen ${displayName} Akku direkt ein. Kostenlose Diagnose, keine Vorauszahlung, 12 Monate Garantie.`

  return (
    <>
      {/* ── Hero ────────────────────────────────────── */}
      <section
        className="relative py-16 md:py-20 overflow-hidden"
        style={{
          backgroundImage: "url(/images/marken-hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="content-container relative z-10">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <LocalizedClientLink href="/" className="hover:text-white">
              Startseite
            </LocalizedClientLink>
            <span>/</span>
            <LocalizedClientLink href="/marken" className="hover:text-white">
              Marken
            </LocalizedClientLink>
            <span>/</span>
            <span className="text-white">{brand.name}</span>
          </nav>
          <div className="flex items-center gap-5">
            {brand.logo_url && (
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/20">
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {heroTitle}
                {productCount > 0 && (
                  <span className="text-white/60 font-normal"> — {productCount} Modelle</span>
                )}
              </h1>
              <p className="text-white/80 text-lg max-w-2xl">{heroSubtitle}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2 text-white/90">
              <DynamicIcon name="ShieldCheck" className="w-5 h-5 text-brand-400" />
              <span>12 Monate Garantie</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <DynamicIcon name="Truck" className="w-5 h-5 text-brand-400" />
              <span>Kostenloser Versand</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <DynamicIcon name="Clock" className="w-5 h-5 text-brand-400" />
              <span>3-5 Werktage</span>
            </div>
            {brand.country && (
              <div className="flex items-center gap-2 text-white/90">
                <DynamicIcon name="MapPin" className="w-5 h-5 text-brand-400" />
                <span>Hersteller aus {brand.country}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Brand Info / Serien ─────────────────────── */}
      <section className="content-container py-12">
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <DynamicIcon name="Info" className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-grey-90 mb-2">
                {introHeading}
              </h2>
              <p className="text-grey-70 leading-relaxed">{info.intro}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 xsmall:grid-cols-3 gap-3 mt-5">
            {info.series.map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-xl p-4 border border-brand-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  <DynamicIcon name="Battery" className="w-4 h-4 text-brand-500" />
                  <h3 className="font-semibold text-sm text-grey-90">{s.name}</h3>
                </div>
                <div className="text-lg font-bold text-brand-600">{s.capacity}</div>
                <div className="text-xs text-grey-50">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ────────────────────────────────── */}
      <section className="content-container pb-12">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-grey-90">
            Unsere Services fuer {brand.name}
          </h2>
          {services.some((s) => s.overridden) && (
            <span className="text-xs text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-3 py-1">
              Marken-spezifische Preise
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4 gap-5">
          {(() => {
            const styleByKey: Record<
              string,
              { icon: string; desc: string; color: string; iconColor: string; prefix?: string }
            > = {
              zellentausch_from: {
                icon: "Zap",
                desc: "Alle Zellen tauschen, volle Kapazitaet zurueck.",
                color: "bg-brand-50 border-brand-200 text-brand-700",
                iconColor: "text-brand-500",
                prefix: "ab ",
              },
              bms_standard: {
                icon: "Settings",
                desc: "BMS-Austausch fuer Systeme bis 60V.",
                color: "bg-blue-50 border-blue-200 text-blue-700",
                iconColor: "text-blue-500",
              },
              bms_high_voltage: {
                icon: "Settings",
                desc: "BMS-Austausch fuer Systeme ueber 60V.",
                color: "bg-blue-50 border-blue-200 text-blue-700",
                iconColor: "text-blue-500",
              },
              diagnose: {
                icon: "Search",
                desc: "Umfassende Analyse mit Messprotokoll.",
                color: "bg-amber-50 border-amber-200 text-amber-700",
                iconColor: "text-amber-500",
              },
              balancing: {
                icon: "Battery",
                desc: "Zellen kalibrieren fuer optimale Reichweite.",
                color: "bg-green-50 border-green-200 text-green-700",
                iconColor: "text-green-500",
              },
              ladebuchse: {
                icon: "Plug",
                desc: "Ladebuchse austauschen, Kontakt wiederherstellen.",
                color: "bg-purple-50 border-purple-200 text-purple-700",
                iconColor: "text-purple-500",
              },
              tiefentladung: {
                icon: "BatteryLow",
                desc: "Tiefentladenen Akku fachgerecht wiederbeleben.",
                color: "bg-orange-50 border-orange-200 text-orange-700",
                iconColor: "text-orange-500",
              },
            }

            // Nur die 4 wichtigsten Services zeigen
            const shown = services.filter((s) =>
              ["zellentausch_from", "bms_standard", "diagnose", "balancing"].includes(s.key)
            )

            // Fallback: wenn keine Services vom Backend, leeren Zustand anzeigen
            if (shown.length === 0) {
              return (
                <div className="col-span-full text-sm text-grey-50 italic">
                  Services werden aktuell nicht angezeigt.
                </div>
              )
            }

            return shown.map((service) => {
              const style = styleByKey[service.key] || {
                icon: "Wrench",
                desc: "",
                color: "bg-grey-5 border-grey-20 text-grey-70",
                iconColor: "text-grey-50",
              }
              const priceLabel =
                service.price != null
                  ? `${style.prefix ?? ""}${new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(service.price / 100)}`
                  : "Auf Anfrage"
              return (
                <div
                  key={service.key}
                  className={`p-5 rounded-xl border ${style.color} relative`}
                >
                  {service.overridden && (
                    <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide bg-brand-500 text-white rounded-full px-2 py-0.5">
                      {brand.name}
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <DynamicIcon
                      name={style.icon}
                      className={`w-6 h-6 ${style.iconColor}`}
                    />
                    <h3 className="font-semibold">{service.title}</h3>
                  </div>
                  <p className="text-sm opacity-80 mb-3">{style.desc}</p>
                  <span className="text-lg font-bold">{priceLabel}</span>
                </div>
              )
            })
          })()}
        </div>
      </section>

      {/* ── Produkte / Akkus ────────────────────────── */}
      {products.length > 0 && (
        <section className="bg-grey-5 border-t border-grey-20">
          <div className="content-container py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-grey-90">
                {brand.name} Akkus ({productsData.count})
              </h2>
              <LocalizedClientLink
                href="/store"
                className="text-brand-500 hover:text-brand-600 text-sm font-medium flex items-center gap-1"
              >
                Alle Produkte
                <DynamicIcon name="ArrowRight" className="w-4 h-4" />
              </LocalizedClientLink>
            </div>
            <div className="grid grid-cols-2 xsmall:grid-cols-3 small:grid-cols-4 gap-5">
              {products.map((product: any) => (
                <LocalizedClientLink
                  key={product.id}
                  href={`/products/${product.handle}`}
                  className="group bg-white rounded-xl border border-grey-20 overflow-hidden hover:shadow-lg hover:border-brand-300 transition-all"
                >
                  {product.thumbnail ? (
                    <div className="aspect-square bg-grey-5 flex items-center justify-center overflow-hidden">
                      <Image
                        src={product.thumbnail}
                        alt={product.title || "Produkt"}
                        width={300}
                        height={300}
                        className="object-contain p-4 group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-grey-10 flex items-center justify-center">
                      <DynamicIcon
                        name="Battery"
                        className="w-12 h-12 text-grey-30"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-grey-90 line-clamp-2 mb-1">
                      {product.title}
                    </h3>
                    {product.variants?.[0]?.calculated_price?.calculated_amount && (
                      <span className="text-sm font-bold text-brand-600">
                        ab{" "}
                        {new Intl.NumberFormat("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        }).format(
                          product.variants[0].calculated_price
                            .calculated_amount / 100
                        )}
                      </span>
                    )}
                  </div>
                </LocalizedClientLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Kompatible Fahrradmarken ───────────────── */}
      {info.compatibleBrands.length > 0 && (
        <section className="content-container py-12">
          <div className="flex items-center gap-3 mb-4">
            <DynamicIcon name="Bike" className="w-6 h-6 text-brand-500" />
            <h2 className="text-2xl font-bold text-grey-90">
              {brand.name} wird verbaut in
            </h2>
          </div>
          <p className="text-grey-50 mb-6 max-w-2xl">
            {brand.name} Antriebe und Akkus findest du in E-Bikes folgender
            Fahrradhersteller. Wir reparieren sie unabhaengig vom Rahmen-Brand.
          </p>
          <div className="flex flex-wrap gap-2">
            {info.compatibleBrands.map((b) => (
              <span
                key={b}
                className="px-4 py-2 bg-grey-5 border border-grey-20 rounded-full text-sm font-medium text-grey-70 hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                {b}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Typische Probleme ───────────────────────── */}
      <section className="content-container py-12">
        <h2 className="text-2xl font-bold text-grey-90 mb-3">
          {problemeHeading}
        </h2>
        <p className="text-grey-50 mb-8 max-w-2xl">
          Diese Probleme sehen wir haeufig bei {brand.name} E-Bike Akkus. Keine
          Sorge — die meisten lassen sich reparieren.
        </p>
        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-4">
          {problems.map((problem, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-5 rounded-xl border ${severityColors[problem.severity]}`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${severityIconBg[problem.severity]}`}
              >
                <DynamicIcon name={problem.icon} className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-1.5 ${severityBadge[problem.severity]}`}
                >
                  {problem.severity === "critical" ? "Dringend" : "Achtung"}
                </span>
                <h3 className="text-sm font-semibold text-grey-90 mb-1">
                  {problem.title}
                </h3>
                <p className="text-xs text-grey-50 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <LocalizedClientLink
            href="/ki-check"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
          >
            <DynamicIcon name="Cpu" className="w-4 h-4" />
            Kostenlosen KI-Check starten
          </LocalizedClientLink>
        </div>
      </section>

      {/* ── Reparatur-Ablauf ────────────────────────── */}
      <section className="bg-grey-90 text-white">
        <div className="content-container py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">
            So laeuft deine {brand.name} Reparatur ab
          </h2>
          <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                icon: "ClipboardList",
                title: "Service waehlen",
                desc: "Waehle Zellentausch, BMS-Reparatur oder Diagnose.",
              },
              {
                step: "2",
                icon: "Package",
                title: "Akku einsenden",
                desc: "Kostenlos & versichert an unsere Werkstatt Berlin.",
              },
              {
                step: "3",
                icon: "Wrench",
                title: "Professionelle Reparatur",
                desc: "Unsere Techniker reparieren deinen Akku fachgerecht.",
              },
              {
                step: "4",
                icon: "CheckCircle",
                title: "Akku zurueck",
                desc: "Repariert, getestet, versichert zurueckgesendet.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-500/20 flex items-center justify-center">
                  <DynamicIcon
                    name={item.icon}
                    className="w-7 h-7 text-brand-400"
                  />
                </div>
                <div className="text-xs font-bold text-brand-400 mb-1">
                  Schritt {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section className="content-container py-12">
        <h2 className="text-2xl font-bold text-grey-90 mb-8">
          {faqHeading}
        </h2>
        <div className="grid grid-cols-1 small:grid-cols-2 gap-5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-5 bg-grey-5 rounded-xl border border-grey-20"
            >
              <h3 className="font-semibold text-grey-90 mb-2 flex items-start gap-2">
                <DynamicIcon
                  name="HelpCircle"
                  className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5"
                />
                {faq.question}
              </h3>
              <p className="text-sm text-grey-50 leading-relaxed pl-7">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Kundenstimmen ───────────────────────────── */}
      <section className="bg-grey-5 border-y border-grey-20">
        <div className="content-container py-12">
          <h2 className="text-2xl font-bold text-grey-90 mb-2 text-center">
            Was Kunden ueber {brand.name} Reparaturen sagen
          </h2>
          <p className="text-grey-50 text-center mb-8">
            Echte Erfahrungen von {brand.name} E-Bike Besitzern
          </p>
          <div className="grid grid-cols-1 small:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-grey-20"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <DynamicIcon
                      key={j}
                      name="Star"
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-grey-70 leading-relaxed mb-4 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-3 border-t border-grey-10">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                    <DynamicIcon name="User" className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-grey-90">{t.name}</div>
                    <div className="text-xs text-grey-50">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-500 to-brand-700">
        <div className="content-container py-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {ctaHeading}
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            {ctaSubheading}
          </p>
          <div className="flex flex-col xsmall:flex-row justify-center gap-4">
            <LocalizedClientLink
              href="/ki-check"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-600 font-semibold rounded-xl hover:bg-grey-5 transition-colors"
            >
              <DynamicIcon name="Cpu" className="w-5 h-5" />
              KI-Check starten
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/reparatur"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/40 hover:border-white font-semibold rounded-xl transition-colors"
            >
              <DynamicIcon name="Wrench" className="w-5 h-5" />
              Reparatur beauftragen
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/40 hover:border-white font-semibold rounded-xl transition-colors"
            >
              <DynamicIcon name="Phone" className="w-5 h-5" />
              Kontakt aufnehmen
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </>
  )
}
