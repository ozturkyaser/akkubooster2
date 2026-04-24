import { defineField, defineType } from "sanity"

export const werkstattPage = defineType({
  name: "werkstattPage",
  title: "Werkstatt Berlin",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({ name: "address", title: "Adresse", type: "text", rows: 3 }),
    defineField({ name: "phone", title: "Telefon", type: "string" }),
    defineField({ name: "email", title: "E-Mail", type: "string" }),
    defineField({
      name: "openingHours",
      title: "Oeffnungszeiten",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "day", type: "string", title: "Tag(e)" },
            { name: "time", type: "string", title: "Uhrzeit" },
          ],
        },
      ],
    }),
    defineField({
      name: "features",
      title: "Werkstatt-Features",
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
    defineField({ name: "mapEmbedUrl", title: "Google Maps Embed URL", type: "url" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Werkstatt Berlin" }) },
})
