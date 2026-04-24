import { defineField, defineType } from "sanity"

export const ersatzakkuPage = defineType({
  name: "ersatzakkuPage",
  title: "Ersatzakku-Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({
      name: "advantages",
      title: "Vorteile",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "icon", type: "string", title: "Emoji" },
            { name: "title", type: "string", title: "Titel" },
            { name: "description", type: "text", title: "Beschreibung" },
          ],
        },
      ],
    }),
    defineField({ name: "comparisonHeading", title: "Vergleich Ueberschrift", type: "string" }),
    defineField({ name: "comparisonText", title: "Vergleich Text", type: "text", rows: 3 }),
    defineField({ name: "ctaPrimary", title: "CTA Button", type: "cta" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Ersatzakku" }) },
})
