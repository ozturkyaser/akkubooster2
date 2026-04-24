import { Metadata } from "next"
import { getB2bPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const defaultBenefits = [
  { title: "Mengenrabatte", description: "Attraktive Staffelpreise ab 10 Akkus pro Auftrag." },
  { title: "Rechnungskauf", description: "Bezahlung auf Rechnung mit 30 Tagen Zahlungsziel." },
  { title: "Fester Ansprechpartner", description: "Dedizierter Account Manager fuer eure Anliegen." },
  { title: "Express-Service", description: "Bevorzugte Bearbeitung mit verquerzter Bearbeitungszeit." },
  { title: "Abholservice", description: "Wir holen groessere Mengen direkt bei euch ab." },
  { title: "Reporting", description: "Monatliche Berichte ueber Reparaturen und Kosten." },
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getB2bPage(false)
  return {
    title: cms?.seo?.title || "B2B / Geschaeftskunden | AkkuBooster",
    description: cms?.seo?.description || "Mengenrabatte ab 10 Stueck, Rechnungskauf, dedizierter Ansprechpartner fuer Haendler und Flottenbetreiber.",
  }
}

export default async function B2BPage() {
  const draft = await draftMode()
  const cms = await getB2bPage(draft.isEnabled)

  const benefits = cms?.benefits?.length ? cms.benefits : defaultBenefits

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundImage: 'url(/images/b2b-hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="content-container relative z-10">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <LocalizedClientLink href="/" className="hover:text-white">Startseite</LocalizedClientLink>
            <span>/</span>
            <span className="text-white">B2B</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {cms?.heading || "B2B / Geschaeftskunden"}
          </h1>
          <p className="text-white/80 max-w-2xl text-lg">
            {cms?.subheading || "Fuer Fahrradhaendler, Flottenbetreiber und Unternehmen mit mehreren E-Bikes. Mengenrabatte, Rechnungskauf und persoenlicher Service."}
          </p>
        </div>
      </section>

      <div className="content-container py-12">
      <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6 mb-12">
        {benefits.map((b, i) => (
          <div key={i} className="p-5 bg-grey-5 rounded-xl border border-grey-20">
            <h3 className="font-semibold text-grey-90 mb-2">{b.title}</h3>
            <p className="text-sm text-grey-50">{b.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-accent-500 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">
          {cms?.ctaHeading || "B2B-Anfrage stellen"}
        </h2>
        <p className="text-white/80 mb-6">
          {cms?.ctaText || "Kontaktiere uns fuer ein individuelles Angebot."}
        </p>
        <a href={`mailto:${cms?.contactEmail || "b2b@akkubooster.de"}`} className="px-6 py-3 bg-white text-accent-500 font-semibold rounded-xl hover:bg-grey-5 transition-colors inline-block">
          {cms?.contactEmail || "b2b@akkubooster.de"}
        </a>
      </div>
    </div>
    </>
  )
}
