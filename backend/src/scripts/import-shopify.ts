/**
 * Shopify → Medusa 2.0 Import Script
 * ====================================
 * Importiert alle Produkte, Collections und Kunden von Shopify nach Medusa.
 *
 * Unterstützt zwei Modi:
 * 1. Admin API (benötigt SHOPIFY_ADMIN_ACCESS_TOKEN) — vollständiger Import
 * 2. Storefront JSON (/products.json) — nur Produkte (kein Token nötig)
 *
 * ENV-Variablen:
 *   SHOPIFY_SHOP_DOMAIN=akkubooster.de   (oder akkubooster.myshopify.com)
 *   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxx  (optional, für Admin API)
 *
 * Aufruf:
 *   pnpm exec medusa exec ./src/scripts/import-shopify.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ShopifyImage {
  id: number
  src: string
  position: number
  alt?: string | null
}

interface ShopifyVariant {
  id: number
  title: string
  sku: string | null
  price: string
  compare_at_price: string | null
  option1: string | null
  option2: string | null
  option3: string | null
  inventory_quantity?: number
  weight?: number
  weight_unit?: string
  requires_shipping?: boolean
  taxable?: boolean
  barcode?: string | null
}

interface ShopifyOption {
  id: number
  name: string
  position: number
  values: string[]
}

interface ShopifyProduct {
  id: number
  title: string
  handle: string
  body_html: string | null
  vendor: string
  product_type: string
  tags: string
  status?: string
  published_at?: string | null
  images: ShopifyImage[]
  variants: ShopifyVariant[]
  options: ShopifyOption[]
}

interface ShopifyCollection {
  id: number
  handle: string
  title: string
  body_html: string | null
  image?: { src: string } | null
  sort_order?: string
  published_at?: string | null
}

interface ShopifyCustomer {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string | null
  addresses?: Array<{
    address1: string
    address2: string | null
    city: string
    province: string
    zip: string
    country_code: string
    phone: string | null
  }>
  tags?: string
  note?: string | null
  created_at: string
}

/* ------------------------------------------------------------------ */
/*  Shopify API Helpers                                                */
/* ------------------------------------------------------------------ */

const SHOPIFY_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN || "akkubooster.de"
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || ""

function shopifyAdminUrl(path: string): string {
  // Shopify Admin API expects myshopify.com domain
  const domain = SHOPIFY_DOMAIN.includes("myshopify.com")
    ? SHOPIFY_DOMAIN
    : `${SHOPIFY_DOMAIN.replace(/\.de$|\.com$/, "")}.myshopify.com`
  return `https://${domain}/admin/api/2024-01/${path}`
}

function storefrontUrl(path: string): string {
  return `https://${SHOPIFY_DOMAIN}/${path}`
}

async function fetchShopifyAdmin<T>(path: string): Promise<T> {
  const url = shopifyAdminUrl(path)
  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_TOKEN,
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) {
    throw new Error(`Shopify Admin API ${res.status}: ${await res.text()}`)
  }
  return res.json() as Promise<T>
}

/** Fetch all pages of a Shopify Admin API resource */
async function fetchAllShopifyAdmin<T>(
  resource: string,
  key: string
): Promise<T[]> {
  const all: T[] = []
  let url = `${resource}.json?limit=250`

  while (url) {
    const fullUrl = shopifyAdminUrl(url)
    const res = await fetch(fullUrl, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_TOKEN,
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) {
      throw new Error(`Shopify Admin API ${res.status}: ${await res.text()}`)
    }
    const data = await res.json()
    all.push(...(data[key] || []))

    // Parse Link header for pagination
    const linkHeader = res.headers.get("link")
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
      if (nextMatch) {
        // Extract path after /admin/api/
        const nextUrl = new URL(nextMatch[1])
        url = nextUrl.pathname.replace(/.*\/admin\/api\/\d{4}-\d{2}\//, "") + nextUrl.search
      } else {
        url = ""
      }
    } else {
      url = ""
    }
  }
  return all
}

