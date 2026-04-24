import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SYMPTOM_MODULE } from "../../../modules/symptom"
import SymptomModuleService from "../../../modules/symptom/service"

/**
 * GET /store/symptoms
 *
 * Query-Parameter:
 *   - severity=critical    → nach Schweregrad filtern
 *   - action=repair        → nach empfohlener Aktion filtern
 *   - limit=20
 *   - offset=0
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const symptomService: SymptomModuleService = req.scope.resolve(SYMPTOM_MODULE)

  const { severity, action, limit, offset } = req.query as Record<string, string>

  const filters: Record<string, any> = {
    is_published: true,
  }
  if (severity) {
    filters.severity = severity
  }
  if (action) {
    filters.recommended_action = action
  }

  const [symptoms, count] = await symptomService.listAndCountSymptoms(
    filters,
    {
      take: limit ? parseInt(limit) : 50,
      skip: offset ? parseInt(offset) : 0,
      order: { sort_order: "ASC" },
    }
  )

  res.json({
    symptoms,
    count,
    offset: offset ? parseInt(offset) : 0,
    limit: limit ? parseInt(limit) : 50,
  })
}
