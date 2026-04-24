"use client"

import { useState } from "react"
import SectionBackground from "@modules/common/components/section-background"
import { HomePageData } from "@lib/sanity/queries"

const defaultFaqs = [
  { question: "Was kostet eine Akku-Reparatur?", answer: "Die Kosten haengen vom Akku-Typ und dem Schadensumfang ab. Ein Zellentausch startet ab 299 EUR. Nach der kostenlosen Diagnose erhaeltst du ein transparentes Angebot — ohne versteckte Kosten." },
  { question: "Wie laeuft der Reparatur-Prozess ab?", answer: "1) Sende deinen Akku mit dem kostenlosen Versandlabel ein. 2) Wir diagnostizieren innerhalb von 24h. 3) Du erhaeltst ein Angebot. 4) Nach deiner Freigabe reparieren wir und senden zurueck." },
  { question: "Welche Marken repariert ihr?", answer: "Wir reparieren Akkus von ueber 25 Herstellern, darunter Bosch, Shimano, Yamaha, Brose, BMZ, Samsung SDI, BionX, und viele mehr. Nutze unseren KI-Check oder die Marken-Seite fuer Details." },
  { question: "Reparatur oder Neukauf — was lohnt sich?", answer: "In den meisten Faellen ist eine Reparatur deutlich guenstiger als ein Neukauf (bis zu 60% Ersparnis) und nachhaltiger. Unsere Diagnose zeigt dir, ob eine Reparatur sinnvoll ist." },
  { question: "Ist der Rueckversand kostenlos?", answer: "Ja, innerhalb Deutschlands ist sowohl der Hin- als auch der Rueckversand kostenlos. Fuer Oesterreich und die Schweiz berechnen wir eine Versandpauschale." },
  { question: "Was ist der KI-Check?", answer: "Unser KI-Check analysiert Fotos deines Akkus und erkennt automatisch Marke, Modell und sichtbare Schaeden. Du erhaeltst in 60 Sekunden eine erste Einschaetzung — kostenlos und unverbindlich." },
]

const FAQSection = ({ cms }: { cms?: HomePageData | null }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqs = cms?.faqs?.length ? cms.faqs : defaultFaqs

  return (
    <section className="relative bg-white overflow-hidden">
      <SectionBackground media={cms?.faqBg} />
      <div className="content-container relative z-10 py-16 small:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl small:text-3xl font-bold text-grey-90 mb-4">
            {cms?.faqHeading || "Haeufig gestellte Fragen"}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-grey-20 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-grey-5 transition-colors"
              >
                <span className="font-semibold text-grey-90 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-grey-40 flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-grey-50 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQSection
