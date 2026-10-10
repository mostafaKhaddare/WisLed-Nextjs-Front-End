# WISLED — Phase 1 Audit Report

**Date:** 2026-10-10
**Scope read-only:** No files modified, no config changed, no migrations run, no deployment touched.

---

## 1. Architecture as actually built

Two separate git repositories, as expected:

| Repo | Path | Remote | Hosting |
|---|---|---|---|
| Frontend | `WisLed-NextjsFront-End` | `github.com/mostafaKhaddare/WisLed-Nextjs-Front-End` | Vercel |
| Backend | `WisLed-Medusa-Back-End` | `origin` + `wisled` (`Wisled/Wisled-Front`) | Render |

A third legacy `WisLed-Strapi` repo exists but is out of scope.

Notable: the frontend also runs **Payload CMS 3.43 inside the same Next app** (`next.config.js` wrapped in `withPayload`), and the backend serves its Medusa Admin dashboard in-app.

Both working trees are **clean** — no uncommitted work was at risk.

---

## 2. CRITICAL security findings (act before anything else)

### 2.1 Committed secrets — highest priority
Files `secrets.txt`, `secrets_utf8.txt`, `start_log.txt`, `start_log2.txt`,
`start_log2_utf8.txt`, `start_log_utf8.txt` are **tracked in git and pushed to
both remotes** (confirmed via `git ls-files --error-unmatch secrets.txt`, and
`git branch -r --contains HEAD` → `origin/main`, `wisled/main`).

`.gitignore` *does* contain `secrets*` and `start_log*`, but gitignore has no
effect on already-tracked files. The start logs in particular commonly capture
env dumps and request bodies.

**This is a live credential exposure.** Required remediation:
1. Rotate every credential that could be in those files (DB password, JWT/session secrets, API keys).
2. `git rm --cached` them so they leave the tree.
3. Purge them from history (`git filter-repo` or BFG) and force-push, or accept they stay in history — **this needs your explicit approval** because it rewrites history on a shared remote.

### 2.2 Plaintext `.env` on disk
The backend `.env` contains live credentials. It is correctly gitignored (not
committed), but it sits in plaintext in the project folder.

### 2.3 `.gitignore` bug
`!.env.example` on line 8 is followed by `.env*` on line 9, which re-matches
`.env.example`. The intent was to keep the example committed; verify with
`git ls-files --error-unmatch .env.example`.

### 2.4 Staging does not exist
There is **no staging environment** in either repo. No `render.yaml` service for
staging, no `vercel.json`, no staging branch config. Production is the only
environment. Every safety requirement you listed depends on a staging database
and sandbox keys, which must be created first (see the checklist doc).

---

## 3. Backend audit (Medusa 2.12.5)

### 3.1 Cart / quantity — no backend code involved
Searched the whole backend for `quantity`, `qty`, `Math.min`, `Math.max`,
`addLineItem`, `updateLineItem`, `lineItem`: **zero matches in custom code.**

- `src/workflows/` contains only wishlist and category-image workflows.
- `src/api/` has search, wishlist and category-image routes; no `/store/carts*` interception.
- `src/api/middlewares.ts` validates only 4 routes, none cart-related.
- `src/subscribers/` and `src/jobs/` are empty boilerplate.
- The only numeric caps in the repo are Zod `.min(1)` "at least one" array rules and unrelated pagination defaults.

**Conclusion: the quantity limit is entirely a frontend problem. Medusa core enforces no maximum.**

### 3.2 Payment providers
- `@medusajs/medusa/payment-stripe` 2.12.5 **is installed** (`stripe` 19.1.0 hoisted).
- It is registered **conditionally** in `medusa-config.ts:36-57`, gated on both
  `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET`. Neither is present in the local
  `.env`, so **Stripe is currently disabled**.
- **No PayPal provider is installed** (`@paypal/*`/`paypal` absent from `package.json` and `pnpm-lock.yaml`).
- `@medusajs/medusa/payment` 2.12.5 is available as the module resolver.

### 3.3 Invoices
**Agilo is not installed** — no `medusa-invoices`/`agilo` in `package.json`, `pnpm-lock.yaml` or `node_modules`.

