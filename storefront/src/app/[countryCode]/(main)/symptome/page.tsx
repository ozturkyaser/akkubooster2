import { Metadata } from "next"
import { listSymptoms, Symptom } from "@lib/data/akkubooster"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Symptom-Navigator | AkkuBooster",
  description: "Was hat dein Akku? Finde dein Symptom und erhalte eine Empfehlung zur Reparatur.",
}

const severityConfig = {
  critical: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-600", label: "Dringend" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-600", label: "Achtung" },
  info: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-600", label: "Info" },
}

export default async function SymptomePage() {
  let symptoms: Symptom[] = []
  try {
    const data = await listSymptoms()
    symptoms = data.symptoms
  } catch (e) {
    console.error("Failed to load symptoms:", e)
  }

  const critical = symptoms.filter((s) => s.severity === "critical")
  const warning = symptoms.filter((s) => s.severity === "warning")
  const info = symptoms.filter((s) => s.severity === "info")

  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full h-[280px] small:h-[340px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/diagnose.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full content-container flex flex-col justify-end pb-10">
          <nav className="text-sm text-white/60 mb-4">
            <LocalizedClientLink href="/" className="hover:text-white transition-colors">Start</LocalizedClientLink>
            <span className="mx-2">/</span>
            <span className="text-white">Symptom-Navigator</span>
          </nav>
          <h1 className="text-3xl small:text-4xl font-bold text-white mb-2">Symptom-Navigator</h1>
          <p className="text-white/70 max-w-2xl">
            Was hat dein Akku? Waehle dein Symptom und wir zeigen dir die beste Loesung.
          </p>
        </div>
      </div>

      <div className="content-container py-12">
        {/* Critical */}
        {critical.length > 0 && (
          <Section title="Dringende Probleme" symptoms={critical} />
        )}

        {/* Warning */}
        {warning.length > 0 && (
          <Section title="Haeufige Probleme" symptoms={warning} />
        )}

        {/* Info */}
        {info.length > 0 && (
          <Section title="Sonstige Hinweise" symptoms={info} />
        )}

        {/* CTA */}
        <div className="mt-12 p-8 bg-grey-5 rounded-2xl border border-grey-20 text-center">
          <h2 className="text-xl font-bold text-grey-90 mb-2">Dein Problem nicht dabei?</h2>
          <p className="text-grey-50 mb-6">Lade ein Foto hoch oder kontaktiere uns direkt.</p>
          <div className="flex flex-col xsmall:flex-row justify-center gap-4">
            <LocalizedClientLink href="/ki-check" className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors">
              KI-Check starten
            </LocalizedClientLink>
            <LocalizedClientLink href="/kontakt" className="px-6 py-3 border border-grey-30 text-grey-70 font-semibold rounded-xl hover:border-grey-50 transition-colors">
              Kontakt
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, symptoms }: { title: string; symptoms: Symptom[] }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-grey-70 mb-4">{title}</h2>
      <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-4">
        {symptoms.map((symptom) => {
          const config = severityConfig[symptom.severity]
          return (
            <LocalizedClientLink
              key={symptom.id}
              href={`/symptome/${symptom.handle}`}
              className={`flex flex-col p-5 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${config.bg} ${config.border}`}
            >
              <span className={`self-start px-2 py-0.5 text-xs font-medium rounded-full mb-3 ${config.badge}`}>
                {config.label}
              </span>
              <h3 className="text-base font-semibold text-grey-90 mb-1">{symptom.title}</h3>
              {symptom.short_description && (
                <p className="text-sm text-grey-50 leading-relaxed">{symptom.short_description}</p>
              )}
            </LocalizedClientLink>
          )
        })}
      </div>
    </div>
  )
}
