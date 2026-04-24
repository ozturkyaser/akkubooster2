"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { RepairSettingsData, RepairServiceItem } from "@lib/sanity/queries"
import { addServiceToCart, addBrandServiceToCart } from "@lib/data/service-cart"

type ServiceKey =
  | "diagnose"
  | "bms_standard"
  | "bms_high_voltage"
  | "zellentausch_from"
  | "balancing"
  | "ladebuchse"
  | "tiefentladung"

type Props = {
  product: HttpTypes.StoreProduct
  brand: string | null
  brandHandle?: string | null
  brandOverrides?: Partial<Record<ServiceKey, number>>
  voltage: string | null
  repairSettings?: RepairSettingsData | null
}

/** Maps CMS service IDs to Medusa product handles */
const SERVICE_HANDLE_MAP: Record<string, string> = {
  bms_austausch: "service-bms-austausch",
  ladebuchse: "service-ladebuchse",
  tiefentladung: "service-tiefentladung",
  ausbalancierung: "service-ausbalancierung",
}

/** Mapping CMS Service-ID (+ voltage) → brand service_key */
function toBrandServiceKey(
  id: string,
  isOver60V: boolean
): ServiceKey | null {
  switch (id) {
    case "bms_austausch":
      return isOver60V ? "bms_high_voltage" : "bms_standard"
    case "ladebuchse":
      return "ladebuchse"
    case "tiefentladung":
      return "tiefentladung"
    case "ausbalancierung":
      return "balancing"
    default:
      return null
  }
}

/* ── Fallback defaults ─────────────────────────────── */

const defaultServices: RepairServiceItem[] = [
  {
    id: "bms_austausch",
    title: "BMS-Austausch",
    description:
      "Austausch des Batterie-Management-Systems (BMS). Behebt Fehlermeldungen, Abschaltungen und Kommunikationsprobleme zwischen Akku und E-Bike.",
    icon: "cog",
    preis: 120,
    preisUeber60V: 150,
    leistungen: [
      "BMS-Diagnose & Fehleranalyse",
      "Austausch mit kompatiblem BMS",
      "Zell-Balancing nach Einbau",
      "Funktionstest & Testprotokoll",
    ],
    highlight: true,
  },
  {
    id: "ladebuchse",
    title: "Ladebuchse / Anschlussbuchse",
    description:
      "Austausch defekter Lade- oder Anschlussbuchsen. Löst Probleme beim Laden oder der Verbindung zum E-Bike.",
    icon: "plug",
    preis: 89,
    leistungen: [
      "Buchsen-Diagnose",
      "Austausch der defekten Buchse",
      "Lötarbeiten & Abdichtung",
      "Lade- und Verbindungstest",
    ],
  },
  {
    id: "tiefentladung",
    title: "Tiefentladung beheben",
    description:
      "Wiederbelebung tiefentladener Akkuzellen. Der Akku wird schonend wieder auf Betriebsspannung gebracht und ausbalanciert.",
    icon: "bolt",
    preis: 150,
    leistungen: [
      "Zellspannungsprüfung",
      "Schonende Wiederaufladung",
      "Zell-Balancing",
      "Kapazitätstest nach Behandlung",
    ],
  },
]

/* ── Icons ──────────────────────────────────────────── */

function ServiceIcon({ icon, className }: { icon?: string; className?: string }) {
  const cls = className || "w-6 h-6"
  switch (icon) {
    case "cog":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case "plug":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case "bolt":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case "battery":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h14a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm18 4v2" />
        </svg>
      )
    case "wrench":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-2.5 2.5L19 5m0 0l2 2m-2-2v3.5M10 17l-7 7m7-7l-2.5 2.5M3 21l2-2" />
        </svg>
      )
    case "shield":
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    default:
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
  }
}

/* ── Component ──────────────────────────────────────── */

