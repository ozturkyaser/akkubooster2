import { defineField, defineType } from "sanity"

export const kontaktPage = defineType({
  name: "kontaktPage",
  title: "Kontakt-Seite",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "subheading", title: "Unterueberschrift", type: "text", rows: 2 }),
    defineField({ name: "phone", title: "Telefon", type: "string" }),
    defineField({ name: "email", title: "E-Mail", type: "string" }),
    defineField({ name: "address", title: "Adresse", type: "text", rows: 3 }),
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
    defineField({ name: "noteText", title: "Hinweistext", type: "text", rows: 2 }),
    defineField({
      name: "quickHelp",
      title: "Schnellhilfe-Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "emoji", type: "string", title: "Emoji" },
            { name: "title", type: "string", title: "Titel" },
            { name: "description", type: "string", title: "Beschreibung" },
            { name: "href", type: "string", title: "Link" },
          ],
        },
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Kontakt" }) },
})
