import { Metadata } from "next"
import { getKontaktPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const defaultOpeningHours = [
  { day: "Montag - Freitag", time: "9:00 - 18:00" },
  { day: "Samstag", time: "10:00 - 14:00" },
  { day: "Sonntag", time: "Geschlossen" },
]

const defaultQuickHelp = [
  { emoji: "📸", title: "KI-Check", description: "Foto hochladen, Ergebnis in 60s", href: "/ki-check" },
  { emoji: "🔍", title: "Symptom-Navigator", description: "Problem beschreiben, Loesung finden", href: "/symptome" },
  { emoji: "🏭", title: "Marke waehlen", description: "Direkt zur Reparatur", href: "/marken" },
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getKontaktPage(false)
  return {
    title: cms?.seo?.title || "Kontakt | AkkuBooster",
    description: cms?.seo?.description || "Kontaktiere AkkuBooster — E-Bike Akku Reparatur in Berlin. Telefon, E-Mail oder Kontaktformular.",
  }
}

export default async function KontaktPage() {
  const draft = await draftMode()
  const cms = await getKontaktPage(draft.isEnabled)

  const phone = cms?.phone || "+49 30 12345678"
  const email = cms?.email || "info@akkubooster.de"
  const address = cms?.address || "Piesporterstr. 34\n13088 Berlin"
  const openingHours = cms?.openingHours?.length ? cms.openingHours : defaultOpeningHours
  const noteText = cms?.noteText || "Akku-Abgabe vor Ort moeglich — bitte vorher Termin vereinbaren."
  const quickHelp = cms?.quickHelp?.length ? cms.quickHelp : defaultQuickHelp

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundImage: 'url(/images/kontakt-hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="content-container relative z-10">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <LocalizedClientLink href="/" className="hover:text-white">Startseite</LocalizedClientLink>
            <span>/</span>
            <span className="text-white">Kontakt</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {cms?.heading || "Kontakt"}
          </h1>
          <p className="text-white/80 max-w-2xl text-lg">
            {cms?.subheading || "Fragen zu deinem Akku? Wir helfen dir gerne weiter."}
          </p>
        </div>
      </section>

      <div className="content-container py-12 max-w-4xl">
      <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-6 mb-12">
        {/* Kontaktdaten */}
        <div className="p-6 bg-grey-5 rounded-xl border border-grey-20">
          <h2 className="text-lg font-semibold text-grey-90 mb-4">Kontaktdaten</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-grey-70">Telefon</div>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-brand-500 hover:underline">{phone}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-grey-70">E-Mail</div>
                <a href={`mailto:${email}`} className="text-brand-500 hover:underline">{email}</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-grey-70">Werkstatt</div>
                <p className="text-grey-60 text-sm whitespace-pre-line">{address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Oeffnungszeiten */}
        <div className="p-6 bg-grey-5 rounded-xl border border-grey-20">
          <h2 className="text-lg font-semibold text-grey-90 mb-4">Erreichbarkeit</h2>
          <div className="space-y-2 text-sm">
            {openingHours.map((oh, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-grey-60">{oh.day}</span>
                <span className={`font-medium ${oh.time === "Geschlossen" ? "text-grey-40" : "text-grey-80"}`}>{oh.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 bg-brand-50 rounded-lg">
            <p className="text-sm text-brand-600">{noteText}</p>
          </div>
        </div>
      </div>

      {/* Schnellhilfe */}
      <div className="bg-grey-5 rounded-2xl p-8 border border-grey-20">
        <h2 className="text-lg font-semibold text-grey-90 mb-4 text-center">Schneller geht es so</h2>
        <div className="grid grid-cols-1 xsmall:grid-cols-3 gap-4 text-center">
          {quickHelp.map((item, i) => (
            <a key={i} href={`/de${item.href}`} className="p-4 bg-white rounded-xl border border-grey-20 hover:border-brand-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">{item.emoji}</div>
              <div className="text-sm font-semibold text-grey-80">{item.title}</div>
              <div className="text-xs text-grey-40">{item.description}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}
