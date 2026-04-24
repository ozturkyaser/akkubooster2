import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getReparaturPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"

const defaultServices = [
  { title: "Zellentausch", price: "ab 299 EUR", description: "Defekte Zellen werden durch hochwertige Markenzellen ersetzt. Volle Kapazitaet zurueck.", highlight: true },
  { title: "Akku-Diagnose", price: "Kostenlos", description: "4D-Diagnose: Spannung, Kapazitaet, Innenwiderstand und BMS-Analyse." },
  { title: "Balancing", price: "ab 99 EUR", description: "Zellen kalibrieren fuer optimale Reichweite und Lebensdauer." },
  { title: "Kapazitaets-Boost", price: "ab 449 EUR", description: "Mehr Reichweite: Upgrade auf Zellen mit hoeherer Kapazitaet." },
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getReparaturPage(false)
  return {
    title: cms?.seo?.title || "Akku Reparatur | AkkuBooster",
    description: cms?.seo?.description || "E-Bike Akku reparieren lassen. Zellentausch ab 299 EUR. Kostenlose Diagnose. 12 Monate Garantie.",
  }
}

export default async function ReparaturPage() {
  const draft = await draftMode()
  const cms = await getReparaturPage(draft.isEnabled)

  const services = cms?.services?.length ? cms.services : defaultServices

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundImage: 'url(/images/reparatur-hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="content-container relative z-10">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <LocalizedClientLink href="/" className="hover:text-white">Startseite</LocalizedClientLink>
            <span>/</span>
            <span className="text-white">Reparatur</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {cms?.heading || "Akku Reparatur"}
          </h1>
          <p className="text-white/80 max-w-2xl text-lg">
            {cms?.subheading || "Wir reparieren E-Bike, E-Scooter und E-Cargo Akkus aller gaengigen Marken. Kostenlose Diagnose, transparente Preise, 12 Monate Garantie."}
          </p>
        </div>
      </section>

      <div className="content-container py-12">
      <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-6 mb-12">
        {services.map((s, i) => (
          <div key={i} className={`p-6 rounded-xl border ${s.highlight ? "bg-brand-50 border-brand-200" : "bg-white border-grey-20"}`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-grey-90">{s.title}</h3>
              <span className={`text-lg font-bold ${s.highlight ? "text-brand-600" : "text-grey-70"}`}>{s.price}</span>
            </div>
            <p className="text-sm text-grey-50">{s.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">
          {cms?.ctaHeading || "Jetzt Reparatur starten"}
        </h2>
        <p className="text-white/80 mb-6">
          {cms?.ctaText || "Kostenlose Diagnose innerhalb 24h. Bezahlung erst nach erfolgreicher Reparatur."}
        </p>
        <div className="flex flex-col xsmall:flex-row justify-center gap-4">
          <LocalizedClientLink href={cms?.ctaPrimary?.href || "/ki-check"} className="px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-grey-5 transition-colors">
            {cms?.ctaPrimary?.label || "KI-Check starten"}
          </LocalizedClientLink>
          <LocalizedClientLink href="/marken" className="px-6 py-3 border-2 border-white/40 hover:border-white font-semibold rounded-xl transition-colors">
            Marke waehlen
          </LocalizedClientLink>
        </div>
      </div>
    </div>
    </>
  )
}
