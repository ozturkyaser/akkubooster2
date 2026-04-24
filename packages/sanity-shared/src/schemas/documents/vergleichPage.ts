import { defineField, defineType } from "sanity"

export const vergleichPage = defineType({
  name: "vergleichPage",
  title: "Vergleich-Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({
      name: "comparisonRows",
      title: "Vergleichstabelle",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "aspect", type: "string", title: "Aspekt" },
            { name: "repair", type: "string", title: "Reparatur" },
            { name: "newBuy", type: "string", title: "Neukauf" },
            { name: "winner", type: "string", title: "Gewinner", options: { list: ["repair", "newBuy", "draw"] } },
          ],
        },
      ],
    }),
    defineField({ name: "conclusionHeading", title: "Fazit Ueberschrift", type: "string" }),
    defineField({ name: "conclusionText", title: "Fazit Text", type: "text", rows: 4 }),
    defineField({ name: "ctaPrimary", title: "CTA", type: "cta" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Vergleich" }) },
})
