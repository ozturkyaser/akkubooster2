import { defineField, defineType } from "sanity"

export const b2bPage = defineType({
  name: "b2bPage",
  title: "B2B-Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({
      name: "benefits",
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
    defineField({ name: "ctaHeading", title: "CTA Ueberschrift", type: "string" }),
    defineField({ name: "ctaText", title: "CTA Text", type: "text", rows: 2 }),
    defineField({ name: "contactEmail", title: "Kontakt E-Mail", type: "string" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "B2B" }) },
})
