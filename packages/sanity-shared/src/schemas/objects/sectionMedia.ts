import { defineField, defineType } from "sanity"

export const sectionMedia = defineType({
  name: "sectionMedia",
  title: "Hintergrund-Medium",
  type: "object",
  fields: [
    defineField({
      name: "mediaType",
      title: "Typ",
      type: "string",
      options: {
        list: [
          { title: "Keins", value: "none" },
          { title: "Bild", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "none",
    }),
    defineField({
      name: "image",
      title: "Hintergrundbild",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== "image",
    }),
    defineField({
      name: "videoUrl",
      title: "Video-URL (MP4)",
      type: "url",
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),
    defineField({
      name: "overlayOpacity",
      title: "Overlay-Deckkraft (%)",
      type: "number",
      description: "0 = kein Overlay, 80 = dunkel",
      validation: (r) => r.min(0).max(100),
      initialValue: 60,
    }),
  ],
})
