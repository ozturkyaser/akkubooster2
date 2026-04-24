import { defineField, defineType } from "sanity"

/**
 * productContent — pro Produkt ein Dokument (kein Singleton).
 * Key: `handle` (entspricht dem Medusa-Produkt-Handle, z.B.
 * "bosch-powerpack-300-36v-active-performance-gepacktrager-zellentausch").
 *
 * Ueberlagert globale repairSettings-Defaults fuer einzelne Produkte.
 * Alle Felder sind optional — nur gesetzte Felder werden angezeigt.
 */
export const productContent = defineType({
  name: "productContent",
  title: "Produkt-Detailseite",
  type: "document",
  groups: [
    { name: "main", title: "Grundlagen", default: true },
    { name: "header", title: "Header / Hero" },
    { name: "description", title: "Beschreibung" },
    { name: "services", title: "Services-Uebersicht" },
    { name: "sidebar", title: "Sidebar" },
    { name: "trust", title: "Trust / Prozess" },
    { name: "faq", title: "FAQ" },
    { name: "cta", title: "CTA" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "handle",
      title: "Produkt-Handle",
      type: "string",
      description:
        "Muss exakt dem Produkt-Handle im Medusa-Backend entsprechen, z.B. \"bosch-powerpack-300-36v-active-performance-gepacktrager-zellentausch\".",
      validation: (Rule) => Rule.required(),
      group: "main",
    }),
    defineField({
      name: "internalTitle",
      title: "Interner Titel (fuer Studio-Uebersicht)",
      type: "string",
      group: "main",
    }),

    // ── Header ──
    defineField({
      name: "titleOverride",
      title: "Titel (optional, ueberschreibt Produkt-Titel)",
      type: "string",
      group: "header",
    }),
    defineField({
      name: "subtitle",
      title: "Untertitel / Hero-Zusatz",
      type: "text",
      rows: 2,
      group: "header",
    }),
    defineField({
      name: "shortDescription",
      title: "Kurzbeschreibung (Hero)",
      type: "text",
      rows: 4,
      group: "header",
    }),

    // ── Description ──
    defineField({
      name: "descriptionHeading",
      title: "Beschreibung Ueberschrift",
      type: "string",
      group: "description",
    }),
    defineField({
      name: "description",
      title: "Beschreibung (Rich Text)",
      type: "array",
      of: [{ type: "block" }],
      group: "description",
    }),
    defineField({
      name: "descriptionPlain",
      title: "Beschreibung (Plain Text, optional)",
      type: "text",
      rows: 6,
      description:
        "Falls die Beschreibung nur als einfacher Text gepflegt werden soll — wird statt dem Rich-Text ausgegeben, wenn gesetzt.",
      group: "description",
    }),

    // ── Services ──
    defineField({
      name: "serviceCardsHeading",
      title: "Services Ueberschrift",
      type: "string",
      group: "services",
    }),
    defineField({
      name: "serviceCards",
      title: "Service-Karten",
      type: "array",
      group: "services",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Titel", type: "string" },
            { name: "preisText", title: "Preis-Text", type: "string" },
            { name: "description", title: "Beschreibung", type: "text", rows: 3 },
            {
              name: "color",
              title: "Farbe",
              type: "string",
              options: {
                list: [
                  { title: "Gruen", value: "green" },
                  { title: "Gelb", value: "amber" },
                  { title: "Blau", value: "blue" },
                ],
                layout: "radio",
              },
            },
          ],
          preview: { select: { title: "title", subtitle: "preisText" } },
        },
      ],
    }),
    defineField({
      name: "symptomTags",
      title: "Symptom-Tags",
      type: "array",
      of: [{ type: "string" }],
      group: "services",
    }),

    // ── Sidebar ──
    defineField({
      name: "sidebarHeading",
      title: "Sidebar Ueberschrift",
      type: "string",
      group: "sidebar",
    }),
    defineField({
      name: "sidebarPreise",
      title: "Sidebar Preise",
      type: "array",
      group: "sidebar",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "preis", title: "Preis", type: "string" },
            { name: "highlight", title: "Hervorheben", type: "boolean" },
          ],
          preview: { select: { title: "label", subtitle: "preis" } },
        },
      ],
    }),
    defineField({
      name: "sidebarHinweis",
      title: "Sidebar Hinweis",
      type: "text",
      rows: 3,
      group: "sidebar",
    }),
    defineField({
      name: "nichtReparierbarHeading",
      title: "Nicht reparierbar Ueberschrift",
      type: "string",
      group: "sidebar",
    }),
    defineField({
      name: "nichtReparierbarItems",
      title: "Nicht reparierbar Punkte",
      type: "array",
      of: [{ type: "string" }],
      group: "sidebar",
    }),

    // ── Trust / Prozess ──
    defineField({
      name: "trustBadges",
      title: "Trust Badges",
      type: "array",
      group: "trust",
      of: [
        {
          type: "object",
          fields: [
            { name: "icon", title: "Icon", type: "string" },
            { name: "title", title: "Titel", type: "string" },
            { name: "description", title: "Beschreibung", type: "string" },
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        },
      ],
    }),
    defineField({
      name: "processHeading",
      title: "Prozess Ueberschrift",
      type: "string",
      group: "trust",
    }),
    defineField({
      name: "processSteps",
      title: "Prozess-Schritte",
      type: "array",
      group: "trust",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Titel", type: "string" },
            { name: "description", title: "Beschreibung", type: "string" },
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        },
      ],
    }),
    defineField({
      name: "garantieTitle",
      title: "Garantie Titel",
      type: "string",
      group: "trust",
    }),
    defineField({
      name: "garantieText",
      title: "Garantie Text",
      type: "text",
      rows: 3,
      group: "trust",
    }),

    // ── FAQ ──
    defineField({
      name: "faqHeading",
      title: "FAQ Ueberschrift",
      type: "string",
      group: "faq",
    }),
    defineField({
      name: "faqItems",
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
    defineField({
      name: "ctaSecondaryHref",
      title: "CTA Sekundaer Link",
      type: "string",
      group: "cta",
    }),

    // ── SEO ──
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "internalTitle", subtitle: "handle" },
    prepare: ({ title, subtitle }) => ({
      title: title || subtitle || "Produkt",
      subtitle: subtitle ? `handle: ${subtitle}` : undefined,
    }),
  },
})
