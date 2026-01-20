import { getRegion } from '@lib/data/regions'
import { convertToLocale } from '@lib/util/money'
import { ProductTile } from '@modules/products/components/product-tile'
import { PRODUCT_LIMIT } from '@modules/search/actions'
import { Pagination } from '@modules/store/components/pagination'
import { SearchedProduct } from 'types/global'

export default async function PaginatedProducts({
  products,
  total,
  page,
  countryCode,
}: {
  products: SearchedProduct[]
  total: number
  page: number
  countryCode: string
}) {
  const totalPages = Math.ceil(total / PRODUCT_LIMIT)
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  return (
    <>
      <ul
        className="grid w-full grid-cols-2 gap-x-2 gap-y-6 small:grid-cols-2 large:grid-cols-4 "
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductTile
                product={{
                  id: p.id,
                  created_at: p.created_at,
                  title: p.title,
                  handle: p.handle,
                  thumbnail: p.thumbnail,
                  calculatedPrice: convertToLocale({
                    amount: (() => {
                      const raw = (p as any).calculated_price
                      if (typeof raw === 'number') return raw
                      if (typeof raw === 'string') {
                        const parsed = Number(raw.replace(/[^0-9.\-]/g, ''))
                        return isNaN(parsed) ? 0 : parsed
                      }
                      return 0
                    })(),
                    currency_code: region.currency_code,
                  }),
                  salePrice: (p as any).sale_price,
                }}
                regionId={region.id}
              />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}