### 3.4 File storage — a production blocker for Agilo PDFs
`medusa-config.ts:60-65` gates object storage on `S3_FILE_URL`,
`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION` and uses
`S3_ENDPOINT`, through a custom provider at `src/providers/acl-free-s3` that
strips the `ACL` header (Supabase rejects `x-amz-acl`).

But `render.yaml` declares **`DO_SPACE_URL`, `DO_SPACE_ACCESS_KEY`,
`DO_SPACE_SECRET_KEY`, `DO_SPACE_BUCKET`, `DO_SPACE_REGION`,
`DO_SPACE_ENDPOINT`** — a name mismatch. So with `NODE_ENV=production` the
storage branch is skipped entirely and **no file provider is configured in
production**. This must be reconciled before Agilo can store PDFs anywhere.

### 3.5 Migrations
Four module migrations are committed (wishlist, product-media ×3 incl. search
trigger). No `src/migrations/`. `render.yaml` `startCommand` runs
`db:migrate && db:sync-links --execute-all` on **every deploy**, so any new
migration lands on production automatically — a staging-first discipline is
mandatory.

Note: `wishlist` has no `.snapshot-wishlist.json`, so `db:generate` may re-emit
a duplicate migration.

### 3.6 Tests
Jest 29 + `@swc/jest`, driven by a `TEST_TYPE` env var selecting `testMatch`.
`package.json` has **no `test` script**. With no `TEST_TYPE` set, `testMatch` is
undefined and the suite is not usable as configured. The wishlist unit specs
also mock `mockWishlistService.list/.create/.delete` while the steps call
`createWishlists`/`deleteWishlists` — the mocks are stale, so those tests are
not trustworthy as-is.

---

## 4. Frontend audit

### 4.1 Quantity limit — ROOT CAUSE IDENTIFIED

**Primary cause — a hard cap in the quantity dropdown:**

```js
// src/modules/cart/components/item-qty-select/index.tsx:38
length: Math.min(maxQuantity, 10),
```

The dropdown is truncated at 10 options **regardless of stock**. This single
line explains the reported behaviour: even a product with 100 units in stock
can only be set to 10.

**Secondary causes — arbitrary fallbacks of 10 when inventory data is missing:**

```js
// src/modules/products/components/product-actions/index.tsx
136:  if (!selectedVariant || !cartItems) return 10        // no variant yet
147:  if (selectedVariant?.allow_backorder) return 100     // backorder cap
157:  return 10 - cartQuantity                              // no inventory figure
```

```js
// src/modules/cart/components/item/index.tsx:48-49
const maxQuantity = item.variant.inventory_quantity > 0
  ? item.variant.inventory_quantity
  : 10                                                     // cart page
```

**Classification: (A) an accidental frontend restriction, combined with (D) an
inventory-data-derived fallback.** There is no backend guard (B/C absent).

The `Math.min(..., 10)` is a UX dropdown cap, not a business rule. The fallback
`10`s exist because `inventory_quantity` is `null` when inventory is unmanaged.

### 4.2 Checkout
Three steps driven by `?step=`: `address` → `delivery` → `payment`, rendered in
an accordion. Supports Stripe (`pp_stripe_stripe` via `confirmCardPayment` +
`CardElement`, other Stripe providers via `PaymentElement`), PayPal
(`pp_paypal_paypal`, PayPalButtons → `order.authorize()`), and manual
(`pp_system_default`, dev-only).

**Duplicate-submit protection is incomplete.** The only guard is
`isLoading` + `pointer-events-none` in the shared `Button`. There is no
idempotency key, no server-side dedupe, and `payment/index.tsx:229-233` does
not even put `isLoading` into `disabled`. A double click or a refresh mid-request
can reach `placeOrder()` twice.

Totals come from Medusa (`useCart`), so the order summary is already
authoritative — good.

### 4.3 Branding conflict — needs your decision
The stated palette (#050505 black, #111111 surface, #FFC400 yellow, #BFC3C7
gray) **does not exist in the codebase**. A case-insensitive search across the
frontend found none of those hex values.

