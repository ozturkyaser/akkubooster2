import { defineField, defineType } from "sanity"

export const faqPage = defineType({
  name: "faqPage",
  title: "FAQ-Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({
      name: "categories",
      title: "FAQ-Kategorien",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "categoryTitle", type: "string", title: "Kategorie" },
            {
              name: "items",
              type: "array",
              title: "Fragen",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "question", type: "string", title: "Frage" },
                    { name: "answer", type: "text", title: "Antwort" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "FAQ" }) },
})
