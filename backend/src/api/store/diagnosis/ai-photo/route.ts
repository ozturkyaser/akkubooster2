import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { analyzeBatteryPhoto } from "../../../../services/ai-diagnosis"
import { REPAIR_ORDER_MODULE } from "../../../../modules/repair-order"
import RepairOrderModuleService from "../../../../modules/repair-order/service"

/**
 * POST /store/diagnosis/ai-photo
 *
 * Empfängt ein Base64-Bild und analysiert es mit Claude Vision.
 *
 * Body (JSON):
 * {
 *   image: "data:image/jpeg;base64,..." oder reines Base64,
 *   mime_type?: "image/jpeg",  // default
 *   customer_email?: "max@example.de"  // optional: verknüpft Diagnose mit Repair Order
 * }
 *
 * Maximale Bildgröße: ~10 MB (Base64)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as {
    image?: string
    mime_type?: string
    customer_email?: string
  }

  if (!body.image) {
    res.status(400).json({
      type: "invalid_data",
      message: "Bild fehlt. Sende 'image' als Base64-String.",
    })
    return
  }

  // API Key check
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({
      type: "service_unavailable",
      message: "KI-Diagnose ist aktuell nicht verfuegbar. Bitte kontaktiere uns direkt.",
    })
    return
  }

  // Base64 extrahieren (data URI oder raw)
  let base64Data = body.image
  let mimeType = body.mime_type || "image/jpeg"

  if (base64Data.startsWith("data:")) {
    const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/)
    if (match) {
      mimeType = match[1]
      base64Data = match[2]
    } else {
      res.status(400).json({
        type: "invalid_data",
        message: "Ungültiges Bildformat. Erwartet: data:image/jpeg;base64,...",
      })
      return
    }
  }

  // Größenprüfung (~10 MB Base64 = ~7.5 MB Bild)
  if (base64Data.length > 15_000_000) {
    res.status(400).json({
      type: "invalid_data",
      message: "Bild zu gross. Maximale Groesse: 10 MB.",
    })
    return
  }

  try {
    // Claude Vision analysieren
    const result = await analyzeBatteryPhoto(base64Data, mimeType)

    // Optional: Diagnosis-Record in DB speichern
    let diagnosisId: string | null = null
    try {
      const repairService: RepairOrderModuleService =
        req.scope.resolve(REPAIR_ORDER_MODULE)

      const [diagnosis] = await repairService.createDiagnoses([
        {
          ai_brand_detected: result.brand_detected,
          ai_model_detected: result.model_detected,
          ai_damage_description: result.damage_description,
          ai_confidence: result.confidence_score,
          ai_raw_response: result as any,
          ai_recommended_services: result.suggested_services,
          technician_verdict: "pending",
        } as any,
      ])
      diagnosisId = diagnosis.id
    } catch (dbErr: any) {
      console.warn("Diagnose konnte nicht gespeichert werden:", dbErr.message)
    }

    res.status(200).json({
      diagnosis: {
        id: diagnosisId,
        ...result,
      },
    })
  } catch (error: any) {
    console.error("KI-Diagnose Fehler:", error.message)
    res.status(500).json({
      type: "server_error",
      message: "KI-Analyse fehlgeschlagen. Bitte versuche es erneut oder kontaktiere uns.",
    })
  }
}
