import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getErsatzakkuPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getErsatzakkuPage(false)
  return {
    title: cms?.seo?.title || "Ersatzakku kaufen | AkkuBooster",
    description: cms?.seo?.description || "Passenden Ersatzakku fuer dein E-Bike finden. Alle gaengigen Marken und Modelle.",
  }
}

export default async function ErsatzakkuPage() {
  const draft = await draftMode()
  const cms = await getErsatzakkuPage(draft.isEnabled)

  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full h-[280px] small:h-[340px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-battery.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full content-container flex flex-col justify-end pb-10">
          <h1 className="text-3xl small:text-4xl font-bold text-white mb-3">
            {cms?.heading || "Ersatzakku"}
          </h1>
          <p className="text-white/70 max-w-2xl text-lg">
            {cms?.subheading || "Wenn eine Reparatur nicht mehr lohnt, findest du hier den passenden Ersatzakku fuer dein E-Bike oder E-Scooter."}
          </p>
        </div>
      </div>

      <div className="content-container py-12">
        {cms?.advantages?.length ? (
          <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6 mb-12">
            {cms.advantages.map((a, i) => (
              <div key={i} className="p-5 bg-grey-5 rounded-xl border border-grey-20">
                {a.icon && <span className="text-2xl mb-2 block">{a.icon}</span>}
                <h3 className="font-semibold text-grey-90 mb-2">{a.title}</h3>
                <p className="text-sm text-grey-50">{a.description}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center mb-12">
          <h2 className="text-xl font-bold text-amber-800 mb-2">
            {cms?.comparisonHeading || "Reparatur vs. Neukauf?"}
          </h2>
          <p className="text-amber-700 mb-4">
            {cms?.comparisonText || "In den meisten Faellen ist eine Reparatur guenstiger und nachhaltiger. Lass uns zuerst pruefen."}
          </p>
          <LocalizedClientLink href="/vergleich" className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors inline-block">
            Vergleich ansehen
          </LocalizedClientLink>
        </div>

        <div className="bg-grey-5 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-grey-90 mb-2">Ersatzakku-Beratung</h2>
          <p className="text-grey-50 mb-6">Wir helfen dir, den passenden Ersatzakku zu finden. Starte mit deiner Marke.</p>
          <LocalizedClientLink href={cms?.ctaPrimary?.href || "/marken"} className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors inline-block">
            {cms?.ctaPrimary?.label || "Marke waehlen"}
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
