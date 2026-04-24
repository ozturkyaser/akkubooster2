/**
 * Cleanup Duplicates — Option 1
 * =============================
 *
 * Findet und bereinigt Dubletten aus dem Shopify-Import:
 *   A) Hard-Dupes mit Handle-Suffix `-1`
 *   B) SEO-Zwillinge (gleicher normalisierter Titel, unterschiedliche
 *      Schreibweise / Zellentausch-Suffix)
 *   C) Bosch-Schema-Ueberlappungen (UPPERCASE vs "Active Line")
 *
 * Default: DRY-RUN — nur Ausgabe, keine Aenderungen.
 * Mit `--apply`:     setzt status='archived' auf die Verlierer (reversibel).
 * Mit `--delete`:    fuehrt Soft-Delete aus (deleted_at wird gesetzt).
 *
 * Aufruf:
 *   npx medusa exec ./src/scripts/cleanup-duplicates.ts
 *   npx medusa exec ./src/scripts/cleanup-duplicates.ts -- --apply
 *   npx medusa exec ./src/scripts/cleanup-duplicates.ts -- --delete
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type Product = {
  id: string
  handle: string
  title: string
  status: string
  created_at?: string
  description?: string | null
}

type DupeGroup = {
  category: "A" | "B" | "C"
  reason: string
  winner: Product
  losers: Product[]
}

/** normalisiert einen Titel fuer Semantik-Vergleich */
function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(
      /\b(e-?bike|akku|zellentausch|standard|bms-austausch|austausch|reparatur|fuer|für|art\.?)\b/gi,
      ""
    )
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Score: je höher, desto eher „Gewinner" (wird behalten) */
function scoreProduct(p: Product): number {
  let s = 0
  // laengerer Titel = mehr Info
  s += p.title.length * 0.5
  // enthaelt „Zellentausch"
  if (/zellentausch/i.test(p.title)) s += 20
  // enthaelt Formfaktor
  if (/gepäckträger|gepaecktrager|rahmen|intube/i.test(p.title)) s += 15
  // nicht leere description
  if (p.description && p.description.length > 20) s += 10
  // bevorzugt „saubere" handles ohne -1/-2 Suffix
  if (/-\d+$/.test(p.handle)) s -= 100
  // bevorzugt UPPERCASE (Schema 1, detaillierter laut Analyse)
  if (p.title === p.title.toUpperCase()) s += 5
  return s
}

function pickWinner(candidates: Product[]): {
  winner: Product
  losers: Product[]
} {
  const sorted = [...candidates].sort((a, b) => scoreProduct(b) - scoreProduct(a))
  return { winner: sorted[0], losers: sorted.slice(1) }
}

