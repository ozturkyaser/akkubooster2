import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

const navLinks = [
  { label: "Shop", href: "/store" },
  { label: "Reparatur", href: "/reparatur" },
  { label: "Marken", href: "/marken" },
  { label: "KI-Check", href: "/ki-check" },
  { label: "Kontakt", href: "/kontakt" },
]

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-grey-20">
        <nav className="content-container flex items-center justify-between w-full h-full">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-x-4 h-full">
            <div className="h-full small:hidden">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
            <LocalizedClientLink
              href="/"
              className="text-xl font-bold text-brand-500 hover:text-brand-600 transition-colors"
              data-testid="nav-store-link"
            >
              AkkuBooster
            </LocalizedClientLink>
          </div>

          {/* Center: Nav Links (Desktop) */}
          <div className="hidden small:flex items-center gap-x-6 h-full">
            {navLinks.map((link) => (
              <LocalizedClientLink
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-grey-60 hover:text-grey-90 transition-colors"
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </div>

          {/* Right: Account + Cart */}
          <div className="flex items-center gap-x-4 h-full">
            <div className="hidden small:flex items-center gap-x-4">
              <LocalizedClientLink
                className="text-sm font-medium text-grey-60 hover:text-grey-90 transition-colors"
                href="/account"
                data-testid="nav-account-link"
              >
                Konto
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-sm font-medium text-grey-60 hover:text-grey-90 flex gap-1"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Warenkorb (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
