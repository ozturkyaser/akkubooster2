import { defineField, defineType } from "sanity"

export const ueberUnsPage = defineType({
  name: "ueberUnsPage",
  title: "Ueber uns",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Ueberschrift", type: "string" }),
    defineField({ name: "introText", title: "Intro-Text", type: "text", rows: 4 }),
    defineField({ name: "missionHeading", title: "Mission Ueberschrift", type: "string" }),
    defineField({ name: "missionText", title: "Mission Text", type: "text", rows: 4 }),
    defineField({
      name: "stats",
      title: "Statistiken",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", type: "string", title: "Wert" },
            { name: "label", type: "string", title: "Label" },
          ],
        },
      ],
    }),
    defineField({ name: "standortHeading", title: "Standort Ueberschrift", type: "string" }),
    defineField({ name: "standortText", title: "Standort Text", type: "text", rows: 3 }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Ueber uns" }) },
})
