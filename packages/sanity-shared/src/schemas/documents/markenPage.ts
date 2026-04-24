import { defineField, defineType } from "sanity"

export const markenPage = defineType({
  name: "markenPage",
  title: "Marken-Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({
      name: "subheading",
      title: "Unterueberschrift ({{count}} fuer Anzahl)",
      type: "text",
      rows: 2,
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Marken-Uebersicht" }) },
})

export const symptomePage = defineType({
  name: "symptomePage",
  title: "Symptome-Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({ name: "ctaHeading", title: "CTA Ueberschrift", type: "string" }),
    defineField({ name: "ctaText", title: "CTA Text", type: "text", rows: 2 }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Symptome-Uebersicht" }) },
})
