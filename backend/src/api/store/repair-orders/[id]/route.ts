import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REPAIR_ORDER_MODULE } from "../../../../modules/repair-order"
import RepairOrderModuleService from "../../../../modules/repair-order/service"

/**
 * GET /store/repair-orders/:id
 *
 * Gibt den Reparatur-Auftrag inkl. Timeline und Diagnose zurück.
 * Für das Live-Tracking auf /account/reparatur/:id
 *
 * Kann per ID oder Referenz (AB-2026-00001) abgefragt werden.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const repairService: RepairOrderModuleService =
    req.scope.resolve(REPAIR_ORDER_MODULE)

  const { id } = req.params

  // Prüfe ob es eine Referenz ist (AB-YYYY-NNNNN) oder eine ID
  const isReference = id.startsWith("AB-")

  let repairOrder: any

  if (isReference) {
    const [found] = await repairService.listRepairOrders(
      { reference: id },
      {
        take: 1,
        relations: ["diagnosis", "timeline"],
      }
    )
    repairOrder = found
  } else {
    try {
      repairOrder = await repairService.retrieveRepairOrder(id, {
        relations: ["diagnosis", "timeline"],
      })
    } catch {
      repairOrder = null
    }
  }

  if (!repairOrder) {
    res.status(404).json({
      type: "not_found",
      message: `Reparatur-Auftrag '${id}' nicht gefunden`,
    })
    return
  }

  // Timeline nach Datum sortieren (neueste zuerst) — nur sichtbare
  const timeline = (repairOrder.timeline || [])
    .filter((e: any) => e.is_customer_visible)
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  res.json({
    repair_order: {
      ...repairOrder,
      timeline,
    },
  })
}
