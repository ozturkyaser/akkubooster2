import { MedusaService } from "@medusajs/framework/utils"
import {
  RepairOrder,
  Diagnosis,
  RepairTimelineEvent,
} from "./models/repair-order"

class RepairOrderModuleService extends MedusaService({
  RepairOrder,
  Diagnosis,
  RepairTimelineEvent,
}) {
  /**
   * Status-Übergang mit automatischer Timeline-Event-Erstellung
   */
  async transitionStatus(
    repairOrderId: string,
    newStatus: string,
    actor: "customer" | "technician" | "system" | "ai" = "system",
    note?: string
  ) {
    const [current] = await this.listRepairOrders({ id: repairOrderId })
    if (!current) {
      throw new Error(`RepairOrder ${repairOrderId} nicht gefunden`)
    }

    const oldStatus = current.status

    const [updated] = await this.updateRepairOrders([
      { id: repairOrderId, status: newStatus as any },
    ])

    try {
      await this.createRepairTimelineEvents([
        {
          type: "status_change",
          title: `Status: ${oldStatus} → ${newStatus}`,
          description: note || null,
          actor,
          is_customer_visible: true,
          repair_order_id: repairOrderId,
        } as any,
      ])
    } catch (e: any) {
      // Timeline-Event ist optional — kein Abbruch bei Fehler
      console.warn("Timeline-Event konnte nicht erstellt werden:", e.message)
    }

    return updated
  }

  /**
   * Generiert eine AkkuBooster-Referenz im Format AB-YYYY-NNNNN
   */
  async generateReference(): Promise<string> {
    const year = new Date().getFullYear()
    const all = await this.listRepairOrders({})
    const yearPrefix = `AB-${year}-`
    const thisYear = all.filter((o) => o.reference?.startsWith(yearPrefix))
    const next = (thisYear.length + 1).toString().padStart(5, "0")
    return `${yearPrefix}${next}`
  }
}

export default RepairOrderModuleService
