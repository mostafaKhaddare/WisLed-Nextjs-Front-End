# Product availability / Google "Out of stock" fix

Date: 2026-10-25

## Root cause

The storefront's Product JSON-LD treated a `null` `inventory_quantity` as zero:

```ts
inventory_quantity > 0 ? InStock : OutOfStock
```

Medusa returns `inventory_quantity: null` when a variant has
`manage_inventory: false`. Those variants are deliberately not stock-tracked
and are purchasable, but the schema marked them as sold out. The product page
and add-to-cart flow were already treating them correctly, so Google saw a
different availability than the buyer did.

This was a frontend schema bug. No Medusa inventory setting or quantity was
changed.

## Production audit

All 21 published product URLs in `https://www.wisled.ma/sitemap.xml` were
checked against their rendered Product/Offer JSON-LD and variant data.

| Finding | Count |
| --- | --- |
| Published products audited | 21 |
| Products emitting `OutOfStock` before the fix | 19 |
| Those 19 with at least one untracked (`manage_inventory: false`) variant | 19 |
| Published variants with tracked stock, no backorder, and zero quantity | 0 |
| Product schemas per page | 1 (no duplicate Product schema) |

Representative cases:

- `ruban-led-smd-2835-240-ledm-12v-ip20-20wm`: all 4 variants untracked, but
  the page emitted `OutOfStock`.
- `ruban-led-smd-2835-120-ledm-12v-ip20-96wm`: 6 untracked + 4
  tracked/backorder variants; already emitted `InStock`.
- `ruban-led-magic-2811-60-ledm-rgb-24v-ip68`: one tracked variant with no
  available stock but `allow_backorder: true`; purchasable.

Expected after the fix: 20 products `InStock`, 1 product `BackOrder`, and no
false `OutOfStock`.

## What changed

- Added `src/lib/util/product-availability.ts` as the single availability rule:
  - untracked inventory or positive quantity -> `in-stock`
  - tracked, no quantity, backorders allowed -> `backorder`
  - tracked, no quantity, no backorders -> `out-of-stock`
- `src/modules/products/components/json-ld/index.tsx`
  - emits `InStock`, `BackOrder`, or `OutOfStock` from that rule
  - uses one `Offer` for a single priced variant and `AggregateOffer` for
    several variants
  - uses numeric `calculated_price.calculated_amount` values instead of parsing
    localized display strings
  - emits the country-scoped canonical URL (`/{countryCode}/products/{handle}`)
  - escapes `<` in serialized JSON-LD
  - never serializes inventory quantities
- `src/app/[countryCode]/(main)/products/[handle]/page.tsx`
  - adds the canonical URL to metadata and passes `countryCode` to JSON-LD
- `src/modules/products/components/product-actions/index.tsx`
  - uses the shared purchasability helper
- `src/lib/data/cart.ts`
  - `addToCartCheapestVariant` picks the cheapest **purchasable** variant instead
    of treating a `null` quantity as sold out
- `src/modules/cart/components/item-qty-select/index.tsx`
  - removed the visible `Max N` / `only N available` copy
  - the quantity control now reports a generic maximum-reached state
  - the preset dropdown no longer reveals a small exact stock figure

## Validation

- `npx tsc --noEmit` passes except the pre-existing
  `src/lib/medusa-env.test.ts(1,18): Cannot find module 'node:test'` error.
- `npm run build` completes successfully (`Compiled successfully`, static pages
  generated). Build-time Medusa requests fail because the Render backend is
  suspended, but the build exits 0.
- A temporary `tsx` check rendered the JSON-LD component and covered:
  untracked -> `InStock`, tracked zero -> `OutOfStock`, backorder ->
  `BackOrder`, mixed variants -> `InStock`, numeric prices, canonical URLs, and
  `<` escaping.
- Live audit: 19 false `OutOfStock` results were found before the fix.

## Deployment verification

1. Deploy the frontend.
2. Fetch a previously affected product and confirm the JSON-LD contains
   `"availability":"https://schema.org/InStock"` and a `/{countryCode}/` offer
   URL, for example:
   `https://www.wisled.ma/ma/products/ruban-led-smd-2835-240-ledm-12v-ip20-20wm`
3. Run Google's Rich Results Test on one untracked product, the mixed product,
   and the backorder product. Confirm the Product snippet is valid and not
   "Out of stock".
4. In Search Console, use URL Inspection -> Request indexing for the affected
   product URLs.
5. No Merchant Center feed or Shopping integration exists in this repository.
   If Merchant Center is connected externally, refresh/re-crawl its product
   source separately.

## Remaining backend verification

Direct Admin API/DB inspection was blocked because
`https://wisled-medusa-back-end-1.onrender.com` returned
`503 suspend-by-user`. Once the service is unsuspended, verify in Medusa Admin:

- the stock location is linked to the sales channel used by the storefront
- tracked variants have an inventory item and a stock level at that location
- `manage_inventory` is intentionally false for the untracked catalog

If stock quantities are meant to limit sales, enable `manage_inventory` on
those variants. Otherwise Medusa will continue to treat them as available
regardless of the quantity entered.
