import { defineField, defineType } from "sanity"

export const cta = defineType({
  name: "cta",
  title: "Call to Action",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Button Text",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "variant",
      title: "Variante",
      type: "string",
      options: {
        list: [
          { title: "Primary", value: "primary" },
          { title: "Secondary", value: "secondary" },
        ],
      },
      initialValue: "primary",
    }),
  ],
})
