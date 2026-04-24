import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REPAIR_ORDER_MODULE } from "../../../../../modules/repair-order"
import RepairOrderModuleService from "../../../../../modules/repair-order/service"

/**
 * POST /admin/repair-orders/:id/status
 *
 * Ändert den Status eines Reparatur-Auftrags und erstellt Timeline-Event.
 * Nur für authentifizierte Admin-User.
 *
 * Body: { status: "diagnosing", note?: "Akku wird jetzt geprüft" }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const repairService: RepairOrderModuleService =
    req.scope.resolve(REPAIR_ORDER_MODULE)

  const { id } = req.params
  const { status, note } = req.body as { status: string; note?: string }

  const validStatuses = [
    "received", "diagnosing", "quoted", "approved",
    "declined", "in_repair", "testing", "shipped",
    "completed", "cancelled",
  ]

  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({
      type: "invalid_data",
      message: `Ungültiger Status. Erlaubt: ${validStatuses.join(", ")}`,
    })
    return
  }

  try {
    const updated = await repairService.transitionStatus(
      id,
      status,
      "technician",
      note
    )
    res.json({ repair_order: updated })
  } catch (error: any) {
    res.status(404).json({
      type: "not_found",
      message: error.message,
    })
  }
}
