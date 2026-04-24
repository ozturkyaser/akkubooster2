import { Metadata } from "next"
import { getWerkstattPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getWerkstattPage(false)
  return {
    title: cms?.seo?.title || "Werkstatt Berlin | AkkuBooster",
    description: cms?.seo?.description || "AkkuBooster Werkstatt in Berlin-Pankow. Piesporterstr. 34, 13088 Berlin. Akku Reparatur vor Ort.",
  }
}

export default async function WerkstattBerlinPage() {
  const draft = await draftMode()
  const cms = await getWerkstattPage(draft.isEnabled)

  const address = cms?.address || "AkkuBooster\nPiesporterstr. 34\n13088 Berlin"
  const phone = cms?.phone || "+49 30 12345678"
  const email = cms?.email || "info@akkubooster.de"
  const openingHours = cms?.openingHours?.length ? cms.openingHours : []
  const features = cms?.features?.length ? cms.features : []

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundImage: 'url(/images/werkstatt.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="content-container relative z-10">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <LocalizedClientLink href="/" className="hover:text-white">Startseite</LocalizedClientLink>
            <span>/</span>
            <span className="text-white">Werkstatt Berlin</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {cms?.heading || "Werkstatt Berlin"}
          </h1>
          <p className="text-white/80 max-w-2xl text-lg">
            {cms?.subheading || "Unsere Werkstatt in Berlin-Pankow — hier reparieren wir deinen Akku."}
          </p>
        </div>
      </section>

      <div className="content-container py-12 max-w-3xl">
      <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-grey-5 rounded-xl border border-grey-20">
          <h3 className="font-semibold text-grey-90 mb-3">Adresse</h3>
          <p className="text-grey-60 whitespace-pre-line">{address}</p>
          {openingHours.length > 0 && (
            <div className="mt-4 space-y-1 text-sm">
              <h4 className="font-medium text-grey-70 mb-2">Oeffnungszeiten</h4>
              {openingHours.map((oh, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-grey-60">{oh.day}</span>
                  <span className="text-grey-80">{oh.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 bg-grey-5 rounded-xl border border-grey-20">
          <h3 className="font-semibold text-grey-90 mb-3">Kontakt</h3>
          <p className="text-grey-60">Tel: {phone}<br />E-Mail: {email}</p>
        </div>
      </div>

      {features.length > 0 && (
        <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-4 mb-8">
          {features.map((f, i) => (
            <div key={i} className="p-4 bg-grey-5 rounded-xl border border-grey-20">
              <h3 className="font-semibold text-grey-90 mb-1">{f.title}</h3>
              <p className="text-sm text-grey-50">{f.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="p-6 bg-brand-50 rounded-xl border border-brand-200">
        <h3 className="font-semibold text-brand-700 mb-2">Vor-Ort Abgabe</h3>
        <p className="text-sm text-brand-600">Du kannst deinen Akku auch direkt in unserer Werkstatt abgeben und abholen. Bitte vorher telefonisch einen Termin vereinbaren.</p>
      </div>
    </div>
    </>
  )
}