The live brand is **blue**: `--wisled-500: 43 127 255` (#2b7fff) is marked
"PRIMARY BRAND" in `preset/theme/colors.ts`, with a full `wisled-*` scale and
`bg-wisled-gradient-primary`. The nearest yellows are `#FFAD1F` (warning) and
the greys are slate.

This matters directly for the checkout redesign task: adopting the stated
palette means introducing a new set of tokens site-wide. I need your decision
before changing anything.

### 4.4 Deployment
No `vercel.json`, no `.vercel/`, no `Dockerfile`. Single `next.config.js`; the
only build-time required var is `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. Payment
keys referenced: `NEXT_PUBLIC_STRIPE_KEY`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.

### 4.5 E2E tests — safety warning
Playwright is present (`testDir: ./e2e`), including a working
`03-checkout/2-checkout-flow.spec.ts`. **However** `e2e/README.md` documents
that the suite **drops and recreates a `test_*` Postgres database**. It must
never be pointed at production. `package.json` has `test-e2e` and `test:serial`
scripts.

---

## 5. Prioritized implementation plan

### Phase 1.5 — Safety prerequisites (before any implementation)
1. **Rotate + untrack the committed secrets** (needs approval for history rewrite).
2. **Reconcile `S3_*` vs `DO_SPACE_*`** — production file storage is currently unconfigured.
3. **Create a staging environment** — a Render service on a separate Postgres
   and a separate Vercel project, with sandbox keys only. Without this,
   testing Stripe/PayPal/Agilo against production is exactly what your protocol
   forbids.
4. Fix the `test` script / stale Jest mocks so backend tests are runnable.
5. Decide the **brand palette** (blue vs the stated black/yellow spec).

### Phase 2 — Quantity limit fix (safe, frontend-only, no backend change)
Remove all four hardcoded caps and validate properly:
- `item-qty-select`: drop `Math.min(maxQuantity, 10)`; allow direct numeric
  entry and large lists (cap the *rendered list*, not the value).
- `product-actions`: replace the `10` fallbacks with explicit handling of the
  unmanaged-inventory case.
- `cart/item`: same fallback fix.
- Respect genuine inventory and `allow_backorder`; show a clear message when the
  requested quantity exceeds stock rather than silently clamping.
- Test 1, 2, 9, 10, 11, 25, 100.

### Phase 3 — Checkout UX and duplicate-submit protection
Branded redesign of the three steps, Italian address/postal-code validation,
clear loading/error states, and real idempotency: disable on submit plus an
idempotency key so a refresh cannot double-charge.

### Phase 4 — Agilo invoices (staging only)
Verify plugin compatibility with 2.12.5, install to the backend, point its PDF
storage at the file module, run migrations **only on staging**, generate a PDF
for a fictional order. Blocked until item 1.5.2 (storage) is resolved.

### Phase 5 — Stripe sandbox (Visa/Mastercard)
Config already gated and ready; needs sandbox keys + webhook + region provider
enablement, on staging.

### Phase 6 — PayPal sandbox
Provider is not installed. Medusa ships no official PayPal provider for v2, so
this requires a community/custom provider or a Medusa Payment module — a real
architectural decision I need your input on.

### Phase 7 — E2E tests on staging, against `test_*` DB only.

### Phase 8 — Docs and verdict.

---

## 6. Blockers requiring your decision

1. **Secret rotation + history rewrite** — approve, or I limit myself to removing them going forward.
2. **`S3_*` vs `DO_SPACE_*`** — which is the intended provider in production?
3. **Staging infrastructure** — need permission/plan to create a Render service + Vercel project, or you create them.
4. **Brand palette** — keep the live blue, or migrate to the stated black/yellow?
5. **PayPal** — Medusa v2 has no first-party PayPal provider; confirm you accept a third-party/custom module.

## 7. Verdict

**NOT READY FOR STAGING** — because staging does not exist, live secrets are committed to git, and production file storage is misconfigured. Phases 2 and 3 (quantity fix and checkout UX) are frontend-only and safe to begin immediately on a branch.
