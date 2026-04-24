import { defineField, defineType } from "sanity"

export const kiCheckPage = defineType({
  name: "kiCheckPage",
  title: "KI-Check Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({
      name: "steps",
      title: "Schritte",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "number", type: "string", title: "Nummer" },
            { name: "title", type: "string", title: "Titel" },
            { name: "description", type: "string", title: "Beschreibung" },
          ],
        },
      ],
    }),
    defineField({ name: "alternativeText", title: "Alternativ-Text", type: "string" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "KI-Check" }) },
})
