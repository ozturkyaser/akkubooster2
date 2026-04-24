"use client"

import { useState, useCallback, useRef } from "react"

type DiagnosisResult = {
  id: string | null
  brand_detected: string | null
  model_detected: string | null
  device_type: string
  visible_damage: string[]
  damage_description: string
  confidence_score: number
  suggested_services: string[]
  summary: string
}

const serviceLabels: Record<string, string> = {
  cell_replacement: "Zellentausch",
  diagnosis: "Professionelle Diagnose",
  balancing: "Zell-Balancing",
  boost: "Kapazitaets-Boost",
  replacement: "Ersatzakku",
}

export default function KiCheckForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Bitte ein Bild (JPG, PNG) hochladen.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Bild zu gross (max. 10 MB).")
      return
    }

    setError(null)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const analyze = async () => {
    if (!preview) return

    setLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

      const res = await fetch(`${backendUrl}/store/diagnosis/ai-photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({ image: preview }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Fehler ${res.status}`)
      }

      const data = await res.json()
      setResult(data.diagnosis)
    } catch (err: any) {
      setError(err.message || "Analyse fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ========== ERGEBNIS ==========
  if (result) {
    const confidence = Math.round(result.confidence_score * 100)
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-brand-50 border border-brand-200 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-brand-700">Analyse abgeschlossen</div>
            <div className="text-sm text-brand-600">Konfidenz: {confidence}%</div>
          </div>
        </div>

        {/* Ergebnis-Karte */}
        <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-4">
          {/* Foto */}
          {preview && (
            <div className="rounded-xl overflow-hidden border border-grey-20">
              <img src={preview} alt="Akku-Foto" className="w-full h-48 object-cover" />
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            {result.brand_detected && (
              <div className="flex justify-between p-3 bg-grey-5 rounded-lg">
                <span className="text-sm text-grey-50">Marke</span>
                <span className="font-semibold text-grey-90">{result.brand_detected}</span>
              </div>
            )}
            {result.model_detected && (
              <div className="flex justify-between p-3 bg-grey-5 rounded-lg">
                <span className="text-sm text-grey-50">Modell</span>
                <span className="font-semibold text-grey-90">{result.model_detected}</span>
              </div>
            )}
            <div className="flex justify-between p-3 bg-grey-5 rounded-lg">
              <span className="text-sm text-grey-50">Typ</span>
              <span className="font-semibold text-grey-90 capitalize">{result.device_type}</span>
            </div>
          </div>
        </div>

        {/* Zusammenfassung */}
        <div className="p-4 bg-grey-5 rounded-xl">
          <h3 className="font-semibold text-grey-90 mb-2">Zusammenfassung</h3>
          <p className="text-sm text-grey-60">{result.summary}</p>
        </div>

        {/* Schaeden */}
        {result.visible_damage.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <h3 className="font-semibold text-red-700 mb-2">Erkannte Schaeden</h3>
            <ul className="space-y-1">
              {result.visible_damage.map((d, i) => (
                <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empfohlene Services */}
        {result.suggested_services.length > 0 && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl">
            <h3 className="font-semibold text-brand-700 mb-2">Empfohlene Services</h3>
            <div className="flex flex-wrap gap-2">
              {result.suggested_services.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-brand-100 text-brand-700 text-sm rounded-full font-medium">
                  {serviceLabels[s] || s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col xsmall:flex-row gap-3">
          <a
            href="/de/reparatur"
            className="flex-1 text-center px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
          >
            Reparatur-Auftrag starten
          </a>
          <button
            onClick={reset}
            className="flex-1 px-6 py-3 border border-grey-30 text-grey-70 font-semibold rounded-xl hover:border-grey-50 transition-colors"
          >
            Neues Foto analysieren
          </button>
        </div>
      </div>
    )
  }

  // ========== UPLOAD ==========
  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          preview
            ? "border-brand-400 bg-brand-50"
            : "border-grey-30 bg-grey-5 hover:border-brand-400 hover:bg-brand-50/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />

        {preview ? (
          <div>
            <img src={preview} alt="Vorschau" className="max-h-48 mx-auto rounded-xl mb-4 shadow-md" />
            <p className="text-sm text-brand-600 font-medium">Bild gewaehlt — klicke zum Aendern</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-grey-70 mb-1">
              Foto hierher ziehen oder klicken
            </h3>
            <p className="text-sm text-grey-40">
              JPG, PNG, WebP — max. 10 MB
            </p>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Analyse Button */}
      {preview && (
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-grey-30 text-white font-semibold rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              KI analysiert...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Jetzt analysieren
            </>
          )}
        </button>
      )}

      {/* Tipps */}
      <div className="p-4 bg-grey-5 rounded-xl">
        <h4 className="font-semibold text-grey-70 text-sm mb-2">Tipps fuer gute Ergebnisse</h4>
        <ul className="space-y-1 text-xs text-grey-50">
          <li>• Fotografiere das Typenschild (Markenlogo, Modellbezeichnung)</li>
          <li>• Gutes Licht, scharfes Bild</li>
          <li>• Zeige auch sichtbare Schaeden (Risse, Dellen, Verfaerbungen)</li>
        </ul>
      </div>
    </div>
  )
}
