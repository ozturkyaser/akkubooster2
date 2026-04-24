"use client"

import { useState, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import {
  RepairSettingsData,
  RepairGehauseOption,
  RepairProblemOption,
  RepairDauerOption,
  RepairPreisregel,
} from "@lib/sanity/queries"

type Props = {
  product: HttpTypes.StoreProduct
  brand: string | null
  voltage: string | null
  repairSettings?: RepairSettingsData | null
}

/* ── Fallback defaults (used when CMS data not yet populated) ── */

const defaultGehauseOptions: RepairGehauseOption[] = [
  {
    id: "ok",
    label: "Nein, Gehäuse ist in Ordnung",
    description: "Keine sichtbaren Risse, Dellen oder Verformungen",
    severity: "ok",
  },
  {
    id: "kratzer",
    label: "Leichte Kratzer / Gebrauchsspuren",
    description: "Optische Mängel, aber Gehäuse intakt",
    severity: "warn",
  },
  {
    id: "gerissen",
    label: "Ja, Gehäuse ist gerissen / verformt",
    description: "Sichtbare Risse, Dellen, Gehäuse steht ab",
    severity: "danger",
    warningText:
      "Bei einem beschädigten Gehäuse können zusätzliche Kosten für ein Ersatzgehäuse anfallen (falls verfügbar).",
  },
  {
    id: "aufgeblaht",
    label: "Ja, Gehäuse ist aufgebläht",
    description: "Akku ist sichtbar dicker geworden",
    severity: "critical",
    warningText:
      "Ein aufgeblähter Akku ist ein Sicherheitsrisiko. Bitte laden Sie den Akku nicht weiter und bewahren Sie ihn an einem kühlen, trockenen Ort auf. Wir empfehlen einen Zellentausch.",
  },
]

const defaultProblemeOptions: RepairProblemOption[] = [
  { id: "laedt_nicht", label: "Akku lädt nicht mehr" },
  { id: "reichweite", label: "Reichweite stark reduziert" },
  { id: "abschalten", label: "Akku schaltet sich plötzlich ab" },
  { id: "fehlermeldung", label: "Fehlermeldung am Display" },
  { id: "nicht_erkannt", label: "Akku wird vom E-Bike nicht erkannt" },
  { id: "led_blinkt", label: "LED blinkt rot / ungewöhnlich" },
  { id: "heiss", label: "Akku wird sehr heiß" },
  { id: "laden_bricht_ab", label: "Ladevorgang bricht ab" },
  { id: "sonstiges", label: "Sonstiges" },
]

const defaultDauerOptions: RepairDauerOption[] = [
  { id: "tage", label: "Seit ein paar Tagen" },
  { id: "wochen", label: "Seit ein paar Wochen" },
  { id: "monate", label: "Seit ein paar Monaten" },
  {
    id: "schleichend",
    label: "Schleichend über längere Zeit",
    hinweis:
      "Schleichende Probleme deuten oft auf natürliche Zellalterung hin. Ein Zellentausch könnte langfristig sinnvoller sein als eine Reparatur.",
  },
  {
    id: "ereignis",
    label: "Nach einem bestimmten Ereignis (Sturz, Wasserschaden, etc.)",
    hinweis:
      "Bei Sturzschäden oder Wasserschäden ist eine genaue Diagnose besonders wichtig. Unsere Techniker prüfen alle Komponenten sorgfältig.",
  },
]

const defaultPreisregeln: RepairPreisregel[] = [
  { problemId: "laedt_nicht", label: "Lade-Problem", minPreis: 80, maxPreis: 150, minPreisUeber60V: 120, maxPreisUeber60V: 200 },
  { problemId: "laden_bricht_ab", label: "Lade-Problem", minPreis: 80, maxPreis: 150, minPreisUeber60V: 120, maxPreisUeber60V: 200 },
  { problemId: "reichweite", label: "Kapazitätsverlust → Zellentausch empfohlen", minPreis: 200, maxPreis: 450 },
  { problemId: "abschalten", label: "BMS / Ausbalancierung", minPreis: 120, maxPreis: 150, minPreisUeber60V: 150, maxPreisUeber60V: 200 },
  { problemId: "fehlermeldung", label: "Elektronik-Fehler", minPreis: 120, maxPreis: 120, minPreisUeber60V: 150, maxPreisUeber60V: 200 },
  { problemId: "led_blinkt", label: "Elektronik-Fehler", minPreis: 120, maxPreis: 120, minPreisUeber60V: 150, maxPreisUeber60V: 200 },
  { problemId: "nicht_erkannt", label: "Kommunikations-/BMS-Problem", minPreis: 120, maxPreis: 150 },
  { problemId: "heiss", label: "Überhitzung (Sicherheitscheck + Reparatur)", minPreis: 150, maxPreis: 300 },
  { problemId: "sonstiges", label: "Diagnose-Pauschale (wird bei Reparatur angerechnet)", minPreis: 49, maxPreis: 49 },
]

/* ── Pricing Logic (now CMS-driven) ─────────────────── */

function estimateRepairPrice(
  gehauseId: string,
  problemIds: string[],
  voltageNum: number | null,
  preisregeln: RepairPreisregel[],
  gehauseOptions: RepairGehauseOption[]
): { min: number; max: number; details: string[]; warning: string | null } {
  const isUnder60V = !voltageNum || voltageNum <= 60
  const details: string[] = []
  let min = 0
  let max = 0

  // Case damage warning from CMS
  const gehause = gehauseOptions.find((g) => g.id === gehauseId)
  const warning = gehause?.warningText || null

  // Map problems to prices using CMS preisregeln
  for (const pid of problemIds) {
    const regel = preisregeln.find((r) => r.problemId === pid)
    if (regel) {
      const useHighV = !isUnder60V && regel.minPreisUeber60V && regel.maxPreisUeber60V
      const rMin = useHighV ? regel.minPreisUeber60V! : regel.minPreis
      const rMax = useHighV ? regel.maxPreisUeber60V! : regel.maxPreis
      min += rMin
      max += rMax
      details.push(
        rMin === rMax
          ? `${regel.label}: ${rMin} €`
          : `${regel.label}: ${rMin}–${rMax} €`
      )
    }
  }

  // No problems selected → just diagnosis
  if (problemIds.length === 0) {
    min = 49
    max = 49
    details.push("Diagnose-Pauschale: 49 €")
  }

  return { min, max, details, warning }
}

/* ── Component ───────────────────────────────────────── */

export default function RepairForm({ product, brand, voltage, repairSettings }: Props) {
  // Resolve CMS data with fallbacks
  const gehauseOptions = repairSettings?.gehauseOptions ?? defaultGehauseOptions
  const problemeOptions = repairSettings?.problemeOptions ?? defaultProblemeOptions
  const dauerOptions = repairSettings?.dauerOptions ?? defaultDauerOptions
  const preisregeln = repairSettings?.preisregeln ?? defaultPreisregeln
  const beschreibungPlaceholder =
    repairSettings?.beschreibungPlaceholder ??
    "z.B. Nach 20 Minuten Fahrt geht der Akku einfach aus, obwohl er vorher voll geladen war"
  const beschreibungMinChars = repairSettings?.beschreibungMinChars ?? 20
  const kiDisclaimer =
    repairSettings?.kiAnalyseDisclaimer ??
    "Automatische Vorab-Einschätzung. Der endgültige Preis wird nach Diagnose in unserer Werkstatt festgelegt. Keine Kosten ohne Ihre Zustimmung."

  // Steps: 1 = Gehäuse, 2 = Problem + Beschreibung, 3 = Details, 4 = Ergebnis
  const [step, setStep] = useState(1)

  // Step 1
  const [gehauseId, setGehauseId] = useState("")

  // Step 2
  const [problemIds, setProblemIds] = useState<string[]>([])
  const [beschreibung, setBeschreibung] = useState("")

  // Step 3
  const [dauerId, setDauerId] = useState("")
  const [seriennummer, setSeriennummer] = useState("")
  const [teilenummer, setTeilenummer] = useState("")

  const voltageNum = voltage
    ? parseInt(voltage.replace(/[^0-9]/g, ""), 10)
    : null

  const toggleProblem = (id: string) => {
    setProblemIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const estimate = useMemo(
    () => estimateRepairPrice(gehauseId, problemIds, voltageNum, preisregeln, gehauseOptions),
    [gehauseId, problemIds, voltageNum, preisregeln, gehauseOptions]
  )

  const selectedGehause = gehauseOptions.find((g) => g.id === gehauseId)
  const selectedDauer = dauerOptions.find((d) => d.id === dauerId)
  const totalSteps = 4

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${
              s <= step ? "bg-brand-500" : "bg-grey-15"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-grey-40">
        Schritt {step} von {totalSteps}
      </p>

      {/* ── Step 1: Gehäuse-Zustand ──────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-grey-90 text-lg">
              {repairSettings?.gehauseHeading ?? "Zustand des Akkugehäuses"}
            </h3>
            <p className="text-sm text-grey-50 mt-1">
              {repairSettings?.gehauseSubheading ?? "Ist das Gehäuse deines Akkus äußerlich beschädigt?"}
            </p>
          </div>

          <div className="space-y-2.5">
            {gehauseOptions.map((opt) => {
              const selected = gehauseId === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setGehauseId(opt.id)}
                  className={`flex items-start gap-3 w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? "border-brand-500 bg-brand-50"
                      : "border-grey-15 bg-white hover:border-grey-30"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <StatusIcon type={opt.severity} selected={selected} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-grey-90 block">
                      {opt.label}
                    </span>
                    <span className="text-xs text-grey-40 mt-0.5 block">
                      {opt.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Warning for critical cases */}
          {selectedGehause?.warningText && (selectedGehause.severity === "critical" || selectedGehause.severity === "danger") && (
            <div className={`rounded-lg p-3 ${selectedGehause.severity === "critical" ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
              <p className={`text-sm font-medium ${selectedGehause.severity === "critical" ? "text-red-800" : "text-amber-800"}`}>
                {selectedGehause.severity === "critical" ? "⚠ Sicherheitshinweis" : "Hinweis"}
              </p>
              <p className={`text-sm mt-1 ${selectedGehause.severity === "critical" ? "text-red-700" : "text-amber-700"}`}>
                {selectedGehause.warningText}
              </p>
            </div>
          )}

          {gehauseId && (
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-grey-90 text-white rounded-lg font-semibold hover:bg-grey-80 transition-colors"
            >
              Weiter →
            </button>
          )}
        </div>
      )}

      {/* ── Step 2: Problem & Beschreibung ───────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-grey-90 text-lg">
              {repairSettings?.problemeHeading ?? "Was ist das Problem mit deinem Akku?"}
            </h3>
            <p className="text-sm text-grey-50 mt-1">
              {repairSettings?.problemeSubheading ?? "Welches Problem hast du? (Mehrfachauswahl möglich)"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {problemeOptions.map((opt) => {
              const selected = problemIds.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleProblem(opt.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    selected
                      ? "border-brand-500 bg-brand-50"
                      : "border-grey-15 bg-white hover:border-grey-30"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selected
                        ? "bg-brand-500 border-brand-500"
                        : "border-grey-30 bg-white"
                    }`}
                  >
                    {selected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-grey-90">{opt.label}</span>
                    {opt.description && (
                      <span className="text-xs text-grey-40 block mt-0.5">{opt.description}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-grey-60 mb-1.5">
              Beschreibe das Problem kurz in eigenen Worten
            </label>
            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={3}
              placeholder={beschreibungPlaceholder}
              className="w-full px-3 py-2.5 rounded-lg border border-grey-20 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none"
            />
            <p className="text-xs text-grey-30 mt-1">
              {beschreibung.length < beschreibungMinChars
                ? `Noch mindestens ${beschreibungMinChars - beschreibung.length} Zeichen`
                : "✓ Ausreichend beschrieben"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 text-grey-50 border border-grey-20 rounded-lg font-medium hover:bg-grey-5 transition-colors"
            >
              ← Zurück
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={problemIds.length === 0 || beschreibung.length < beschreibungMinChars}
              className="flex-[2] py-2.5 bg-grey-90 text-white rounded-lg font-semibold hover:bg-grey-80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Weiter →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Weitere Details ──────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-grey-90 text-lg">
              Weitere Details
            </h3>
            <p className="text-sm text-grey-50 mt-1">
              Diese Angaben helfen unserem Techniker bei der Diagnose.
            </p>
          </div>

          {/* Seit wann */}
          <div>
            <label className="block text-sm font-medium text-grey-60 mb-2">
              {repairSettings?.dauerHeading ?? "Seit wann besteht das Problem?"}
            </label>
            <div className="flex flex-wrap gap-2">
              {dauerOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDauerId(opt.id)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    dauerId === opt.id
                      ? "border-brand-500 bg-brand-50 text-brand-600 font-medium"
                      : "border-grey-20 bg-white text-grey-60 hover:border-grey-30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seriennummer */}
          <div>
            <label className="block text-sm font-medium text-grey-60 mb-1">
              Seriennummer des Akkus{" "}
              <span className="text-grey-30">(optional)</span>
            </label>
            <input
              type="text"
              value={seriennummer}
              onChange={(e) => setSeriennummer(e.target.value)}
              placeholder="z.B. BOS123456789"
              className="w-full px-3 py-2.5 rounded-lg border border-grey-20 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
            <p className="text-xs text-grey-30 mt-1">
              Findest du auf dem Typenschild am Akku. Hilft dem Techniker
              bei der Diagnose.
            </p>
          </div>

          {/* Teilenummer */}
          <div>
            <label className="block text-sm font-medium text-grey-60 mb-1">
              Teilenummer{" "}
              <span className="text-grey-30">(falls bekannt)</span>
            </label>
            <input
              type="text"
              value={teilenummer}
              onChange={(e) => setTeilenummer(e.target.value)}
              placeholder="z.B. 0275007530"
              className="w-full px-3 py-2.5 rounded-lg border border-grey-20 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
            <p className="text-xs text-grey-30 mt-1">
              Steht oft auf dem Typenschild neben der Seriennummer.
            </p>
          </div>

          {/* Summary */}
          <div className="bg-grey-5 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-grey-90">Zusammenfassung:</p>
            <div className="space-y-1 text-grey-60">
              <p>
                <span className="text-grey-40">Akku:</span>{" "}
                {product.title}
                {voltage && ` • ${voltage}`}
              </p>
              <p>
                <span className="text-grey-40">Gehäuse:</span>{" "}
                {selectedGehause?.label || "–"}
              </p>
              <p>
                <span className="text-grey-40">Probleme:</span>{" "}
                {problemIds
                  .map((pid) => problemeOptions.find((o) => o.id === pid)?.label)
                  .join(", ") || "–"}
              </p>
              {selectedDauer && (
                <p>
                  <span className="text-grey-40">Seit:</span>{" "}
                  {selectedDauer.label}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-2.5 text-grey-50 border border-grey-20 rounded-lg font-medium hover:bg-grey-5 transition-colors"
            >
              ← Zurück
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!dauerId}
              className="flex-[2] py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              KI-Analyse starten
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: KI Result ────────────────────────── */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-grey-90 text-lg">
              Unsere Einschätzung
            </h3>
          </div>

          {/* KI Analysis Card */}
          <div className="bg-gradient-to-br from-brand-50 to-green-50 border border-brand-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-3 bg-brand-500/10 border-b border-brand-200">
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-grey-90 text-sm">
                  AkkuBooster KI-Analyse
                </p>
                <p className="text-xs text-grey-40">
                  Basierend auf deinen Angaben
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Warning */}
              {estimate.warning && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">{estimate.warning}</p>
                </div>
              )}

              {/* Identified problems */}
              <div>
                <p className="text-sm font-medium text-grey-60 mb-2">
                  Erkannte Probleme:
                </p>
                <div className="space-y-1.5">
                  {problemIds.map((pid) => {
                    const opt = problemeOptions.find((o) => o.id === pid)
                    return (
                      <div
                        key={pid}
                        className="flex items-center gap-2 text-sm"
                      >
                        <svg
                          className="w-4 h-4 text-amber-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <span className="text-grey-90">{opt?.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Price estimate */}
              <div className="bg-white rounded-lg p-4 border border-grey-10">
                <p className="text-sm font-medium text-grey-60 mb-1">
                  Geschätzte Kosten:
                </p>
                <p className="text-3xl font-bold text-brand-600">
                  {estimate.min === estimate.max
                    ? `${estimate.min} €`
                    : `${estimate.min}–${estimate.max} €`}
                </p>
                <div className="mt-3 space-y-1">
                  {estimate.details.map((d, i) => (
                    <p
                      key={i}
                      className="text-xs text-grey-40 flex items-start gap-1.5"
                    >
                      <span className="text-grey-30 mt-0.5">•</span>
                      {d}
                    </p>
                  ))}
                </div>
              </div>

              {/* Contextual tips from CMS dauer hinweis */}
              {selectedDauer?.hinweis && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Hinweis:</strong> {selectedDauer.hinweis}
                  </p>
                </div>
              )}

              {/* Included */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-green-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Kostenloser Rückversand
                </div>
                <div className="flex items-center gap-1.5 text-green-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  12 Monate Garantie
                </div>
                <div className="flex items-center gap-1.5 text-green-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Zahlung nach Reparatur
                </div>
                <div className="flex items-center gap-1.5 text-green-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Testprotokoll inklusive
                </div>
              </div>

              <p className="text-xs text-grey-40 italic">
                * {kiDisclaimer}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => {
                // TODO: Create repair order via Medusa API
                alert(
                  "Reparatur-Anfrage wird erstellt. API-Integration kommt als nächstes."
                )
              }}
              className="w-full py-3.5 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Reparatur-Anfrage senden
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full py-2.5 text-grey-50 text-sm hover:text-grey-90 transition-colors"
            >
              ← Von vorne beginnen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Sub-Components ──────────────────────────────────── */

function StatusIcon({
  type,
  selected,
}: {
  type: "ok" | "warn" | "danger" | "critical"
  selected: boolean
}) {
  const colors = {
    ok: selected ? "text-green-500" : "text-green-400",
    warn: selected ? "text-amber-500" : "text-amber-400",
    danger: selected ? "text-red-500" : "text-red-400",
    critical: selected ? "text-red-600" : "text-red-500",
  }

  const icons = {
    ok: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    warn: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    danger: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    ),
    critical: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
    ),
  }

  return (
    <svg
      className={`w-6 h-6 ${colors[type]}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {icons[type]}
    </svg>
  )
}