export default function RepairServices({
  product,
  brand,
  brandHandle,
  brandOverrides,
  voltage,
  repairSettings,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const countryCode = useParams().countryCode as string

  const services = repairSettings?.reparaturServiceItems ?? defaultServices
  const heading = repairSettings?.reparaturServicesHeading ?? "Welche Reparatur benötigen Sie?"
  const subheading = repairSettings?.reparaturServicesSubheading ?? "Wählen Sie den passenden Service. Alle Preise inkl. Rückversand und 12 Monate Garantie."

  const voltageNum = voltage ? parseInt(voltage.replace(/[^0-9]/g, ""), 10) : null
  const isOver60V = voltageNum !== null && voltageNum > 60

  const selectedService = services.find((s) => s.id === selectedId)

  const overrides = brandOverrides ?? {}

  /** Override-Preis (Cent) fuer einen Service, falls vorhanden. */
  function getOverrideCents(service: RepairServiceItem): number | null {
    const key = toBrandServiceKey(service.id, isOver60V)
    if (!key) return null
    const v = overrides[key]
    return typeof v === "number" ? v : null
  }

  function formatEur(cents: number): string {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100)
  }

  function getDisplayPrice(service: RepairServiceItem): string {
    const override = getOverrideCents(service)
    if (override != null) return formatEur(override)
    if (service.preisText) return service.preisText
    const price =
      isOver60V && service.preisUeber60V ? service.preisUeber60V : service.preis
    return `${price} €`
  }

  async function handleAddToCart(service: RepairServiceItem) {
    setIsAdding(true)
    setError(null)

    // Wenn eine Marke + Brand-Service-Key verfuegbar ist, laeuft das
    // Add-to-Cart ueber den Brand-Override-Endpoint — so greift der
    // eingetragene Preis aus dem Admin-UI auch im Warenkorb.
    const brandKey = toBrandServiceKey(service.id, isOver60V)
    if (brandHandle && brandKey) {
      const result = await addBrandServiceToCart({
        brandHandle,
        serviceKey: brandKey,
        countryCode,
      })
      if (result.success) {
        router.push(`/${countryCode}/cart`)
        return
      }
      setError(result.error || "Fehler beim Hinzufügen")
      setIsAdding(false)
      return
    }

    // Fallback: kein Brand-Kontext → normaler Service-Add
    const handle = SERVICE_HANDLE_MAP[service.id] || `service-${service.id}`
    const result = await addServiceToCart({
      serviceHandle: handle,
      countryCode,
      isOver60V,
    })

    if (result.success) {
      router.push(`/${countryCode}/cart`)
    } else {
      setError(result.error || "Fehler beim Hinzufügen")
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-grey-90 text-lg">{heading}</h3>
        <p className="text-sm text-grey-50 mt-1">{subheading}</p>
      </div>

      {/* Service Cards */}
      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedId === service.id
          const price = getDisplayPrice(service)

          return (
            <button
              key={service.id}
              onClick={() => setSelectedId(isSelected ? null : service.id)}
              className={`w-full text-left rounded-xl border-2 overflow-hidden transition-all ${
                isSelected
                  ? "border-brand-500 bg-brand-50/50 shadow-sm"
                  : service.highlight
                  ? "border-brand-200 bg-white hover:border-brand-300"
                  : "border-grey-15 bg-white hover:border-grey-30"
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-4 p-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? "bg-brand-500 text-white" : service.highlight ? "bg-brand-100 text-brand-600" : "bg-grey-5 text-grey-50"
                }`}>
                  <ServiceIcon icon={service.icon} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-grey-90">{service.title}</h4>
                    {service.highlight && !isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500 text-white">
                        Beliebt
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-grey-50 mt-0.5 line-clamp-1">{service.description}</p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-brand-600">{price}</p>
                  {getOverrideCents(service) != null && brand ? (
                    <p className="text-[10px] text-brand-500 font-semibold uppercase tracking-wide">
                      {brand}-Preis
                    </p>
                  ) : isOver60V && service.preisUeber60V && !service.preisText ? (
                    <p className="text-[10px] text-grey-40">&gt;60V Preis</p>
                  ) : null}
                </div>
              </div>

              {/* Expanded Content */}
              {isSelected && (
                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-brand-200 mt-0 pt-3">
                  <p className="text-sm text-grey-60">{service.description}</p>

                  {service.leistungen && service.leistungen.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-grey-60 uppercase tracking-wider">Inklusive:</p>
                      {service.leistungen.map((l, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-grey-60">{l}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {service.hinweis && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                      <p className="text-xs text-amber-800">{service.hinweis}</p>
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Order section (shown when a service is selected) */}
      {selectedService && (
        <div className="space-y-4 pt-2 border-t border-grey-10">
          <div className="bg-grey-5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-grey-90">Ausgewählter Service</p>
              <p className="font-bold text-brand-600 text-lg">{getDisplayPrice(selectedService)}</p>
            </div>
            <p className="text-sm text-grey-50">
              {selectedService.title} für {product.title}
              {voltage && ` (${voltage})`}
              {brand && ` – ${brand}`}
            </p>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {["12 Monate Garantie", "Kostenloser Rückversand", "Zahlung nach Reparatur", "3–5 Werktage"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-green-700">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={() => handleAddToCart(selectedService)}
            disabled={isAdding}
            className="w-full py-3.5 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Wird hinzugefügt…
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {selectedService.title} bestellen – {getDisplayPrice(selectedService)}
              </>
            )}
          </button>
        </div>
      )}

      {/* Info when nothing selected */}
      {!selectedService && (
        <p className="text-sm text-grey-40 text-center py-2">
          Wählen Sie einen Service oben aus, um fortzufahren.
        </p>
      )}
    </div>
  )
}
