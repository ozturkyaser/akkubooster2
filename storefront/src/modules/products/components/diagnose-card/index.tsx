"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { RepairSettingsData } from "@lib/sanity/queries"

type Props = {
  product: HttpTypes.StoreProduct
  brand: string | null
  voltage: string | null
  repairSettings?: RepairSettingsData | null
}

const defaultDiagnoseLeistungen = [
  "Vollständige Spannungsprüfung aller Zellen",
  "BMS-Funktionstest (Batterie-Management-System)",
  "Lade- und Entladetest mit Messprotokoll",
  "Visuelle Inspektion auf Beschädigungen",
  "Schriftlicher Befund mit Fotos",
  "Reparatur-Empfehlung mit genauer Preisangabe",
]

export default function DiagnoseCard({ product, brand, voltage, repairSettings }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  const diagnosePreis = repairSettings?.diagnosePreis ?? 49
  const diagnoseLeistungen = repairSettings?.diagnoseLeistungen ?? defaultDiagnoseLeistungen
  const diagnoseInfo =
    repairSettings?.diagnoseInfo ??
    "Unsere Techniker analysieren Ihren Akku umfassend und erstellen einen detaillierten Befund mit Reparatur-Empfehlung."

  const handleSubmit = () => {
    // TODO: Create repair order via API
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-green-500 text-white mx-auto flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-grey-90">Diagnose-Anfrage gesendet!</h3>
        <p className="text-sm text-grey-50">
          Wir melden uns in Kürze bei Ihnen mit den Versanddetails.
          Die Diagnose kostet {diagnosePreis} € und wird bei einer Reparatur vollständig angerechnet.
        </p>
        <div className="pt-2">
          <LocalizedClientLink
            href="/kontakt"
            className="text-sm text-brand-500 font-medium hover:underline"
          >
            Fragen? Kontakt aufnehmen →
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-blue-900">Professionelle Diagnose</p>
            <p className="text-sm text-blue-700 mt-1">{diagnoseInfo}</p>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="space-y-2.5">
        <h4 className="font-semibold text-grey-90 text-sm">Diagnose beinhaltet:</h4>
        {diagnoseLeistungen.map((text, i) => (
          <DiagnoseItem key={i} text={text} />
        ))}
      </div>

      {/* Price */}
      <div className="bg-grey-5 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-grey-90 text-lg">
            {diagnosePreis.toFixed(2).replace(".", ",")} €
          </p>
          <p className="text-xs text-grey-40">
            Wird bei Reparatur angerechnet
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Kostenloser Rückversand
        </span>
      </div>

      {/* Product Info */}
      <div className="bg-grey-5 rounded-lg p-3 text-sm">
        <p className="font-medium text-grey-60 mb-1">Akku für Diagnose:</p>
        <p className="text-grey-90">
          {product.title}
          {voltage && ` • ${voltage}`}
          {brand && ` • ${brand}`}
        </p>
      </div>

      {/* Contact Form */}
      <div className="space-y-3">
        <h4 className="font-semibold text-grey-90 text-sm">Ihre Kontaktdaten:</h4>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name *"
          className="w-full px-3 py-2.5 rounded-lg border border-grey-20 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-Mail *"
          className="w-full px-3 py-2.5 rounded-lg border border-grey-20 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefon (optional)"
          className="w-full px-3 py-2.5 rounded-lg border border-grey-20 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Kurze Problembeschreibung (optional)"
          className="w-full px-3 py-2.5 rounded-lg border border-grey-20 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!name || !email}
        className="w-full py-3.5 bg-grey-90 text-white rounded-lg font-semibold hover:bg-grey-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Diagnose für {diagnosePreis} € beauftragen
      </button>

      <p className="text-xs text-grey-40 text-center">
        Nach Eingang Ihres Akkus erhalten Sie den Befund innerhalb von 2–3 Werktagen.
      </p>
    </div>
  )
}

function DiagnoseItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm text-grey-60">{text}</span>
    </div>
  )
}
