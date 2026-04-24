"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import DiagnoseWizard from "@modules/products/components/diagnose-wizard"
import RepairServices from "@modules/products/components/repair-services"
import { RepairSettingsData } from "@lib/sanity/queries"

type ServiceKey =
  | "diagnose"
  | "bms_standard"
  | "bms_high_voltage"
  | "zellentausch_from"
  | "balancing"
  | "ladebuchse"
  | "tiefentladung"

type ServiceTabsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  brand: string | null
  brandHandle?: string | null
  brandOverrides?: Partial<Record<ServiceKey, number>>
  voltage: string | null
  repairSettings?: RepairSettingsData | null
}

type Tab = "zellentausch" | "diagnose" | "reparatur"

const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] =
  [
    {
      id: "zellentausch",
      label: "Zellentausch",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      desc: "Neue Zellen, volle Kapazität",
    },
    {
      id: "diagnose",
      label: "Diagnose",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      desc: "Ursache finden, Kosten erfahren",
    },
    {
      id: "reparatur",
      label: "Reparatur",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      desc: "BMS, Ladebuchse, Tiefentladung",
    },
  ]

export default function ServiceTabs({
  product,
  region,
  brand,
  brandHandle,
  brandOverrides,
  voltage,
  repairSettings,
}: ServiceTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("zellentausch")

  return (
    <div>
      {/* Tab Headers */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                isActive
                  ? "border-brand-500 bg-brand-50 text-brand-600"
                  : "border-grey-20 bg-white text-grey-50 hover:border-grey-30 hover:bg-grey-5"
              }`}
            >
              <div
                className={`${
                  isActive ? "text-brand-500" : "text-grey-40"
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-sm font-semibold">{tab.label}</span>
              <span className="text-[11px] leading-tight hidden sm:block">
                {tab.desc}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "zellentausch" && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Zellentausch:</strong>{" "}
                {repairSettings?.zellentauschInfo ?? "Wir ersetzen alle Zellen Ihres Akkus mit hochwertigen Markenzellen (Samsung, LG, Panasonic). Wählen Sie die gewünschte Kapazität."}
              </p>
            </div>
            <ProductActions product={product} region={region} />
          </div>
        )}

        {activeTab === "diagnose" && (
          <DiagnoseWizard
            product={product}
            brand={brand}
            voltage={voltage}
            repairSettings={repairSettings}
          />
        )}

        {activeTab === "reparatur" && (
          <RepairServices
            product={product}
            brand={brand}
            brandHandle={brandHandle ?? null}
            brandOverrides={brandOverrides ?? {}}
            voltage={voltage}
            repairSettings={repairSettings}
          />
        )}
      </div>
    </div>
  )
}
