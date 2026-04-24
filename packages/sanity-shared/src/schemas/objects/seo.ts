import { defineField, defineType } from "sanity"

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Meta Title",
      type: "string",
      validation: (r) => r.max(70).warning("Max 70 Zeichen fuer Google"),
    }),
    defineField({
      name: "description",
      title: "Meta Description",
      type: "text",
      rows: 3,
      validation: (r) => r.max(160).warning("Max 160 Zeichen fuer Google"),
    }),
  ],
})
