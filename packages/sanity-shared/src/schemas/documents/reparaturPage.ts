import { defineField, defineType } from "sanity"

export const reparaturPage = defineType({
  name: "reparaturPage",
  title: "Reparatur-Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "icon", type: "string", title: "Emoji" },
            { name: "title", type: "string", title: "Titel" },
            { name: "price", type: "string", title: "Preis" },
            { name: "description", type: "text", title: "Beschreibung" },
            { name: "features", type: "array", title: "Features", of: [{ type: "string" }] },
            { name: "highlight", type: "boolean", title: "Hervorgehoben?" },
          ],
        },
      ],
    }),
    defineField({ name: "ctaHeading", title: "CTA Ueberschrift", type: "string" }),
    defineField({ name: "ctaText", title: "CTA Text", type: "text", rows: 2 }),
    defineField({ name: "ctaPrimary", title: "CTA Button", type: "cta" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Reparatur" }) },
})
