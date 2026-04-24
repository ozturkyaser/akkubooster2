import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  Select,
  Badge,
  toast,
  Toaster,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

/* ── Types ─────────────────────────────────────────────── */

type Series = { name: string; capacity: string; note: string }

type Problem = {
  icon: string
  title: string
  description: string
  severity: "critical" | "warning" | "info"
}

type Faq = { question: string; answer: string }

type Testimonial = {
  name: string
  location: string
  rating: number
  text: string
}

type BrandContent = {
  intro: string
  series: Series[]
  compatibleBrands: string[]
  problems: Problem[]
  faqs: Faq[]
  testimonials: Testimonial[]
}

type Brand = {
  id: string
  handle: string
  name: string
  content: BrandContent | null
}

const EMPTY_CONTENT: BrandContent = {
  intro: "",
  series: [],
  compatibleBrands: [],
  problems: [],
  faqs: [],
  testimonials: [],
}

const SEVERITIES: Problem["severity"][] = ["critical", "warning", "info"]

/* ── Page ──────────────────────────────────────────────── */

const BrandContentPage = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<BrandContent>(EMPTY_CONTENT)
  const [saving, setSaving] = useState(false)

  const loadBrands = async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/brands?limit=500", {
        credentials: "include",
      })
      const data = await res.json()
      setBrands(data.brands || [])
      if (!selectedId && data.brands?.length) {
        setSelectedId(data.brands[0].id)
      }
    } catch (e: any) {
      toast.error("Marken konnten nicht geladen werden: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrands()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    if (!filter.trim()) return brands
    const q = filter.toLowerCase()
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) || b.handle.toLowerCase().includes(q)
    )
  }, [brands, filter])

  const selected = useMemo(
    () => brands.find((b) => b.id === selectedId) || null,
    [brands, selectedId]
  )

  // Bei Brand-Wechsel den Draft initialisieren
  useEffect(() => {
    if (!selected) return
    const c = selected.content || ({} as Partial<BrandContent>)
    setDraft({
      intro: c.intro ?? "",
      series: Array.isArray(c.series) ? c.series : [],
      compatibleBrands: Array.isArray(c.compatibleBrands)
        ? c.compatibleBrands
        : [],
      problems: Array.isArray(c.problems) ? c.problems : [],
      faqs: Array.isArray(c.faqs) ? c.faqs : [],
      testimonials: Array.isArray(c.testimonials) ? c.testimonials : [],
    })
  }, [selected?.id])

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    try {
      // Leere Felder komplett entfernen → schickt null bei allem leer
      const cleaned: BrandContent = {
        intro: draft.intro.trim(),
        series: draft.series.filter((s) => s.name.trim()),
        compatibleBrands: draft.compatibleBrands
          .map((b) => b.trim())
          .filter(Boolean),
        problems: draft.problems.filter((p) => p.title.trim()),
        faqs: draft.faqs.filter((f) => f.question.trim()),
        testimonials: draft.testimonials.filter((t) => t.name.trim()),
      }
      const allEmpty =
        !cleaned.intro &&
        !cleaned.series.length &&
        !cleaned.compatibleBrands.length &&
        !cleaned.problems.length &&
        !cleaned.faqs.length &&
        !cleaned.testimonials.length

      const res = await fetch(`/admin/brands/${selected.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: allEmpty ? null : cleaned }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      const { brand: updated } = await res.json()
      setBrands((list) =>
        list.map((b) => (b.id === selected.id ? { ...b, ...updated } : b))
      )
      toast.success(`${selected.name}: Inhalt gespeichert`)
    } catch (e: any) {
      toast.error("Speichern fehlgeschlagen: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  const hasContent = (b: Brand) => {
    const c = b.content
    if (!c) return false
    return !!(
      c.intro?.trim() ||
      c.series?.length ||
      c.compatibleBrands?.length ||
      c.problems?.length ||
      c.faqs?.length ||
      c.testimonials?.length
    )
  }

  return (
    <Container>
      <Toaster />
      <div className="flex flex-col gap-y-4">
        <div>
          <Heading>Marken-Inhalte</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Redaktioneller Inhalt der Marken-Detailseiten (Intro, Serien,
            kompatible Marken, typische Probleme, FAQs, Testimonials). Wenn
            leer, werden Fallback-Texte verwendet.
          </Text>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* ── Brand-Liste ── */}
          <div className="col-span-12 md:col-span-4">
            <div className="flex flex-col gap-y-2">
              <Input
                placeholder="Marke suchen..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <div className="border border-ui-border-base rounded-md max-h-[70vh] overflow-y-auto">
                {loading ? (
                  <div className="p-3 text-sm">Laedt...</div>
                ) : (
                  filtered.map((b) => {
                    const active = b.id === selectedId
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedId(b.id)}
                        className={`w-full text-left px-3 py-2 border-b border-ui-border-base flex items-center justify-between hover:bg-ui-bg-base-hover ${
                          active ? "bg-ui-bg-highlight" : ""
                        }`}
                      >
                        <div>
                          <div className="font-medium text-sm">{b.name}</div>
                          <div className="text-xs text-ui-fg-muted">
                            {b.handle}
                          </div>
                        </div>
                        {hasContent(b) && (
                          <Badge size="2xsmall" color="green">
                            gefuellt
                          </Badge>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── Editor ── */}
          <div className="col-span-12 md:col-span-8">
            {!selected ? (
              <Text>Bitte eine Marke auswaehlen.</Text>
            ) : (
              <div className="flex flex-col gap-y-6">
                <div className="flex items-center justify-between">
                  <Heading level="h2">{selected.name}</Heading>
                  <Button
                    variant="primary"
                    size="small"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? "Speichert..." : "Speichern"}
                  </Button>
                </div>

                {/* Intro */}
                <Section title="Intro-Text">
                  <Textarea
                    rows={4}
                    value={draft.intro}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, intro: e.target.value }))
                    }
                    placeholder="Kurzer Fliesstext ueber die Marke (2-4 Saetze)"
                  />
                </Section>

                {/* Serien */}
                <Section
                  title="Serien / Akku-Modelle"
                  onAdd={() =>
                    setDraft((d) => ({
                      ...d,
                      series: [...d.series, { name: "", capacity: "", note: "" }],
                    }))
                  }
                >
                  {draft.series.map((s, i) => (
                    <Row
                      key={i}
                      onRemove={() =>
                        setDraft((d) => ({
                          ...d,
                          series: d.series.filter((_, j) => j !== i),
                        }))
                      }
                    >
                      <Input
                        placeholder="Name (z.B. PowerTube)"
                        value={s.name}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            series: d.series.map((x, j) =>
                              j === i ? { ...x, name: e.target.value } : x
                            ),
                          }))
                        }
                      />
                      <Input
                        placeholder="Kapazitaet (z.B. 400 – 750 Wh)"
                        value={s.capacity}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            series: d.series.map((x, j) =>
                              j === i ? { ...x, capacity: e.target.value } : x
                            ),
                          }))
                        }
                      />
                      <Input
                        placeholder="Notiz (z.B. Integriert)"
                        value={s.note}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            series: d.series.map((x, j) =>
                              j === i ? { ...x, note: e.target.value } : x
                            ),
                          }))
                        }
                      />
                    </Row>
                  ))}
                </Section>

                {/* Kompatible Marken */}
                <Section title="Kompatible Fahrrad-Marken">
                  <Textarea
                    rows={3}
                    value={draft.compatibleBrands.join(", ")}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        compatibleBrands: e.target.value
                          .split(",")
                          .map((x) => x.trim())
                          .filter(Boolean),
                      }))
                    }
                    placeholder="Komma-getrennt, z.B. Kalkhoff, Haibike, Trek"
                  />
                </Section>

                {/* Probleme */}
                <Section
                  title="Typische Probleme"
                  onAdd={() =>
                    setDraft((d) => ({
                      ...d,
                      problems: [
                        ...d.problems,
                        {
                          icon: "BatteryWarning",
                          title: "",
                          description: "",
                          severity: "warning",
                        },
                      ],
                    }))
                  }
                >
                  {draft.problems.map((p, i) => (
                    <Row
                      key={i}
                      onRemove={() =>
                        setDraft((d) => ({
                          ...d,
                          problems: d.problems.filter((_, j) => j !== i),
                        }))
                      }
                    >
                      <Input
                        placeholder="Icon-Name (Lucide)"
                        value={p.icon}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            problems: d.problems.map((x, j) =>
                              j === i ? { ...x, icon: e.target.value } : x
                            ),
                          }))
                        }
                      />
                      <Input
                        placeholder="Titel"
                        value={p.title}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            problems: d.problems.map((x, j) =>
                              j === i ? { ...x, title: e.target.value } : x
                            ),
                          }))
                        }
                      />
                      <Input
                        placeholder="Beschreibung"
                        value={p.description}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            problems: d.problems.map((x, j) =>
                              j === i
                                ? { ...x, description: e.target.value }
                                : x
                            ),
                          }))
                        }
                      />
                      <Select
                        value={p.severity}
                        onValueChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            problems: d.problems.map((x, j) =>
                              j === i
                                ? { ...x, severity: v as Problem["severity"] }
                                : x
                            ),
                          }))
                        }
                      >
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {SEVERITIES.map((s) => (
                            <Select.Item key={s} value={s}>
                              {s}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Row>
                  ))}
                </Section>

                {/* FAQs */}
                <Section
                  title="FAQs"
                  onAdd={() =>
                    setDraft((d) => ({
                      ...d,
                      faqs: [...d.faqs, { question: "", answer: "" }],
                    }))
                  }
                >
                  {draft.faqs.map((f, i) => (
                    <Row
                      key={i}
                      vertical
                      onRemove={() =>
                        setDraft((d) => ({
                          ...d,
                          faqs: d.faqs.filter((_, j) => j !== i),
                        }))
                      }
                    >
                      <Input
                        placeholder="Frage"
                        value={f.question}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            faqs: d.faqs.map((x, j) =>
                              j === i ? { ...x, question: e.target.value } : x
                            ),
                          }))
                        }
                      />
                      <Textarea
                        rows={3}
                        placeholder="Antwort"
                        value={f.answer}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            faqs: d.faqs.map((x, j) =>
                              j === i ? { ...x, answer: e.target.value } : x
                            ),
                          }))
                        }
                      />
                    </Row>
                  ))}
                </Section>

                {/* Testimonials */}
                <Section
                  title="Testimonials / Kundenstimmen"
                  onAdd={() =>
                    setDraft((d) => ({
                      ...d,
                      testimonials: [
                        ...d.testimonials,
                        { name: "", location: "", rating: 5, text: "" },
                      ],
                    }))
                  }
                >
                  {draft.testimonials.map((t, i) => (
                    <Row
                      key={i}
                      vertical
                      onRemove={() =>
                        setDraft((d) => ({
                          ...d,
                          testimonials: d.testimonials.filter((_, j) => j !== i),
                        }))
                      }
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Name"
                          value={t.name}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              testimonials: d.testimonials.map((x, j) =>
                                j === i ? { ...x, name: e.target.value } : x
                              ),
                            }))
                          }
                        />
                        <Input
                          placeholder="Ort"
                          value={t.location}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              testimonials: d.testimonials.map((x, j) =>
                                j === i
                                  ? { ...x, location: e.target.value }
                                  : x
                              ),
                            }))
                          }
                        />
                        <Input
                          placeholder="Rating 1-5"
                          type="number"
                          min={1}
                          max={5}
                          value={t.rating}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              testimonials: d.testimonials.map((x, j) =>
                                j === i
                                  ? {
                                      ...x,
                                      rating: Math.max(
                                        1,
                                        Math.min(5, Number(e.target.value) || 5)
                                      ),
                                    }
                                  : x
                              ),
                            }))
                          }
                        />
                      </div>
                      <Textarea
                        rows={3}
                        placeholder="Kommentar"
                        value={t.text}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            testimonials: d.testimonials.map((x, j) =>
                              j === i ? { ...x, text: e.target.value } : x
                            ),
                          }))
                        }
                      />
                    </Row>
                  ))}
                </Section>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {saving ? "Speichert..." : "Speichern"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

/* ── Helper-Komponenten ────────────────────────────────── */

function Section({
  title,
  children,
  onAdd,
}: {
  title: string
  children: React.ReactNode
  onAdd?: () => void
}) {
  return (
    <div className="border border-ui-border-base rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <Text weight="plus">{title}</Text>
        {onAdd && (
          <Button size="small" variant="secondary" onClick={onAdd}>
            + Hinzufuegen
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-y-2">{children}</div>
    </div>
  )
}

function Row({
  children,
  onRemove,
  vertical,
}: {
  children: React.ReactNode
  onRemove: () => void
  vertical?: boolean
}) {
  return (
    <div className="flex items-start gap-2 border-b border-ui-border-base pb-2">
      <div
        className={`flex-1 ${
          vertical ? "flex flex-col gap-y-2" : "grid grid-cols-4 gap-2"
        }`}
      >
        {children}
      </div>
      <Button
        size="small"
        variant="secondary"
        onClick={onRemove}
        type="button"
      >
        X
      </Button>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Marken-Inhalte",
  icon: DocumentText,
})

export default BrandContentPage