/** Fallback: Fetch products via public storefront JSON API */
async function fetchStorefrontProducts(): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = []
  let page = 1

  while (true) {
    const url = storefrontUrl(`products.json?limit=250&page=${page}`)
    const res = await fetch(url)
    if (!res.ok) break
    const data = await res.json()
    if (!data.products || data.products.length === 0) break
    all.push(...data.products)
    page++
  }
  return all
}

/** Fetch all collections via public storefront JSON API */
async function fetchStorefrontCollections(): Promise<ShopifyCollection[]> {
  const all: ShopifyCollection[] = []
  let page = 1

  while (true) {
    const url = storefrontUrl(`collections.json?limit=250&page=${page}`)
    const res = await fetch(url)
    if (!res.ok) break
    const data = await res.json()
    if (!data.collections || data.collections.length === 0) break
    all.push(...data.collections)
    page++
  }
  return all
}

/** Fetch collection products mapping */
async function fetchCollectionProducts(
  collectionHandle: string
): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = []
  let page = 1
  while (true) {
    const url = storefrontUrl(
      `collections/${collectionHandle}/products.json?limit=250&page=${page}`
    )
    const res = await fetch(url)
    if (!res.ok) break
    const data = await res.json()
    if (!data.products || data.products.length === 0) break
    all.push(...data.products)
    page++
  }
  return all
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function stripHtml(html: string | null): string {
  if (!html) return ""
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function parsePrice(price: string): number {
  // Shopify prices are strings like "329.00" — Medusa wants cents as integer
  const num = parseFloat(price)
  if (isNaN(num)) return 0
  return Math.round(num * 100)
}

function generateSku(product: ShopifyProduct, variant: ShopifyVariant, idx: number): string {
  if (variant.sku && variant.sku.trim()) return variant.sku.trim()
  // Generate a SKU from handle + variant index
  const prefix = product.handle
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20)
    .toUpperCase()
  return `${prefix}-V${idx + 1}`
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ------------------------------------------------------------------ */
/*  Main Import                                                        */
/* ------------------------------------------------------------------ */

export default async function importShopify({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION)
  const brandModuleService = container.resolve("brand") as any

  const useAdminApi = !!SHOPIFY_TOKEN
  logger.info(
    `🔄 Shopify Import startet (${
      useAdminApi ? "Admin API" : "Storefront JSON"
    }) — Shop: ${SHOPIFY_DOMAIN}`
  )

  // ── 1. Get Medusa Prerequisites ──────────────────────────────────
  const [defaultSalesChannel] =
    await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    })
  if (!defaultSalesChannel) throw new Error("Kein Sales Channel gefunden")

  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  const shippingProfile = shippingProfiles[0]
  if (!shippingProfile) throw new Error("Kein Shipping Profile gefunden")

  const stockLocations = await stockLocationModuleService.listStockLocations({})
  const stockLocation = stockLocations[0]
  if (!stockLocation) throw new Error("Keine Stock Location gefunden")

  logger.info(
    `✓ Medusa: Sales Channel "${defaultSalesChannel.name}", Shipping Profile "${shippingProfile.name}", Stock Location "${stockLocation.name}"`
  )

  // ── 2. Fetch Shopify Data ──────────────────────────────────────
  logger.info("📥 Lade Shopify-Daten...")

  let shopifyProducts: ShopifyProduct[] = []
  let shopifyCollections: ShopifyCollection[] = []

  if (useAdminApi) {
    // Admin API — full access
    try {
      shopifyProducts = await fetchAllShopifyAdmin<ShopifyProduct>(
        "products",
        "products"
      )
      shopifyCollections = await fetchAllShopifyAdmin<ShopifyCollection>(
        "custom_collections",
        "custom_collections"
      )
      // Also smart collections
      const smartCollections =
        await fetchAllShopifyAdmin<ShopifyCollection>(
          "smart_collections",
          "smart_collections"
        )
      shopifyCollections = [...shopifyCollections, ...smartCollections]
    } catch (err: any) {
      logger.warn(
        `⚠ Admin API Fehler: ${err.message}. Fallback zu Storefront JSON...`
      )
      shopifyProducts = await fetchStorefrontProducts()
      shopifyCollections = await fetchStorefrontCollections()
    }
  } else {
    shopifyProducts = await fetchStorefrontProducts()
    shopifyCollections = await fetchStorefrontCollections()
  }

  logger.info(
    `✓ ${shopifyProducts.length} Produkte und ${shopifyCollections.length} Collections geladen`
  )

  // ── 3. Create Product Categories (from Collections) ────────────
  logger.info("📂 Erstelle Produkt-Kategorien aus Collections...")

  // Check existing categories
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  })
  const existingCategoryHandles = new Set(
    existingCategories.map((c: any) => c.handle)
  )

  const newCategories = shopifyCollections.filter(
    (c) => !existingCategoryHandles.has(c.handle)
  )

  const categoryMap = new Map<string, string>() // handle → medusa ID

  // Add existing categories to map
  for (const cat of existingCategories) {
    categoryMap.set(cat.handle, cat.id)
  }

  if (newCategories.length > 0) {
    // Batch create in chunks of 20
    const BATCH_SIZE = 20
    for (let i = 0; i < newCategories.length; i += BATCH_SIZE) {
      const batch = newCategories.slice(i, i + BATCH_SIZE)
      try {
        const { result } = await createProductCategoriesWorkflow(
          container
        ).run({
          input: {
            product_categories: batch.map((c) => ({
              name: c.title,
              handle: c.handle,
              description: stripHtml(c.body_html) || undefined,
              is_active: true,
              is_internal: false,
            })),
          },
        })
        for (const cat of result) {
          categoryMap.set(cat.handle, cat.id)
        }
        logger.info(
          `  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} Kategorien erstellt`
        )
      } catch (err: any) {
        logger.warn(
          `  ⚠ Batch ${Math.floor(i / BATCH_SIZE) + 1} fehlgeschlagen: ${err.message}`
        )
        // Try one by one
        for (const c of batch) {
          try {
            const { result } = await createProductCategoriesWorkflow(
              container
            ).run({
              input: {
                product_categories: [
                  {
                    name: c.title,
                    handle: c.handle,
                    description: stripHtml(c.body_html) || undefined,
                    is_active: true,
                    is_internal: false,
                  },
                ],
              },
            })
            categoryMap.set(c.handle, result[0].id)
          } catch (e2: any) {
            logger.warn(`  ⚠ Kategorie "${c.title}" übersprungen: ${e2.message}`)
          }
        }
      }
    }
  }

  logger.info(`✓ ${categoryMap.size} Kategorien total (${newCategories.length} neu)`)

  // ── 4. Create Brands (from Collections / Vendors) ──────────────
  logger.info("🏷️  Erstelle Marken aus Collections...")

  const existingBrands = await brandModuleService.listBrands({}, {})
  const existingBrandHandles = new Set(
    existingBrands.map((b: any) => b.handle)
  )

  const brandMap = new Map<string, string>() // handle → brand ID
  for (const b of existingBrands) {
    brandMap.set(b.handle, b.id)
  }

  for (const c of shopifyCollections) {
    if (existingBrandHandles.has(c.handle)) continue

    try {
      const brand = await brandModuleService.createBrands({
        handle: c.handle,
        name: c.title,
        description: stripHtml(c.body_html) || null,
        logo_url: c.image?.src || null,
        is_featured: false,
        sort_order: 0,
      })
      brandMap.set(c.handle, brand.id)
      logger.info(`  ✓ Brand "${c.title}" erstellt`)
    } catch (err: any) {
      logger.warn(`  ⚠ Brand "${c.title}" übersprungen: ${err.message}`)
    }
  }

  logger.info(`✓ ${brandMap.size} Brands total`)

  // ── 5. Build Collection → Product mapping ──────────────────────
  logger.info("🔗 Lade Collection-Produkt-Zuordnungen...")

  // Map product handle → collection handles
  const productCollections = new Map<string, string[]>()

  // From tags (each tag often corresponds to a collection)
  for (const p of shopifyProducts) {
    let rawTags: string[] = []
    if (Array.isArray(p.tags)) {
      rawTags = (p.tags as any as string[]).map((t: string) =>
        t.trim().toLowerCase().replace(/\s+/g, "-")
      )
    } else if (typeof p.tags === "string" && p.tags) {
      rawTags = p.tags
        .split(",")
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    }
    productCollections.set(p.handle, rawTags.filter(Boolean))
  }

  // If using storefront, also fetch collection products for accurate mapping
  if (!useAdminApi && shopifyCollections.length > 0) {
    logger.info(
      "  ↳ Lade Produkt-Zuordnungen für jede Collection (kann dauern)..."
    )
    let collCount = 0
    for (const coll of shopifyCollections) {
      try {
        const collProducts = await fetchCollectionProducts(coll.handle)
        for (const cp of collProducts) {
          const existing = productCollections.get(cp.handle) || []
          if (!existing.includes(coll.handle)) {
            existing.push(coll.handle)
          }
          productCollections.set(cp.handle, existing)
        }
        collCount++
        if (collCount % 10 === 0) {
          logger.info(
            `  ↳ ${collCount}/${shopifyCollections.length} Collections verarbeitet`
          )
        }
        // Rate limit
        await sleep(200)
      } catch {
        // Ignore individual collection fetch errors
      }
    }
  }

  // ── 6. Import Products ─────────────────────────────────────────
  logger.info("📦 Importiere Produkte...")

  // Check existing products
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  const existingProductHandles = new Set(
    existingProducts.map((p: any) => p.handle)
  )

  // Filter out products that already exist
  const newProducts = shopifyProducts.filter(
    (p) => !existingProductHandles.has(p.handle)
  )

  logger.info(
    `  ↳ ${newProducts.length} neue Produkte (${existingProducts.length} existieren bereits)`
  )

  // Map to track shopify handle → medusa product ID
  const productIdMap = new Map<string, string>()

  // Existing product IDs
  for (const p of existingProducts) {
    productIdMap.set(p.handle, p.id)
  }

  // Import in batches
  const PRODUCT_BATCH = 5
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < newProducts.length; i += PRODUCT_BATCH) {
    const batch = newProducts.slice(i, i + PRODUCT_BATCH)

    const medusaProducts = batch
      .map((sp) => {
        // Skip products with no variants
        if (!sp.variants || sp.variants.length === 0) {
          logger.warn(`  ⚠ "${sp.title}" hat keine Varianten, übersprungen`)
          return null
        }

        // Skip "Diagnose" placeholder product
        if (sp.handle === "diagnose") {
          logger.info(`  ↳ "Diagnose" Platzhalter übersprungen`)
          return null
        }

        // Determine category IDs from tags
        const collHandles = productCollections.get(sp.handle) || []
        const categoryIds = collHandles
          .map((h) => categoryMap.get(h))
          .filter(Boolean) as string[]

        // Build options
        const options = sp.options
          .filter(
            (o) =>
              o.name !== "Title" ||
              (o.values.length > 1 || o.values[0] !== "Default Title")
          )
          .map((o) => ({
            title: o.name === "Title" ? "Standard" : o.name,
            values: o.values,
          }))

        // If no meaningful options, create a default one
        if (options.length === 0) {
          options.push({ title: "Standard", values: ["Standard"] })
        }

        // Build variants
        const variants = sp.variants.map((v, idx) => {
          const variantOptions: Record<string, string> = {}
          if (options.length >= 1) {
            variantOptions[options[0].title] =
              v.option1 || options[0].values[0] || "Standard"
          }
          if (options.length >= 2 && v.option2) {
            variantOptions[options[1].title] = v.option2
          }
          if (options.length >= 3 && v.option3) {
            variantOptions[options[2].title] = v.option3
          }

          const prices: Array<{ amount: number; currency_code: string }> = []
          const priceAmount = parsePrice(v.price)
          if (priceAmount > 0) {
            prices.push({ amount: priceAmount, currency_code: "eur" })
          }

          return {
            title: v.title === "Default Title" ? "Standard" : v.title,
            sku: generateSku(sp, v, idx),
            options: variantOptions,
            prices,
            manage_inventory: true,
          }
        })

        // Build images
        const images = sp.images.map((img) => ({ url: img.src }))
        const thumbnailUrl = sp.images[0]?.src || undefined

        return {
          title: sp.title,
          handle: sp.handle,
          description: stripHtml(sp.body_html),
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          weight: sp.variants[0]?.weight || undefined,
          category_ids: categoryIds.length > 0 ? categoryIds : undefined,
          thumbnail: thumbnailUrl,
          images: images.length > 0 ? images : undefined,
          options,
          variants,
          sales_channels: [{ id: defaultSalesChannel.id }],
          metadata: {
            shopify_id: String(sp.id),
            shopify_vendor: sp.vendor,
            shopify_product_type: sp.product_type,
            shopify_tags: Array.isArray(sp.tags)
              ? (sp.tags as any).join(", ")
              : sp.tags || "",
          },
        }
      })
      .filter(Boolean) as any[]

    if (medusaProducts.length === 0) continue

    try {
      const { result } = await createProductsWorkflow(container).run({
        input: { products: medusaProducts },
      })

      for (const prod of result) {
        productIdMap.set(prod.handle, prod.id)
      }

      successCount += result.length
      logger.info(
        `  ✓ Batch ${Math.floor(i / PRODUCT_BATCH) + 1}: ${result.length} Produkte importiert (${successCount}/${newProducts.length})`
      )
    } catch (err: any) {
      // Try one by one on batch failure
      logger.warn(`  ⚠ Batch-Fehler, versuche einzeln: ${err.message}`)
      for (const mp of medusaProducts) {
        try {
          const { result } = await createProductsWorkflow(container).run({
            input: { products: [mp] },
          })
          productIdMap.set(result[0].handle, result[0].id)
          successCount++
          logger.info(`  ✓ "${mp.title}" importiert`)
        } catch (e2: any) {
          errorCount++
          logger.error(`  ✗ "${mp.title}" fehlgeschlagen: ${e2.message}`)
        }
      }
    }

    // Small delay between batches
    await sleep(100)
  }

  logger.info(
    `✓ Produkt-Import abgeschlossen: ${successCount} erstellt, ${errorCount} Fehler`
  )

  // ── 7. Create Inventory Levels ─────────────────────────────────
  logger.info("📊 Erstelle Inventory Levels...")

  try {
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    })

    // Get existing levels for this location
    const { data: existingLevels } = await query.graph({
      entity: "inventory_level",
      fields: ["id", "inventory_item_id"],
      filters: {
        location_id: stockLocation.id,
      },
    })
    const existingItemIds = new Set(
      existingLevels.map((l: any) => l.inventory_item_id)
    )

    const newLevels = inventoryItems
      .filter((item: any) => !existingItemIds.has(item.id))
      .map((item: any) => ({
        location_id: stockLocation.id,
        stocked_quantity: 999999,
        inventory_item_id: item.id,
      }))

    if (newLevels.length > 0) {
      // Batch in chunks of 100
      const INV_BATCH = 100
      for (let i = 0; i < newLevels.length; i += INV_BATCH) {
        const batch = newLevels.slice(i, i + INV_BATCH)
        await createInventoryLevelsWorkflow(container).run({
          input: { inventory_levels: batch },
        })
      }
      logger.info(`✓ ${newLevels.length} Inventory Levels erstellt`)
    } else {
      logger.info(`↳ Alle Inventory Levels existieren bereits`)
    }
  } catch (err: any) {
    logger.warn(`⚠ Inventory Levels Fehler: ${err.message}`)
  }

  // ── 8. Link Products to Brands ─────────────────────────────────
  logger.info("🔗 Verknüpfe Produkte mit Brands...")

  let linkCount = 0
  const productEntries = Array.from(productIdMap.entries())
  for (const entry of productEntries) {
    const productHandle = entry[0]
    const productId = entry[1]
    const collHandles = productCollections.get(productHandle) || []

    // Find matching brand (first matching collection handle)
    for (const collHandle of collHandles) {
      const brandId = brandMap.get(collHandle)
      if (brandId) {
        try {
          await link.create({
            brand: { brand_id: brandId },
            product: { product_id: productId },
          })
          linkCount++
        } catch {
          // Link might already exist
        }
        break // Only first matching brand
      }
    }
  }

  logger.info(`✓ ${linkCount} Produkt-Brand-Verknüpfungen erstellt`)

  // ── 9. Import Customers (Admin API only) ───────────────────────
  if (useAdminApi) {
    logger.info("👥 Importiere Kunden...")
    try {
      const shopifyCustomers =
        await fetchAllShopifyAdmin<ShopifyCustomer>(
          "customers",
          "customers"
        )
      logger.info(`  ↳ ${shopifyCustomers.length} Kunden geladen`)

      const customerModuleService = container.resolve(Modules.CUSTOMER)
      let custSuccess = 0
      let custSkipped = 0

      for (const sc of shopifyCustomers) {
        if (!sc.email) {
          custSkipped++
          continue
        }

        try {
          // Check if customer exists
          const existing = await (
            customerModuleService as any
          ).listCustomers({ email: sc.email })
          if (existing.length > 0) {
            custSkipped++
            continue
          }

          await (customerModuleService as any).createCustomers({
            email: sc.email,
            first_name: sc.first_name || "",
            last_name: sc.last_name || "",
            phone: sc.phone || undefined,
            metadata: {
              shopify_id: String(sc.id),
              shopify_tags: sc.tags || "",
              shopify_note: sc.note || "",
            },
          })
          custSuccess++

          if (custSuccess % 50 === 0) {
            logger.info(`  ↳ ${custSuccess} Kunden importiert...`)
          }
        } catch (err: any) {
          logger.warn(
            `  ⚠ Kunde "${sc.email}" übersprungen: ${err.message}`
          )
        }
      }

      logger.info(
        `✓ Kunden-Import: ${custSuccess} importiert, ${custSkipped} übersprungen`
      )
    } catch (err: any) {
      logger.warn(`⚠ Kunden-Import fehlgeschlagen: ${err.message}`)
    }
  }

  // ── 10. Summary ────────────────────────────────────────────────
  logger.info("")
  logger.info("═══════════════════════════════════════════════════")
  logger.info("  🎉 SHOPIFY IMPORT ABGESCHLOSSEN")
  logger.info("═══════════════════════════════════════════════════")
  logger.info(`  📂 Kategorien:  ${categoryMap.size}`)
  logger.info(`  🏷️  Brands:      ${brandMap.size}`)
  logger.info(`  📦 Produkte:    ${successCount} neu, ${errorCount} Fehler`)
  logger.info(`  🔗 Verknüpf.:   ${linkCount}`)
  logger.info(`  📊 Inventar:    ✓`)
  if (useAdminApi) {
    logger.info(`  👥 Kunden:      via Admin API`)
  }
  logger.info("═══════════════════════════════════════════════════")
  logger.info("")
  logger.info("Nächste Schritte:")
  logger.info(
    "  1. Medusa Admin öffnen (http://localhost:9000) und Produkte prüfen"
  )
  logger.info("  2. Produktbilder im Admin überprüfen")
  logger.info(
    "  3. Preise & Varianten kontrollieren"
  )
  logger.info(
    "  4. Bei Bedarf Produkt-Beschreibungen im Admin nachbearbeiten"
  )
}
