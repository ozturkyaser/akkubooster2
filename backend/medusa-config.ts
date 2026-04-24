import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "./src/modules/brand",
    },
    {
      resolve: "./src/modules/vehicle-model",
    },
    {
      resolve: "./src/modules/symptom",
    },
    {
      resolve: "./src/modules/repair-order",
    },
    // ── Payment Providers ──────────────────────────
    {
      key: Modules.PAYMENT,
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          // Stripe: Kreditkarte, SEPA-Lastschrift, iDeal, Bancontact, etc.
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            },
          },
          // PayPal
          {
            resolve: "@alphabite/medusa-paypal/providers/paypal",
            id: "paypal",
            options: {
              clientId: process.env.PAYPAL_CLIENT_ID,
              clientSecret: process.env.PAYPAL_CLIENT_SECRET,
              sandbox: process.env.PAYPAL_SANDBOX === "true",
            },
          },
        ],
      },
    },
  ],
})