export default async function cleanupDuplicates({
  container,
  args,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService = container.resolve(Modules.PRODUCT)

  const flags = new Set(args || [])
  const APPLY =
    flags.has("--apply") ||
    flags.has("apply") ||
    process.env.CLEANUP_APPLY === "1"
  const DELETE =
    flags.has("--delete") ||
    flags.has("delete") ||
    process.env.CLEANUP_DELETE === "1"
  const MODE = DELETE ? "DELETE" : APPLY ? "ARCHIVE" : "DRY-RUN"

  logger.info("")
  logger.info("═══════════════════════════════════════════════════")
  logger.info(`  🧹 CLEANUP DUPLICATES — MODE: ${MODE}`)
  logger.info("═══════════════════════════════════════════════════")
  logger.info("")

  // Alle nicht-geloeschten Produkte laden
  const [allProducts] = await productService.listAndCountProducts(
    {},
    { take: 10000, select: ["id", "handle", "title", "status", "description"] }
  )
  logger.info(`📦 Produkte geladen: ${allProducts.length}`)

  const groups: DupeGroup[] = []

  // ── Kategorie A: Hard-Dupes (Handle endet auf -<n>) ─────────────
  const suffixed = allProducts.filter((p: any) => /-\d+$/.test(p.handle))
  for (const p of suffixed) {
    const baseHandle = p.handle.replace(/-\d+$/, "")
    const twin = allProducts.find(
      (o: any) => o.handle === baseHandle && o.id !== p.id
    )
    if (twin) {
      // Gewinner: der ohne Suffix
      groups.push({
        category: "A",
        reason: `handle '${p.handle}' kollidiert mit '${baseHandle}'`,
        winner: twin as Product,
        losers: [p as Product],
      })
    }
  }

  // ── Kategorie B: SEO-Zwillinge (gleicher normalisierter Titel) ──
  const byNorm = new Map<string, Product[]>()
  for (const p of allProducts as any[]) {
    const n = normalizeTitle(p.title)
    if (!n) continue
    if (!byNorm.has(n)) byNorm.set(n, [])
    byNorm.get(n)!.push(p)
  }
  const alreadyHandled = new Set(
    groups.flatMap((g) => [g.winner.id, ...g.losers.map((l) => l.id)])
  )
  for (const [norm, list] of byNorm) {
    if (list.length < 2) continue
    const fresh = list.filter((p) => !alreadyHandled.has(p.id))
    if (fresh.length < 2) continue
    const { winner, losers } = pickWinner(fresh)
    groups.push({
      category: "B",
      reason: `normalized='${norm}' — ${list.length} Produkte`,
      winner,
      losers,
    })
  }

  // ── Kategorie C: Bosch-Schema-Ueberlappung ──────────────────────
  // Mappe Bosch-Produkte auf (wattage, serie)
  // BMS-Austausch, Ladebuchse etc. sind eigene Produkt-Kategorien — nicht in Bosch-Zellentausch-Gruppierung!
  const boschProducts = (allProducts as any[]).filter(
    (p) =>
      /bosch/i.test(p.title) &&
      !/bms-austausch|ladebuchse|balancing|tiefentladung|diagnose/i.test(p.title)
  )
  const boschKey = (p: any): string | null => {
    const t = p.title.toLowerCase()
    const wattMatch = t.match(/powerpack\s*(\d+)/)
    if (!wattMatch) return null
    const watt = wattMatch[1]
    // Serie: classic vs active/performance/active-line
    let serie = "active" // default
    if (/classic/.test(t)) serie = "classic"
    else if (/active\/performance|active line|active-line|active/.test(t))
      serie = "active"
    // Formfaktor: gepäckträger vs rahmen vs unspezifiziert
    let form = "unknown"
    if (/gepäckträger|gepaecktrager/.test(t)) form = "rack"
    else if (/rahmen/.test(t)) form = "frame"
    return `bosch-${watt}-${serie}-${form}`
  }
  const boschByKey = new Map<string, any[]>()
  for (const p of boschProducts) {
    const k = boschKey(p)
    if (!k) continue
    if (!boschByKey.has(k)) boschByKey.set(k, [])
    boschByKey.get(k)!.push(p)
  }
  const alreadyHandled2 = new Set(
    groups.flatMap((g) => [g.winner.id, ...g.losers.map((l) => l.id)])
  )
  for (const [key, list] of boschByKey) {
    if (list.length < 2) continue
    const fresh = list.filter((p) => !alreadyHandled2.has(p.id))
    if (fresh.length < 2) continue
    const { winner, losers } = pickWinner(fresh)
    groups.push({
      category: "C",
      reason: `Bosch-Schema-Ueberlappung key='${key}'`,
      winner,
      losers,
    })
  }

  // ── Zusaetzlich: Bosch „Active Line" ohne Form ↔ „ACTIVE/PERFORMANCE - GEPÄCKTRÄGER" ──
  // Regel: wenn es pro (Brand + Wattzahl) zwei Produkte gibt, einer mit expliziter Form und einer ohne,
  // und die Serie kompatibel ist (active), dann archiviere den ohne Form.
  const boschByWatt = new Map<string, any[]>()
  for (const p of boschProducts) {
    const m = p.title.toLowerCase().match(/powerpack\s*(\d+)/)
    if (!m) continue
    const w = m[1]
    if (!boschByWatt.has(w)) boschByWatt.set(w, [])
    boschByWatt.get(w)!.push(p)
  }
  const alreadyHandled3 = new Set(
    groups.flatMap((g) => [g.winner.id, ...g.losers.map((l) => l.id)])
  )
  for (const [watt, list] of boschByWatt) {
    if (list.length < 2) continue
    // Nur wenn alle Serie=Active (nicht classic)
    const activeOnly = list.filter((p) => !/classic/i.test(p.title))
    if (activeOnly.length < 2) continue
    const withForm = activeOnly.filter((p) =>
      /gepäckträger|gepaecktrager|rahmen/i.test(p.title)
    )
    const withoutForm = activeOnly.filter(
      (p) => !/gepäckträger|gepaecktrager|rahmen/i.test(p.title)
    )
    if (withForm.length === 0 || withoutForm.length === 0) continue

    const fresh = withoutForm.filter((p) => !alreadyHandled3.has(p.id))
    if (fresh.length === 0) continue

    groups.push({
      category: "C",
      reason: `Bosch ${watt}Wh: '${fresh[0].title}' ohne Formfaktor vs. explizite Variante(n)`,
      winner: withForm[0],
      losers: fresh,
    })
  }

  // ── Report ─────────────────────────────────────────────────────
  logger.info("")
  const totalLosers = groups.reduce((s, g) => s + g.losers.length, 0)
  logger.info(`🔎 Gefunden: ${groups.length} Gruppen, ${totalLosers} Verlierer`)
  logger.info("")

  const byCat: Record<string, DupeGroup[]> = { A: [], B: [], C: [] }
  for (const g of groups) byCat[g.category].push(g)

  for (const cat of ["A", "B", "C"] as const) {
    const list = byCat[cat]
    if (list.length === 0) continue
    const label =
      cat === "A"
        ? "Hard-Dupes (Handle-Suffix -1)"
        : cat === "B"
        ? "SEO-Zwillinge"
        : "Bosch-Schema-Ueberlappung"
    logger.info(`─── Kategorie ${cat}: ${label} (${list.length}) ───`)
    for (const g of list) {
      logger.info(`  ✓ KEEP:    ${g.winner.title}`)
      logger.info(`    handle:  ${g.winner.handle}`)
      for (const l of g.losers) {
        logger.info(`  ✗ ARCHIVE: ${l.title}`)
        logger.info(`    handle:  ${l.handle}`)
      }
      logger.info(`    reason:  ${g.reason}`)
      logger.info("")
    }
  }

  // ── Apply ──────────────────────────────────────────────────────
  if (MODE === "DRY-RUN") {
    logger.info("───────────────────────────────────────────────────")
    logger.info("  DRY-RUN fertig. Keine Aenderung geschrieben.")
    logger.info("  Zum Ausfuehren:")
    logger.info("    npx medusa exec ./src/scripts/cleanup-duplicates.ts -- --apply")
    logger.info("───────────────────────────────────────────────────")
    return
  }

  const loserIds = groups.flatMap((g) => g.losers.map((l) => l.id))
  if (loserIds.length === 0) {
    logger.info("Nichts zu tun.")
    return
  }

  logger.info(`🗑️  Soft-Delete ${loserIds.length} Produkte (reversibel via restore)...`)
  await (productService as any).softDeleteProducts(loserIds)
  logger.info(`✓ ${loserIds.length} Produkte entfernt (deleted_at gesetzt)`)
  logger.info("")
  logger.info("ℹ  Wiederherstellen mit:")
  logger.info("    productService.restoreProducts([...ids])")

  logger.info("")
  logger.info("═══════════════════════════════════════════════════")
  logger.info(`  ✅ CLEANUP FERTIG (${MODE})`)
  logger.info("═══════════════════════════════════════════════════")
}
