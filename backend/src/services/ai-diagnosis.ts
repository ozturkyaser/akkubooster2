import Anthropic from "@anthropic-ai/sdk"

/**
 * AkkuBooster KI-Diagnose Service
 *
 * Nutzt Claude Vision (Sonnet) um Fotos von Akkus zu analysieren:
 * - Marke erkennen
 * - Modell erkennen
 * - Sichtbare Schäden beschreiben
 * - Empfohlene Services vorschlagen
 */

export type AIDiagnosisResult = {
  brand_detected: string | null
  model_detected: string | null
  device_type: "ebike" | "escooter" | "ecargo" | "emoped" | "unknown"
  visible_damage: string[]
  damage_description: string
  confidence_score: number // 0..1
  suggested_services: string[]
  summary: string
}

const SYSTEM_PROMPT = `Du bist ein E-Bike und E-Scooter Akku-Experte bei AkkuBooster, einer Berliner Werkstatt.

Analysiere das Foto eines Akkus und gib eine strukturierte Diagnose.

Antworte IMMER als valides JSON mit exakt diesem Schema:
{
  "brand_detected": "Markenname oder null",
  "model_detected": "Modellname oder null",
  "device_type": "ebike|escooter|ecargo|emoped|unknown",
  "visible_damage": ["Liste sichtbarer Schaeden"],
  "damage_description": "Zusammenfassung der sichtbaren Schaeden in 1-2 Saetzen",
  "confidence_score": 0.0-1.0,
  "suggested_services": ["cell_replacement", "diagnosis", "balancing", "boost", "replacement"],
  "summary": "Kurze Zusammenfassung fuer den Kunden in 2-3 Saetzen"
}

Regeln:
- Wenn du die Marke auf dem Typenschild/Aufkleber erkennst, gib sie an
- Wenn nicht sicher, setze confidence_score < 0.5
- visible_damage: nur was wirklich sichtbar ist (Dellen, Risse, Verfaerbungen, Schwellung)
- suggested_services: empfehle basierend auf dem Zustand
- Antworte NUR mit JSON, kein Markdown, kein Text drumherum`

export async function analyzeBatteryPhoto(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<AIDiagnosisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY ist nicht konfiguriert")
  }

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as any,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Analysiere diesen Akku. Erkenne Marke, Modell, sichtbare Schaeden und empfehle Services.",
          },
        ],
      },
    ],
  })

  // Response parsen
  const textBlock = response.content.find((b) => b.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Keine Text-Antwort von Claude erhalten")
  }

  try {
    // JSON extrahieren (falls Claude Markdown-Wrapper hinzufügt)
    let jsonStr = textBlock.text.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim()
    }

    const result: AIDiagnosisResult = JSON.parse(jsonStr)
    return result
  } catch (e) {
    console.error("Claude Response konnte nicht geparst werden:", textBlock.text)
    // Fallback
    return {
      brand_detected: null,
      model_detected: null,
      device_type: "unknown",
      visible_damage: [],
      damage_description: "Automatische Analyse fehlgeschlagen. Bitte manuell pruefen.",
      confidence_score: 0,
      suggested_services: ["diagnosis"],
      summary: "Die automatische Erkennung konnte kein Ergebnis liefern. Wir empfehlen eine manuelle Diagnose.",
    }
  }
}
