import { Metadata } from "next"
import { getSymptom } from "@lib/data/akkubooster"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = { params: Promise<{ handle: string; countryCode: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
  try {
    const { symptom } = await getSymptom(handle)
    return {
      title: `${symptom.title} — Akku Reparatur | AkkuBooster`,
      description: symptom.short_description || `${symptom.title} — wir helfen dir weiter.`,
    }
  } catch {
    return { title: "Symptom nicht gefunden | AkkuBooster" }
  }
}

const actionLabels: Record<string, { label: string; color: string }> = {
  repair: { label: "Reparatur empfohlen", color: "bg-brand-50 text-brand-700 border-brand-200" },
  replace: { label: "Ersatz empfohlen", color: "bg-amber-50 text-amber-700 border-amber-200" },
  diagnosis: { label: "Diagnose empfohlen", color: "bg-blue-50 text-blue-700 border-blue-200" },
  contact: { label: "Kontakt empfohlen", color: "bg-red-50 text-red-700 border-red-200" },
}

export default async function SymptomDetailPage(props: Props) {
  const { handle } = await props.params

  let symptom
  try {
    const data = await getSymptom(handle)
    symptom = data.symptom
  } catch {
    notFound()
  }

  const action = actionLabels[symptom.recommended_action] || actionLabels.diagnosis

  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full h-[260px] small:h-[320px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/diagnose.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full content-container flex flex-col justify-end pb-10">
          <nav className="text-sm text-white/60 mb-4">
            <LocalizedClientLink href="/" className="hover:text-white transition-colors">Start</LocalizedClientLink>
            <span className="mx-2">/</span>
            <LocalizedClientLink href="/symptome" className="hover:text-white transition-colors">Symptome</LocalizedClientLink>
            <span className="mx-2">/</span>
            <span className="text-white">{symptom.title}</span>
          </nav>
          <h1 className="text-3xl small:text-4xl font-bold text-white mb-2">{symptom.title}</h1>
          {symptom.short_description && (
            <p className="text-lg text-white/70">{symptom.short_description}</p>
          )}
        </div>
      </div>

      <div className="content-container py-12 max-w-3xl">
        {/* Empfehlung */}
        <div className={`p-5 rounded-xl border mb-8 ${action.color}`}>
          <div className="font-semibold text-lg mb-1">{action.label}</div>
          <p className="text-sm opacity-80">
            {symptom.recommended_action === "repair" && "In den meisten Faellen kann dieses Problem durch einen Zellentausch behoben werden."}
            {symptom.recommended_action === "replace" && "Bei diesem Problem ist ein Ersatzakku oft die bessere Loesung."}
            {symptom.recommended_action === "diagnosis" && "Wir empfehlen eine professionelle Diagnose, um den Fehler genau zu bestimmen."}
            {symptom.recommended_action === "contact" && "Bei diesem Problem solltest du uns umgehend kontaktieren — Sicherheit geht vor."}
          </p>
        </div>

        {/* Moegliche Ursachen */}
        {symptom.probable_causes && symptom.probable_causes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-grey-90 mb-4">Moegliche Ursachen</h2>
            <ul className="space-y-2">
              {symptom.probable_causes.map((cause: string, i: number) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-grey-5 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-grey-20 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-grey-60">
                    {i + 1}
                  </span>
                  <span className="text-grey-70">{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-3">Jetzt Akku pruefen lassen</h2>
          <p className="text-white/80 mb-6">Kostenlose Diagnose innerhalb 24h. Ab 299 EUR Reparatur.</p>
          <div className="flex flex-col xsmall:flex-row justify-center gap-4">
            <LocalizedClientLink href="/ki-check" className="px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-grey-5 transition-colors">
              KI-Check starten
            </LocalizedClientLink>
            <LocalizedClientLink href="/marken" className="px-6 py-3 border-2 border-white/40 hover:border-white font-semibold rounded-xl transition-colors">
              Marke waehlen
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
