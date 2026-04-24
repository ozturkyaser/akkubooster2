import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SYMPTOM_MODULE } from "../../../../modules/symptom"
import SymptomModuleService from "../../../../modules/symptom/service"

/**
 * GET /store/symptoms/:handle
 *
 * Einzelnes Symptom (z.B. "akku-laedt-nicht") mit allen Details
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const symptomService: SymptomModuleService = req.scope.resolve(SYMPTOM_MODULE)
  const { handle } = req.params

  const [symptom] = await symptomService.listSymptoms(
    { handle, is_published: true },
    { take: 1 }
  )

  if (!symptom) {
    res.status(404).json({
      type: "not_found",
      message: `Symptom '${handle}' nicht gefunden`,
    })
    return
  }

  res.json({ symptom })
}
