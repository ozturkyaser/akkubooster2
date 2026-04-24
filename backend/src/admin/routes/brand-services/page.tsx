import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CurrencyDollar } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Input,
  Button,
  Table,
  Badge,
  toast,
  Toaster,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type ServiceKey =
  | "diagnose"
  | "bms_standard"
  | "bms_high_voltage"
  | "zellentausch_from"
  | "balancing"
  | "ladebuchse"
  | "tiefentladung"

type Brand = {
  id: string
  handle: string
  name: string
  logo_url: string | null
  service_prices: Partial<Record<ServiceKey, number>> | null
}

const SERVICE_KEYS: { key: ServiceKey; label: string }[] = [
  { key: "diagnose", label: "Diagnose" },
  { key: "bms_standard", label: "BMS ≤60V" },
  { key: "bms_high_voltage", label: "BMS >60V" },
  { key: "zellentausch_from", label: "Zellentausch ab" },
  { key: "balancing", label: "Balancing" },
  { key: "ladebuchse", label: "Ladebuchse" },
  { key: "tiefentladung", label: "Tiefentladung" },
]

// Cent → Euro-String (editierbar)
const centToEuro = (v?: number | null): string =>
  typeof v === "number" ? (v / 100).toFixed(2).replace(/\.00$/, "") : ""

