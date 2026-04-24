import { defineField, defineType } from "sanity"

export const legalPage = defineType({
  name: "legalPage",
  title: "Rechtstexte",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL-Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Inhalt",
      type: "blockContent",
    }),
    defineField({
      name: "isPlaceholder",
      title: "Platzhalter-Hinweis anzeigen?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({
      title: title || "Rechtstext",
      subtitle: `/legal/${slug}`,
    }),
  },
})
