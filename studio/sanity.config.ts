import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { presentationTool } from "sanity/presentation"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "@akkubooster/sanity-shared/schemas"

// Singleton-Dokumente (nur ein Dokument pro Typ)
const singletonTypes = new Set([
  "homePage",
  "reparaturPage",
  "ersatzakkuPage",
  "kiCheckPage",
  "b2bPage",
  "werkstattPage",
  "ueberUnsPage",
  "kontaktPage",
  "faqPage",
  "vergleichPage",
  "ratgeberPage",
  "markenPage",
  "symptomePage",
  "repairSettings",
])

const singletonLabels: Record<string, string> = {
  homePage: "Startseite",
  reparaturPage: "Reparatur",
  ersatzakkuPage: "Ersatzakku",
  kiCheckPage: "KI-Check",
  b2bPage: "B2B",
  werkstattPage: "Werkstatt Berlin",
  ueberUnsPage: "Ueber uns",
  kontaktPage: "Kontakt",
  faqPage: "FAQ",
  vergleichPage: "Vergleich",
  ratgeberPage: "Ratgeber",
  markenPage: "Marken-Uebersicht",
  symptomePage: "Symptome-Uebersicht",
}

export default defineConfig({
  name: "akkubooster",
  title: "AkkuBooster CMS",

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "ep5dzepn",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Inhalte")
          .items([
            // === SEITEN (Singletons) ===
            S.listItem()
              .title("Seiten")
              .child(
                S.list()
                  .title("Seiten")
                  .items(
                    Array.from(singletonTypes).map((typeName) =>
                      S.listItem()
                        .title(singletonLabels[typeName] || typeName)
                        .child(
                          S.document()
                            .schemaType(typeName)
                            .documentId(typeName)
                        )
                    )
                  )
              ),

            S.divider(),

            // === RECHTSTEXTE ===
            S.listItem()
              .title("Rechtstexte")
              .schemaType("legalPage")
              .child(S.documentTypeList("legalPage").title("Rechtstexte")),

            // === RATGEBER-ARTIKEL ===
            S.listItem()
              .title("Ratgeber-Artikel")
              .schemaType("ratgeberArticle")
              .child(S.documentTypeList("ratgeberArticle").title("Ratgeber-Artikel")),

            // === MARKEN-DETAILSEITEN (pro Marke) ===
            S.listItem()
              .title("Marken-Detailseiten")
              .schemaType("brandContent")
              .child(
                S.documentTypeList("brandContent").title("Marken-Detailseiten")
              ),

            // === PRODUKT-DETAILSEITEN (pro Produkt) ===
            S.listItem()
              .title("Produkt-Detailseiten")
              .schemaType("productContent")
              .child(
                S.documentTypeList("productContent").title(
                  "Produkt-Detailseiten"
                )
              ),

            S.divider(),

            // === EINSTELLUNGEN ===
            S.listItem()
              .title("Einstellungen")
              .child(
                S.list()
                  .title("Einstellungen")
                  .items([
                    S.listItem()
                      .title("Reparatur-Einstellungen")
                      .child(
                        S.document()
                          .schemaType("repairSettings")
                          .documentId("repairSettings")
                      ),
                  ])
              ),
          ]),
    }),
    presentationTool({
      previewUrl: {
        origin: process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:8001",
        previewMode: {
          enable: "/api/sanity/draft",
        },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Verhindere "Create new" fuer Singletons
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Verhindere Duplikat-Erstellung fuer Singletons
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(
            ({ action }) =>
              action && ["publish", "discardChanges", "restore"].includes(action)
          )
        : input,
  },
})
