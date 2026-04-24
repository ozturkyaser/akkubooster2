import { defineField, defineType } from "sanity"

/**
 * brandContent — pro Marke ein Dokument (kein Singleton).
 * Key: `handle` (entspricht dem Brand-Handle im Medusa-Backend, z.B. "bosch").
 * Ueberlagert die hardcoded Defaults und den DB-Content auf der
 * Seite `/[countryCode]/marken/[handle]`.
 */
export const brandContent = defineType({
  name: "brandContent",
  title: "Marken-Detailseite",
  type: "document",
  groups: [
    { name: "main", title: "Grundlagen", default: true },
    { name: "hero", title: "Hero" },
    { name: "intro", title: "Intro & Serien" },
    { name: "probleme", title: "Probleme" },
    { name: "faq", title: "FAQ" },
    { name: "testimonials", title: "Testimonials" },
    { name: "cta", title: "CTA" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "handle",
      title: "Brand-Handle (z.B. bosch, shimano, yamaha)",
      type: "string",
      description:
        "Muss exakt dem Handle der Marke im Backend entsprechen — slugifiziert, Kleinbuchstaben, Umlaute als ae/oe/ue/ss.",
      validation: (Rule) => Rule.required(),
      group: "main",
    }),
    defineField({
      name: "displayName",
      title: "Anzeigename (optional, Fallback: Backend-Name)",
      type: "string",
      group: "main",
    }),

    // ── Hero ──
    defineField({
      name: "heroTitle",
      title: "Hero Titel (optional)",
      type: "string",
      description: "Default: „{Name} E-Bike Akku Reparatur“",
      group: "hero",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Untertitel",
      type: "text",
      rows: 3,
      group: "hero",
    }),

    // ── Intro & Serien ──
    defineField({
      name: "introHeading",
      title: "Intro Ueberschrift",
      type: "string",
      description: "Default: „Ueber {Name} Akkus“",
      group: "intro",
    }),
    defineField({
      name: "intro",
      title: "Intro Text",
      type: "text",
      rows: 5,
      group: "intro",
    }),
    defineField({
      name: "series",
      title: "Akku-Serien",
      type: "array",
      group: "intro",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Name", type: "string" },
            { name: "capacity", title: "Kapazitaet", type: "string" },
            { name: "note", title: "Hinweis", type: "string" },
          ],
          preview: {
            select: { title: "name", subtitle: "capacity" },
          },
        },
      ],
    }),
    defineField({
      name: "compatibleBrands",
      title: "Kompatible Marken (Bike-Hersteller)",
      type: "array",
      of: [{ type: "string" }],
      group: "intro",
    }),

    // ── Probleme ──
    defineField({
      name: "problemeHeading",
      title: "Probleme Ueberschrift",
      type: "string",
      group: "probleme",
    }),
    defineField({
      name: "problems",
      title: "Typische Probleme",
      type: "array",
      group: "probleme",
      of: [
        {
          type: "object",
          fields: [
            { name: "icon", title: "Icon (Lucide Name)", type: "string" },
            { name: "title", title: "Titel", type: "string" },
            { name: "description", title: "Beschreibung", type: "text", rows: 3 },
            {
              name: "severity",
              title: "Schweregrad",
              type: "string",
              options: {
                list: [
                  { title: "Kritisch", value: "critical" },
                  { title: "Warnung", value: "warning" },
                  { title: "Info", value: "info" },
                ],
                layout: "radio",
              },
            },
          ],
          preview: { select: { title: "title", subtitle: "severity" } },
        },
      ],
    }),

    // ── FAQ ──
    defineField({
      name: "faqHeading",
      title: "FAQ Ueberschrift",
      type: "string",
      group: "faq",
    }),
    defineField({
      name: "faqs",
      title: "FAQ Eintraege",
      type: "array",
      group: "faq",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", title: "Frage", type: "string" },
            { name: "answer", title: "Antwort", type: "text", rows: 4 },
          ],
          preview: { select: { title: "question" } },
        },
      ],
    }),

    // ── Testimonials ──
    defineField({
      name: "testimonials",
      title: "Kundenstimmen",
      type: "array",
      group: "testimonials",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Name", type: "string" },
            { name: "location", title: "Ort", type: "string" },
            {
              name: "rating",
              title: "Bewertung (1–5)",
              type: "number",
              validation: (Rule) => Rule.min(1).max(5),
            },
            { name: "text", title: "Text", type: "text", rows: 4 },
          ],
          preview: { select: { title: "name", subtitle: "location" } },
        },
      ],
    }),

    // ── CTA ──
    defineField({
      name: "ctaHeading",
      title: "CTA Ueberschrift",
      type: "string",
      group: "cta",
    }),
    defineField({
      name: "ctaSubheading",
      title: "CTA Untertitel",
      type: "text",
      rows: 2,
      group: "cta",
    }),
    defineField({
      name: "ctaPrimaryLabel",
      title: "CTA Primaer Label",
      type: "string",
      group: "cta",
    }),
    defineField({
      name: "ctaSecondaryLabel",
      title: "CTA Sekundaer Label",
      type: "string",
      group: "cta",
    }),

    // ── SEO ──
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "displayName", subtitle: "handle" },
    prepare: ({ title, subtitle }) => ({
      title: title || subtitle || "Marke",
      subtitle: subtitle ? `handle: ${subtitle}` : undefined,
    }),
  },
})
