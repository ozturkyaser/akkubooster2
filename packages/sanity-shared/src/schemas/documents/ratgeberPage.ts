import { defineField, defineType } from "sanity"

export const ratgeberPage = defineType({
  name: "ratgeberPage",
  title: "Ratgeber-Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Ratgeber" }) },
})

export const ratgeberArticle = defineType({
  name: "ratgeberArticle",
  title: "Ratgeber-Artikel",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "URL-Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "excerpt", title: "Kurzbeschreibung", type: "text", rows: 3 }),
    defineField({ name: "coverImage", title: "Titelbild", type: "image", options: { hotspot: true } }),
    defineField({ name: "body", title: "Inhalt", type: "blockContent" }),
    defineField({ name: "publishedAt", title: "Veroeffentlicht am", type: "datetime" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", date: "publishedAt" },
    prepare: ({ title, date }) => ({
      title,
      subtitle: date ? new Date(date).toLocaleDateString("de-DE") : "Entwurf",
    }),
  },
})