// Euro-String → Cent (oder null wenn leer/ungueltig)
const euroToCent = (v: string): number | null => {
  const trimmed = v.trim().replace(",", ".")
  if (!trimmed) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

const BrandServicesPage = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  // Draft-State pro Brand: { [brandId]: { [key]: euroString } }
  const [draft, setDraft] = useState<
    Record<string, Partial<Record<ServiceKey, string>>>
  >({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const loadBrands = async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/brands?limit=500", {
        credentials: "include",
      })
      const data = await res.json()
      setBrands(data.brands || [])
      // Initialisiere Draft mit aktuellen Werten
      const d: Record<string, Partial<Record<ServiceKey, string>>> = {}
      for (const b of data.brands || []) {
        d[b.id] = {}
        for (const { key } of SERVICE_KEYS) {
          d[b.id][key] = centToEuro(b.service_prices?.[key])
        }
      }
      setDraft(d)
    } catch (e: any) {
      toast.error("Marken konnten nicht geladen werden: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrands()
  }, [])

  const filtered = useMemo(() => {
    if (!filter.trim()) return brands
    const q = filter.toLowerCase()
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) || b.handle.toLowerCase().includes(q)
    )
  }, [brands, filter])

  const isDirty = (brand: Brand): boolean => {
    const d = draft[brand.id] || {}
    for (const { key } of SERVICE_KEYS) {
      const current = centToEuro(brand.service_prices?.[key])
      const next = d[key] ?? ""
      if (current !== next) return true
    }
    return false
  }

  const handleSave = async (brand: Brand) => {
    const d = draft[brand.id] || {}
    const service_prices: Partial<Record<ServiceKey, number>> = {}
    for (const { key } of SERVICE_KEYS) {
      const raw = d[key] ?? ""
      if (!raw.trim()) continue
      const cent = euroToCent(raw)
      if (cent === null) {
        toast.error(`${brand.name}: Ungueltiger Preis bei '${key}'`)
        return
      }
      service_prices[key] = cent
    }

    setSaving((s) => ({ ...s, [brand.id]: true }))
    try {
      const res = await fetch(`/admin/brands/${brand.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_prices: Object.keys(service_prices).length
            ? service_prices
            : null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      const { brand: updated } = await res.json()
      setBrands((list) =>
        list.map((b) => (b.id === brand.id ? { ...b, ...updated } : b))
      )
      toast.success(`${brand.name} gespeichert`)
    } catch (e: any) {
      toast.error("Speichern fehlgeschlagen: " + e.message)
    } finally {
      setSaving((s) => ({ ...s, [brand.id]: false }))
    }
  }

  const handleReset = (brand: Brand) => {
    setDraft((d) => ({
      ...d,
      [brand.id]: Object.fromEntries(
        SERVICE_KEYS.map(({ key }) => [
          key,
          centToEuro(brand.service_prices?.[key]),
        ])
      ),
    }))
  }

  const handleClear = async (brand: Brand) => {
    if (!confirm(`Alle Service-Preise fuer '${brand.name}' loeschen?`)) return
    setSaving((s) => ({ ...s, [brand.id]: true }))
    try {
      const res = await fetch(`/admin/brands/${brand.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_prices: null }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { brand: updated } = await res.json()
      setBrands((list) =>
        list.map((b) => (b.id === brand.id ? { ...b, ...updated } : b))
      )
      setDraft((d) => ({
        ...d,
        [brand.id]: Object.fromEntries(SERVICE_KEYS.map(({ key }) => [key, ""])),
      }))
      toast.success(`${brand.name}: Preise geloescht`)
    } catch (e: any) {
      toast.error("Loeschen fehlgeschlagen: " + e.message)
    } finally {
      setSaving((s) => ({ ...s, [brand.id]: false }))
    }
  }

  return (
    <Container>
      <Toaster />
      <div className="flex flex-col gap-y-4">
        <div>
          <Heading>Marken Service-Preise</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Ueberschreibe Service-Preise pro Marke. Leere Felder = Standard-Preis
            wird verwendet. Alle Preise in Euro.
          </Text>
        </div>

        <div className="flex items-center gap-x-2">
          <Input
            placeholder="Marke suchen..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="secondary" size="small" onClick={loadBrands}>
            Neu laden
          </Button>
          <Text size="xsmall" className="text-ui-fg-muted ml-auto">
            {filtered.length} / {brands.length} Marken
          </Text>
        </div>

        {loading ? (
          <Text>Laedt...</Text>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Marke</Table.HeaderCell>
                  {SERVICE_KEYS.map(({ key, label }) => (
                    <Table.HeaderCell key={key}>{label}</Table.HeaderCell>
                  ))}
                  <Table.HeaderCell>Aktionen</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered.map((brand) => {
                  const dirty = isDirty(brand)
                  const busy = !!saving[brand.id]
                  const hasOverrides =
                    brand.service_prices &&
                    Object.keys(brand.service_prices).length > 0
                  return (
                    <Table.Row key={brand.id}>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-x-2">
                            <span className="font-medium">{brand.name}</span>
                            {hasOverrides && (
                              <Badge size="2xsmall" color="green">
                                aktiv
                              </Badge>
                            )}
                          </div>
                          <Text
                            size="xsmall"
                            className="text-ui-fg-muted"
                          >
                            {brand.handle}
                          </Text>
                        </div>
                      </Table.Cell>
                      {SERVICE_KEYS.map(({ key }) => (
                        <Table.Cell key={key}>
                          <Input
                            size="small"
                            placeholder="—"
                            value={draft[brand.id]?.[key] ?? ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                [brand.id]: {
                                  ...d[brand.id],
                                  [key]: e.target.value,
                                },
                              }))
                            }
                            style={{ width: 80 }}
                          />
                        </Table.Cell>
                      ))}
                      <Table.Cell>
                        <div className="flex gap-x-1">
                          <Button
                            size="small"
                            variant="primary"
                            disabled={!dirty || busy}
                            onClick={() => handleSave(brand)}
                          >
                            {busy ? "..." : "Speichern"}
                          </Button>
                          {dirty && (
                            <Button
                              size="small"
                              variant="secondary"
                              disabled={busy}
                              onClick={() => handleReset(brand)}
                            >
                              Reset
                            </Button>
                          )}
                          {hasOverrides && !dirty && (
                            <Button
                              size="small"
                              variant="danger"
                              disabled={busy}
                              onClick={() => handleClear(brand)}
                            >
                              Loeschen
                            </Button>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )
                })}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Service-Preise",
  icon: CurrencyDollar,
})

export default BrandServicesPage
