import { Metadata } from "next"
import KiCheckForm from "@modules/diagnosis/components/ki-check-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getKiCheckPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"

const defaultSteps = [
  { number: "1", title: "Foto aufnehmen", description: "Mach ein Foto von deinem Akku (Typenschild sichtbar)" },
  { number: "2", title: "KI analysiert", description: "Marke, Modell und Schaeden werden in 60s erkannt" },
  { number: "3", title: "Ergebnis erhalten", description: "Empfehlung + Preis — unverbindlich und kostenlos" },
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getKiCheckPage(false)
  return {
    title: cms?.seo?.title || "Kostenloser KI-Check | AkkuBooster",
    description: cms?.seo?.description || "Lade ein Foto deines Akkus hoch. Unsere KI erkennt Marke, Modell und Schaeden in 60 Sekunden.",
  }
}

export default async function KiCheckPage() {
  const draft = await draftMode()
  const cms = await getKiCheckPage(draft.isEnabled)

  const steps = cms?.steps?.length ? cms.steps : defaultSteps

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundImage: 'url(/images/ki-check-hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="content-container relative z-10">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <LocalizedClientLink href="/" className="hover:text-white">Startseite</LocalizedClientLink>
            <span>/</span>
            <span className="text-white">KI-Check</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {cms?.heading || "Kostenloser KI-Check"}
          </h1>
          <p className="text-white/80 max-w-2xl text-lg">
            {cms?.subheading || "Lade ein Foto deines Akkus hoch — unsere KI erkennt automatisch Marke, Modell und sichtbare Schaeden."}
          </p>
        </div>
      </section>

      <div className="content-container py-12 max-w-3xl mx-auto">
      {/* Interaktives Upload-Formular */}
      <KiCheckForm />

      {/* Schritte */}
      <div className="grid grid-cols-1 xsmall:grid-cols-3 gap-6 mt-12 mb-8">
        {steps.map((step, i) => (
          <div key={i} className="text-center p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
              {step.number}
            </div>
            <h4 className="font-semibold text-grey-80 text-sm">{step.title}</h4>
            <p className="text-xs text-grey-40">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-grey-40">
          {cms?.alternativeText || "Alternativ:"}{" "}
          <LocalizedClientLink
            href="/marken"
            className="text-brand-500 hover:underline"
          >
            Marke direkt waehlen
          </LocalizedClientLink>{" "}
          oder{" "}
          <LocalizedClientLink
            href="/symptome"
            className="text-brand-500 hover:underline"
          >
            Symptom beschreiben
          </LocalizedClientLink>
        </p>
      </div>
    </div>
    </>
  )
}
