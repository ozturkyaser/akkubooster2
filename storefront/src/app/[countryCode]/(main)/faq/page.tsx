import { Metadata } from "next"
import { getFaqPage } from "@lib/sanity/queries"
import { draftMode } from "next/headers"

const defaultCategories = [
  {
    categoryTitle: "Allgemein",
    items: [
      { question: "Welche Akkus repariert ihr?", answer: "Wir reparieren E-Bike, E-Scooter und E-Cargo Akkus aller gaengigen Marken — Bosch, Shimano, Yamaha, Brose und viele mehr." },
      { question: "Wie lange dauert eine Reparatur?", answer: "In der Regel 3–5 Werktage nach Eingang des Akkus. Express-Service auf Anfrage moeglich." },
      { question: "Gibt es eine Garantie?", answer: "Ja, auf jede Reparatur geben wir 12 Monate Garantie." },
      { question: "Wie viel kostet eine Reparatur?", answer: "Der Zellentausch beginnt ab 299 EUR. Die genauen Kosten haengen vom Akku-Typ und Schadensumfang ab. Die Diagnose ist kostenlos." },
    ],
  },
  {
    categoryTitle: "Versand & Ablauf",
    items: [
      { question: "Wie funktioniert der Versand?", answer: "Nach der Auftragsbestaetigung erhaeltst du ein vorfrankiertes Versandlabel per E-Mail. Der Hin- und Rueckversand innerhalb Deutschlands ist kostenlos." },
      { question: "Kann ich den Akku auch vor Ort abgeben?", answer: "Ja, in unserer Werkstatt in Berlin-Pankow (Piesporterstr. 34). Bitte vorher telefonisch einen Termin vereinbaren." },
    ],
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getFaqPage(false)
  return {
    title: cms?.seo?.title || "FAQ | AkkuBooster",
    description: cms?.seo?.description || "Haeufig gestellte Fragen zur Akku-Reparatur bei AkkuBooster.",
  }
}

export default async function FAQPage() {
  const draft = await draftMode()
  const cms = await getFaqPage(draft.isEnabled)

  const categories = cms?.categories?.length ? cms.categories : defaultCategories

  return (
    <div>
      {/* Hero Header */}
      <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 py-12 small:py-16">
        <div className="content-container max-w-3xl">
          <h1 className="text-3xl small:text-4xl font-bold text-white mb-3">
            {cms?.heading || "Haeufig gestellte Fragen"}
          </h1>
          <p className="text-white/60 text-lg">
            {cms?.subheading || "Alles, was du ueber unsere Akku-Reparatur wissen musst."}
          </p>
        </div>
      </div>

      <div className="content-container py-12 max-w-3xl">
        <div className="space-y-10">
          {categories.map((cat, ci) => (
            <div key={ci}>
              <h2 className="text-xl font-semibold text-grey-90 mb-4">{cat.categoryTitle}</h2>
              <div className="space-y-4">
                {cat.items.map((item, ii) => (
                  <details key={ii} className="group bg-grey-5 rounded-xl border border-grey-20">
                    <summary className="cursor-pointer p-5 font-medium text-grey-80 flex justify-between items-center">
                      {item.question}
                      <svg className="w-5 h-5 text-grey-40 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 text-sm text-grey-60 leading-relaxed">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
