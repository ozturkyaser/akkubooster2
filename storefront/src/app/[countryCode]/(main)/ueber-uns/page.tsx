import { Metadata } from "next"
import { getUeberUnsPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const defaultStats = [
  { value: "2.500+", label: "Akkus repariert" },
  { value: "98%", label: "Zufriedenheit" },
  { value: "25+", label: "Marken" },
  { value: "2020", label: "Gegruendet" },
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getUeberUnsPage(false)
  return {
    title: cms?.seo?.title || "Ueber uns | AkkuBooster",
    description: cms?.seo?.description || "AkkuBooster — Berliner Werkstatt fuer E-Bike Akku Reparatur. Unsere Mission: Reparieren statt wegwerfen.",
  }
}

export default async function UeberUnsPage() {
  const draft = await draftMode()
  const cms = await getUeberUnsPage(draft.isEnabled)

  const stats = cms?.stats?.length ? cms.stats : defaultStats

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundImage: 'url(/images/about-hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="content-container relative z-10">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <LocalizedClientLink href="/" className="hover:text-white">Startseite</LocalizedClientLink>
            <span>/</span>
            <span className="text-white">Ueber uns</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {cms?.heading || "Ueber AkkuBooster"}
          </h1>
          <p className="text-white/80 max-w-2xl text-lg">
            {cms?.subheading || "Berliner Werkstatt fuer E-Bike Akku Reparatur. Unsere Mission: Reparieren statt wegwerfen."}
          </p>
        </div>
      </section>

      <div className="content-container py-12 max-w-3xl">
      <div className="prose prose-grey max-w-none space-y-6 text-grey-60">
        <p className="text-lg">
          {cms?.introText || "AkkuBooster ist eine Berliner Werkstatt, spezialisiert auf die Reparatur von E-Bike, E-Scooter und E-Cargo Akkus. Unser Ziel: Reparieren statt wegwerfen."}
        </p>

        <h2 className="text-xl font-semibold text-grey-90 mt-8">
          {cms?.missionHeading || "Unsere Mission"}
        </h2>
        <p>
          {cms?.missionText || "Jeder Akku, den wir reparieren, ist einer weniger auf dem Muell. Wir glauben daran, dass Nachhaltigkeit und Qualitaet zusammengehoeren. Deshalb geben wir auf jede Reparatur 12 Monate Garantie."}
        </p>

        <h2 className="text-xl font-semibold text-grey-90 mt-8">Zahlen &amp; Fakten</h2>
        <div className="grid grid-cols-2 xsmall:grid-cols-4 gap-4 not-prose">
          {stats.map((s, i) => (
            <div key={i} className="text-center p-4 bg-brand-50 rounded-xl">
              <div className="text-2xl font-bold text-brand-600">{s.value}</div>
              <div className="text-xs text-brand-500">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-grey-90 mt-8">
          {cms?.standortHeading || "Standort"}
        </h2>
        <p>
          {cms?.standortText || "Unsere Werkstatt befindet sich in Berlin-Pankow. Akkus koennen per Post eingesendet oder direkt vor Ort abgegeben werden. Wir versenden in ganz Deutschland, Oesterreich und die Schweiz."}
        </p>
      </div>
    </div>
    </>
  )
}
