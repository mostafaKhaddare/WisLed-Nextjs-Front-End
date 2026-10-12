# WISLED — Product Filters: Setup & Memory Guide

> Keep this file. Every rule below is a decision that is easy to forget and
> expensive to re-derive.

---

## 1. How the filter system is wired

```
backend   GET /store/filter-product-attributes[?category_id=…]
             └─ reads option/facet values, returns them as { id, value }[]

frontend  getStoreFilters(categoryId?)  (src/lib/data/products.ts)
             └─ cached 1h per URL (so per category), feeds the filter UI

frontend  FiltersModal (mobile sheet) + ProductFilters (desktop sidebar)
             └─ renders one collapsible group per non-empty facet

results   search() (src/modules/search/actions.ts)
             └─ GET /store/search with the facet params

backend   GET /store/search (src/api/store/search/route.ts)
             └─ applies every facet as a JSONB clause on product.metadata
```

Two rules that cause most confusion:

1. **A facet only appears if at least one product carries a value for it.**
   The endpoint returns an empty array and the group is hidden. This is
   deliberate — a filter that matches nothing looks broken.
2. **Each facet is scoped per category when the caller passes
   `category_id`.** Category pages pass their own category id, so every
   category offers its own filter set.

---

## 2. Where each facet reads from

| Facet | URL param | Read from | Notes |
|---|---|---|---|
| Collection | `collection` | Medusa collection | Native field |
| Type de produit | `type` | Medusa product type | Native field |
| Matériau | `material` | `product.material` column | Native field |
| Température de couleur | `color_temperature` | `metadata.color_temperature` | Swatch dot on the product page |
| Puissance (W/m) | `wattage` | `metadata.wattage` | |
| Indice de protection | `ip_rating` | `metadata.ip_rating` | e.g. `IP20`, `IP65` |
| Tension | `voltage` | `metadata.voltage` | e.g. `12V`, `24V` |
| Type de bande LED | `product_type` | `metadata.product_type` | e.g. `COB`, `SMD`, `RGB` |
| **Largeur de ruban (mm)** | `strip_width` | `metadata.strip_width` | Numeric: `8`, `10`, `12`, `14`, `17`, `20`, `24` |
| **Profil / diffuseur** | `profile` | `metadata.profile` | Free text: `noir`, `blanc`, `alu`, `diffuseur opal` |
| Prix | `price` | computed | Fixed ranges |

`strip_width` is the only facet with a **fixed sort order** (see `VALUE_ORDER`
in the backend route). Any new numeric facet needs adding there too, otherwise
it sorts as strings (`10` before `8`).

---

## 3. What to do to each product so it is filterable

### The only thing you must do: set metadata

Open the product in **Medusa Admin → Products → (product) → Metadata**, and add
the JSON keys. Values may be a string, a number, an array, or a comma-separated
string — the endpoint normalises all four.

```json
{
  "color_temperature": ["2200K", "3000K", "4000K"],
  "wattage": ["15W/m", "12W/m"],
  "ip_rating": ["IP20"],
  "voltage": ["24V"],
  "product_type": ["COB"],
  "strip_width": ["10"],
  "profile": ["noir", "diffuseur opal"]
}
```

For a product in **one** category only, a plain string is fine:

```json
{
  "color_temperature": "3000K",
  "ip_rating": "IP65",
  "strip_width": "12"
}
```

**Use identical spelling across products.** `IP20` and `ip20` become two
separate facets and customers see both. Same for `12V` vs `12 V`.

### Rules of thumb

- **Do not** create a facet key you have no intention of using. An unused key
  with one stray value on one product produces a one-option filter.
- **Arrays** are for products that genuinely span several values (a COB strip
  sold in 2200K/3000K/4000K).
- **`profile` and `material` are free text.** Spell them consistently or they
  fragment.

### How to bulk-fill metadata

Medusa Admin is one product at a time. For a catalogue this size that is painful,
so either:

- use the **Admin API** `POST /admin/products/:id` with a `metadata` body, or
- run `pnpm seed` / a script against the Admin API, or
- edit them in **Supabase** directly under the `product` table, column
  `metadata` (JSONB) — only if you are comfortable with SQL, and take a backup.

---

## 4. Adding a brand-new facet (the full checklist)

A new facet is **four coordinated edits**. Missing any one is the most common
breakage.

1. **Backend** — `src/api/store/filter-product-attributes/route.ts`
   Add an entry to the `FACETS` array:
   ```ts
   { key: "beam_angle", label: "Angle de faisceau" },
   ```
   If the values are numeric and need a sensible order, add them to
   `VALUE_ORDER`.

2. **Frontend constants** — `src/lib/constants.tsx`
   ```ts
   BEAM_ANGLE_KEY: 'beam_angle',
   ```

3. **Frontend type** — `src/types/global.ts`
   ```ts
   beam_angle: { id: string; value: string }[]
   ```

4. **Frontend UI** — render the group in **both** places:
   - `src/modules/store/components/filters/index.tsx` (desktop sidebar *and*
     the mobile `Select` dropdowns)
   - `src/modules/store/components/filters/filters-modal.tsx` (the mobile sheet)

Then re-run the storefront. The endpoint is cached for **1 hour**, so a new
facet takes up to an hour to appear unless you touch a product (which
invalidates the cache) or redeploy.

---

## 5. How facet filtering is applied (closed gap)

**The facet list and the result filtering are two systems, but both
are wired now:**

- `GET /store/filter-product-attributes` decides **which values
  appear** as options.
- `GET /store/search` decides **which products come back** when an
  option is ticked. The frontend `search()` forwards every facet
  param, and the backend applies them as JSONB clauses on
  `product.metadata` (`src/api/store/search/route.ts`,
  `applyMetadataFilters`).

Matching rules in the backend:

- Values inside one facet are **OR-ed** (tick 2200K and 3000K →
  either matches); facets are **AND-ed** against each other.
- A product matches when `metadata ->> '<key>' = '<value>'` (covers
  scalar strings and numbers) **or** `metadata @> '{"<key>":"<value>"}'`
  (covers arrays such as `["2200K","3000K"]`).
- The key list is a whitelist (`METADATA_FACETS`), so unknown query
  params can never reach the SQL.

`strip_width` and `profile` travel the same path: `search()` sends
`strip_width[]` / `profile[]`, and every listing template (store,
category, collection, search results) forwards them from the URL.

---

## 6. Per-category filters

Category pages fetch their own facets:

```
const filters = await getStoreFilters(currentCategory.id)
```

`getStoreFilters(categoryId?)` appends `?category_id=…` to
`GET /store/filter-product-attributes`, which scopes every
metadata facet to the products of that category (the backend
does a `whereExists` on `product_product_category`).

Next.js caches `fetch` responses per URL, so each category
gets its own 1-hour cache entry — no shared global cache, and
no extra invalidation work. Touching a product or redeploying
still refreshes it within the hour.

---

## 7. Quick verification checklist

- [ ] Set `metadata` on a few products with identical spelling.
- [ ] Open a category page; the group appears under 1 hour,
      scoped to that category's products.
- [ ] Tick an option; the URL receives e.g. `?color_temperature=3000K`.
- [ ] The removed-chip appears under the filters (`ActiveProductFilters`).
- [ ] **The product list narrows** — the search route applies the
      facet as a JSONB filter. If it does not, check that the
      product's metadata spelling matches the facet value exactly
      (case-sensitive) and that the backend was redeployed with
      `applyMetadataFilters`.
