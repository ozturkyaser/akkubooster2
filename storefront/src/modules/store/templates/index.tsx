import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div>
      {/* Hero Header */}
      <div className="w-full bg-gradient-to-r from-brand-600 to-brand-800 py-12 small:py-16">
        <div className="content-container">
          <h1 className="text-3xl small:text-4xl font-bold text-white mb-3" data-testid="store-page-title">
            Alle Akkus
          </h1>
          <p className="text-white/70 max-w-xl text-lg">
            Finde den passenden Reparatur-Service oder Ersatzakku fuer dein E-Bike. Alle Marken, alle Modelle.
          </p>
        </div>
      </div>

      <div
        className="flex flex-col small:flex-row small:items-start py-6 content-container"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
