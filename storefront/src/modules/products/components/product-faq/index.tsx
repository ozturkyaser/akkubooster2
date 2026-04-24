"use client"

import { useState } from "react"
import { RepairFaqItem } from "@lib/sanity/queries"

type Props = {
  brand?: string | null
  voltage?: string | null
  faqItems?: RepairFaqItem[]
}

const defaultFaqs: RepairFaqItem[] = [
  {
    question: "Lohnt sich eine Reparatur im Vergleich zum Neukauf?",
    answer: "In den meisten Fällen ja! Ein Zellentausch kostet in der Regel 30–60 % weniger als ein neuer Originalakku. Dazu kommt: Ihr Gehäuse bleibt erhalten, alles passt perfekt und Sie schonen die Umwelt.",
  },
  {
    question: "Wie lange dauert die Reparatur?",
    answer: "In der Regel 3–5 Werktage nach Eingang Ihres Akkus in unserer Werkstatt. Inklusive umfassender Tests und Qualitätskontrolle. Der Rückversand ist versichert und kostenlos.",
  },
  {
    question: "Welche Garantie erhalte ich?",
    answer: "Sie erhalten 12 Monate Garantie auf alle von uns verbauten Zellen und die durchgeführte Arbeit. Sollte in dieser Zeit ein Problem auftreten, reparieren wir kostenlos nach.",
  },
  {
    question: "Kann ich die Reparatur selbst durchführen?",
    answer: "Davon raten wir dringend ab. E-Bike Akkus arbeiten mit hohen Spannungen und Strömen. Ein unsachgemäßer Zellentausch kann zu Kurzschlüssen, Bränden oder Verletzungen führen. Überlassen Sie das den Profis!",
  },
  {
    question: "Was passiert, wenn mein Akku nicht reparierbar ist?",
    answer: "Wir prüfen jeden Akku sorgfältig. Sollte eine Reparatur nicht möglich sein (z.B. bei schweren Gehäuseschäden), informieren wir Sie und senden den Akku kostenlos zurück. Kosten entstehen nur bei erfolgreicher Reparatur.",
  },
  {
    question: "Welche Zellen werden verwendet?",
    answer: "Wir verwenden ausschließlich hochwertige Markenzellen von Samsung, LG oder Panasonic. Diese Zellen bieten höchste Zyklenfestigkeit, maximale Kapazität und optimale Sicherheit.",
  },
]

export default function ProductFaq({ brand, voltage, faqItems }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  const faqs = faqItems && faqItems.length > 0 ? faqItems : defaultFaqs

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i
        // Personalize answer with brand if available
        let answer = faq.answer
        if (brand) {
          answer = answer.replace("Ihres Akkus", `Ihres ${brand} Akkus`)
        }

        return (
          <div
            key={i}
            className="bg-white rounded-xl border border-grey-20 overflow-hidden"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex items-center justify-between w-full px-5 py-4 text-left"
            >
              <span className="font-medium text-grey-90 pr-4">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-grey-40 flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-4">
                <p className="text-grey-50 text-[15px] leading-relaxed">
                  {answer}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
