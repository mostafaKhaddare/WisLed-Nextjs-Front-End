# WISLED — Checkout & Quantity Test Results

> Every entry below states exactly what was executed and observed. Tests that
> could not be run — because staging, sandbox credentials, or a database do not
> exist — are marked **BLOCKED** with the reason. Nothing is claimed as passing
> that was not actually run.

Executed: 2026-10-10

---

## 1. Quantity limit — code-level verification (PASSED)

The reported bug was that quantities above 10 could not be selected.

**Root cause**, found by inspection:

```js
// src/modules/cart/components/item-qty-select/index.tsx:38 (before the fix)
length: Math.min(maxQuantity, 10)   // hard-capped the dropdown at 10
```

The backend was checked first and contains **no cart code at all** — no
`addLineItem`/`updateLineItem` override, no quantity validation, no cart
workflow. So the limit was purely a frontend cap.

A further four arbitrary fallbacks compounded it whenever `inventory_quantity`
was null:

| Location | Before |
|---|---|
| `product-actions/index.tsx:136` | `return 10` (no variant / no cart yet) |
| `product-actions/index.tsx:147` | `return 100` (backorder) |
| `product-actions/index.tsx:157` | `return 10 - cartQuantity` (no inventory figure) |
| `cart/components/item/index.tsx:48-49` | `inventory_quantity > 0 ? … : 10` |

### Fix applied

- `Math.min(maxQuantity, 10)` removed; replaced with a `−` / `+` stepper plus a
  directly editable numeric field, so any quantity can be typed.
- A preset dropdown is only rendered when stock is finite and `<= 20`, so a large
  stock figure does not generate thousands of `<option>` elements.
- The three fallbacks are gone. `maxQuantity` is now the variant's real inventory
  minus what is already in the cart, or `Infinity` when Medusa does not manage
  inventory or backorders are allowed.

### Checks run and passed

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit -p tsconfig.json` | No errors from changed files (one pre-existing `node:test` error in `src/lib/medusa-env.test.ts`, untouched by this work) |
| Lint | `npx next lint` | No warnings in any changed file |
| Production build | `npm run build` | `✓ Compiled successfully` (63s) |

### Quantity scenarios — NOT yet runtime-verified

Untested because there is no running storefront or backend instance to drive, and
no staging database. Verified by reasoning only:

| Requested qty | Expected behaviour | Status |
|---|---|---|
| 1 | accepted | code-inspected only |
| 2, 9 | accepted | code-inspected only |
| 10 | accepted (was the old ceiling) | code-inspected only |
| 11 | **now accepted** — was the reported bug | code-inspected only |
| 25, 100 | accepted if inventory permits | code-inspected only |
| Above available stock | blocked with a visible message; never silently clamped | code-inspected only |

**To confirm, on staging:** add a product with a known stock figure, set 11, 25,
100, then check the cart total, the checkout summary, and the resulting order's
`quantity`. Use a variant with `manage_inventory: false` (or `allow_backorder:
true`) to confirm "Sans limite" and that no ceiling is invented.

**No arbitrary maximum was substituted** — there is no 99/999/9999 anywhere in
this change. The only guard is the real inventory figure.

---

## 2. Backend quantity validation — NOT APPLICABLE

There is nothing to validate against. Confirmed by exhaustive search over the
backend: no `Math.min`, no `quantity`/`qty` handling anywhere outside email
templates, no cart route middleware. Medusa core is the only quantity authority.

---

## 3. Checkout UX — NOT STARTED

No checkout UI changes were made. Blocked on a decision recorded below.

---

## 4. Payments (Stripe / PayPal) — BLOCKED

| Test | Status | Blocker |
|---|---|---|
| Stripe sandbox successful card | **BLOCKED** | `STRIPE_API_KEY` / `STRIPE_WEBHOOK_SECRET` unset; provider disabled |
| Stripe sandbox declined card | **BLOCKED** | same |
| Stripe webhook + signature verification | **BLOCKED** | no sandbox key, no endpoint reachable |
| PayPal sandbox approval | **BLOCKED** | PayPal provider not installed |
| PayPal sandbox cancellation | **BLOCKED** | same |

Both flows' frontends already exist. What is missing is backend provider
registration, which needs sandbox credentials — obtainable by you, not by me.

---

## 5. Invoice generation — BLOCKED

| Test | Status | Blocker |
|---|---|---|
| Agilo PDF for fictional order | **BLOCKED** | no staging database |
| Correct order ref, totals, tax fields | **BLOCKED** | same |
| Download, storage, access control | **BLOCKED** | same |
| Duplicate-generation protection | **BLOCKED** | same |
| Migrations run | **NOT RUN** | deliberately not executed |

The plugin *is* installed and *does* build — see `docs/WISLED_AGILO_SETUP.md`.

---

## 6. Duplicate submissions / idempotency — NOT FIXED (known gap)

The current guard against a double click is only `Button`'s `pointer-events-none`
while loading. `payment/index.tsx:229-233` does not even pass `isLoading` to
`disabled`. A refresh mid-request can reach `placeOrder()` twice.

Not fixed yet because this interacts with the payments work and should be done
with it. Flagged as the highest-priority remaining risk in the checklist.

---

## 7. E2E suite — NOT RUN

Playwright exists with a checkout flow at
`e2e/tests/03-checkout/2-checkout-flow.spec.ts`.

**It was deliberately not run.** `e2e/README.md` documents that the suite drops
and recreates a `test_*` Postgres database. Running it without first verifying
the target would risk the live data. Creating `test_*` is a prerequisite.

---

## 8. Summary

| Area | Passed | Blocked | Not started |
|---|---|---|---|
| Quantity root cause | — | — | — |
| Quantity fix (static) | 3 checks | | |
| Quantity runtime scenarios | | 7 | |
| Payments | | 5 | |
| Invoices | | 6 | |
| Checkout UX | | | yes |
| Idempotency | | | yes (gap) |
| E2E | | 1 | |

**Zero payment or invoice tests were executed.** No sandbox payment, no invoice
PDF, no order was created in any environment.
