"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { addToCart, getOrSetCart } from "./cart"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"
import { getRegion } from "./regions"
import { revalidateTag } from "next/cache"

type BrandServiceKey =
  | "diagnose"
  | "bms_standard"
  | "bms_high_voltage"
  | "zellentausch_from"
  | "balancing"
  | "ladebuchse"
  | "tiefentladung"

/**
 * Finds a service product by handle and returns its first variant ID.
 * For products with voltage-based variants, pass isOver60V to select the right one.
 */
export async function getServiceVariantId(
  handle: string,
  countryCode: string,
  isOver60V?: boolean
): Promise<string | null> {
  try {
    const region = await getRegion(countryCode)
    if (!region) return null

    const headers = { ...(await getAuthHeaders()) }
    const next = { ...(await getCacheOptions("products")) }

    const { products } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
    }>(`/store/products`, {
      method: "GET",
      query: {
        handle,
        limit: 1,
        region_id: region.id,
        fields: "*variants.calculated_price,+variants.inventory_quantity",
      },
      headers,
      next,
      cache: "force-cache",
    })

    if (!products?.length) return null

    const product = products[0]
    const variants = product.variants || []

    if (variants.length === 0) return null
    if (variants.length === 1) return variants[0].id

    // For multi-variant (e.g. BMS ≤60V / >60V): pick by title
    if (isOver60V) {
      const over60 = variants.find(
        (v) => v.title?.includes(">60V") || v.title?.includes("60V-PLUS")
      )
      if (over60) return over60.id
    }

    // Default: first variant (≤60V)
    return variants[0].id
  } catch (err) {
    console.error(`Error finding service product ${handle}:`, err)
    return null
  }
}

/**
 * Adds a service to the cart with a brand-specific price override.
 *
 * Der Preis wird serverseitig aus `brand.service_prices[service_key]`
 * gelesen; der Client schickt nur `brand_handle` + `service_key`. Wenn
 * die Marke fuer den Service keinen Override hat, verwendet der
 * Endpoint transparent den Standard-Preis der Variante.
 */
export async function addBrandServiceToCart({
  brandHandle,
  serviceKey,
  countryCode,
}: {
  brandHandle: string
  serviceKey: BrandServiceKey
  countryCode: string
}): Promise<{ success: boolean; error?: string; overridden?: boolean }> {
  try {
    const cart = await getOrSetCart(countryCode)
    if (!cart) {
      return { success: false, error: "Warenkorb konnte nicht erstellt werden" }
    }

    const backendUrl =
      process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    const headers = {
      ...(await getAuthHeaders()),
      "x-publishable-api-key": publishableKey,
      "Content-Type": "application/json",
    }

    const res = await fetch(
      `${backendUrl}/store/carts/${cart.id}/brand-service-items`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          brand_handle: brandHandle,
          service_key: serviceKey,
        }),
        cache: "no-store",
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return {
        success: false,
        error: err?.message || `HTTP ${res.status}`,
      }
    }

    const data = await res.json().catch(() => ({}))

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)

    return { success: true, overridden: !!data?.applied_override }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Fehler beim Hinzufuegen zum Warenkorb",
    }
  }
}

/**
 * Adds a service product to cart by its handle.
 */
export async function addServiceToCart({
  serviceHandle,
  countryCode,
  isOver60V,
}: {
  serviceHandle: string
  countryCode: string
  isOver60V?: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const variantId = await getServiceVariantId(serviceHandle, countryCode, isOver60V)
    if (!variantId) {
      return {
        success: false,
        error: `Service-Produkt "${serviceHandle}" nicht gefunden.`,
      }
    }

    await addToCart({
      variantId,
      quantity: 1,
      countryCode,
    })

    return { success: true }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Fehler beim Hinzufügen zum Warenkorb",
    }
  }
}
