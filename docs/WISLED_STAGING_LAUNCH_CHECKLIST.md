# WISLED — Staging Launch Checklist

Current verdict: **NOT READY FOR STAGING**.

Staging does not exist. Live secrets are committed to git. This document is the
path from here to a safe launch.

---

## Phase 0 — Safety (do these first, nothing else matters until they are done)

- [ ] **Rotate every credential** in `secrets.txt`, `secrets_utf8.txt`, and the
      five `start_log*.txt` files. They are still in git history even though the
      files are now untracked. Also rotate the plaintext `.env` values.
      Credentials to assume exposed: `DATABASE_URL`, `JWT_SECRET`,
      `COOKIE_SECRET`, any `*_API_KEY`, any S3/storage key.
- [ ] Delete the six plaintext files from disk.
- [ ] Decide whether to purge them from history (`git filter-repo` or BFG).
      **This requires a coordinated force-push to both remotes** — do not do it
      while collaborators have clones. If skipped, accept that history keeps the
      secrets and rely on rotation.
- [ ] Verify the backend `.env` is not in any deployment image, log, or backup.

## Phase 1 — Staging infrastructure (currently absent)

- [ ] **Render:** create a second web service (`wisled-medusa-backend-staging`)
      with its own env group. Check `render.yaml` — `autoDeploy: true` means a
      push to the tracked branch deploys it, so staging should track a staging
      branch, not `main`.
- [ ] Create a **separate Postgres** for staging. Never share with production.
- [ ] Set `NODE_ENV=production` + `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`,
      `COOKIE_SECRET`, `MEDUSA_BACKEND_URL`, `STORE_CORS`, `ADMIN_CORS`,
      `AUTH_CORS` on staging. Independent secrets from production.
- [ ] **Vercel:** create a staging project, or set `NEXT_PUBLIC_*` per-environment.
      No `vercel.json` exists, so this is dashboard-level configuration.
- [ ] Confirm `STORE_CORS`/`ADMIN_CORS` allow the staging frontend origin, and
      that **production** CORS does not allow it (environment isolation).

## Phase 2 — Storage

The `S3_*` / `DO_SPACE_*` mismatch is fixed on `main` (both names accepted).
On staging, confirm the supplier knows which naming scheme its dashboard uses:

- [ ] Storage vars present (any of the two schemes).
- [ ] Boot log shows `✅ Supabase Storage enabled`.
- [ ] `POST /admin/uploads` returns a URL, and the URL resolves — not a 404 and
      not a path missing the bucket segment.

## Phase 3 — Backend fixes already committed on `main`

Both are deployed by pushing `main`. **Review before merging**: `render.yaml`
`autoDeploy` is `true`, so pushing to `main` deploys to production immediately.

| Commit | Effect |
|---|---|
| `b67ff93` | storage accepts both `S3_*` and `DO_SPACE_*` |
| `9ad4079` | untracked secrets/logs; fixed `.gitignore` ordering; added `.env.example` |

- [ ] Decide whether to deploy these to production now, and when.
- [ ] Rollback: `git revert b67ff93` and `git revert 9ad4079`. Note that
      `9ad4079` deletes tracked files, so reverting restores their contents to
      the tree — do that only after rotation.

## Phase 4 — Quantity fix (frontend, on `main`, pushed)

Commit `3cab8f4`.

- [ ] On staging, add a variant with known stock and test 1, 11, 25, 100.
- [ ] Test a variant with `manage_inventory: false` → shows `Sans limite`.
- [ ] Test a variant with small stock (e.g. 5) → typing 6 shows
      `Seulement 5 unité(s) disponible(s)` and does **not** silently clamp.
- [ ] Verify the cart total and the resulting order quantity match.

## Phase 5 — Stripe sandbox

Agilo is on a branch, so this is the only thing needing credentials.

- [ ] Backend (Render): `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` (sandbox).
- [ ] Frontend (Vercel): `NEXT_PUBLIC_STRIPE_KEY` (publishable **only**).
- [ ] Stripe webhook endpoint: `https://<staging>/hooks/payment/stripe_stripe`,
      subscribed to `payment_intent.succeeded`, `payment_intent.payment_failed`,
      `payment_intent.processing`, `payment_intent.canceled`.
- [ ] Admin → Settings → Regions → your region → enable the **Stripe** provider.
      *Required, or Stripe will not appear at checkout.*
- [ ] Confirm the region's currency is supported by your Stripe account.

## Phase 6 — Payments test matrix

- [ ] Success card `4242 4242 4242 4242` → order created, correct status.
- [ ] Declined card `4000 0000 0000 0002` → clear error, **no falsely paid order**.
- [ ] Cancel → returns to the cancellation screen, no order.
- [ ] Webhook failure → payment status still converges correctly.
- [ ] **Double-click / refresh during submit** → no duplicate charge, no duplicate
      order. *(Not currently guaranteed — see Phase 8.)*
- [ ] Mobile checkout on a real device.

## Phase 7 — Agilo invoices

Branch `feat/agilo-invoices`, **not merged, not pushed**.

- [ ] Merge to the staging branch only (never directly to `main`, which would run
      `db:migrate` on production).
- [ ] Migrations run against the staging DB, creating `invoice`,
      `invoice_settings`, `invoice_template`.
- [ ] Verify all three `auto_*` flags on `invoice_template` are `false`.
- [ ] Settings → Invoices: template, company details, bank details. **Real
      registered company information, or leave blank until confirmed.**
- [ ] Generate a PDF for a fictional order; verify order ref, line items,
      quantities, unit prices, discounts, shipping, tax lines, totals, logo.
- [ ] Verify `GET /store/invoices/{order_id}.pdf` returns a PDF for the owning
      customer and **403/404 for a different customer**.
- [ ] Decide triggers. Do not enable any until the invoicing rule is agreed —
      see `docs/WISLED_AGILO_SETUP.md` §7.

## Phase 8 — Still open (risks that are not fixed)

- [ ] **Idempotency / duplicate submission.** No idempotency key, no server-side
      dedupe. Only `pointer-events-none` guards a double click. This is the
      highest-priority remaining risk.
- [ ] **PayPal provider is not installed.** Medusa v2 has no first-party option.
      Decision needed: third-party or custom module. See
      `docs/WISLED_PAYMENT_SETUP.md` §5.
- [ ] **Checkout UX redesign** — not started, and blocked on a branding decision
      (see below).
- [ ] Backend Jest suite is not runnable as configured: no `test` script, and
      `TEST_TYPE` unset means `testMatch` is never defined. Several specs mock
      stale method names (`mockWishlistService.list` vs `createWishlists`).
- [ ] `render.yaml` runs `db:migrate` on every deploy — predictable, but any
      future migration lands in production automatically. Reconsider for a
      launch-critical stack.
- [ ] `wishlist` module has no `.snapshot-wishlist.json`, so `db:generate` may
      emit a duplicate migration.
- [ ] Brand palette mismatch — see below.

## Decisions needed from you

| # | Decision | Why it blocks |
|---|---|---|
| 1 | Secret rotation + history purge | Security; force-push risk |
| 2 | Staging infrastructure owner | Everything payment/invoice related |
| 3 | Brand palette | Checkout redesign |
| 4 | PayPal approach | Cannot install a payment provider without approval |

## Rollback

**Frontend (Vercel, auto-deploy on push to `main`):**
```bash
git revert <commit>
git push origin main
```

**Backend (Render, auto-deploy on push to `main`):**
```bash
git revert <commit>
git push origin main   # runs db:migrate on boot
```
- `render.yaml` has `autoDeploy: true`, so a push to `main` is a production
  deploy. Prefer merging to a staging branch for anything untested.
- Never `git reset --hard` on a deployed branch; prefer `revert`.
- Drift note: reverting a migration commit does **not** un-run the migration.
  If a migration has run, restore the database from a backup.

## Final verification on staging

1. Boot the backend and read the log for `✅ Supabase Storage enabled` and,
   if enabled, `✅ Agilo invoices enabled`.
2. Open the storefront, add a product at quantity 11, confirm the cart total.
3. Complete checkout with `4242 4242 4242 4242`.
4. Confirm the order, the payment status, and the confirmation page.
5. Generate an invoice PDF for that order and open it.
6. Repeat once on a real phone.

---

## Verdict

**NOT READY FOR STAGING.**

Staging must exist before any payment, invoice, or order behaviour can be
tested. The quantity fix and the two backend safety commits are complete, build
clean, and are ready to deploy — but deploying to production is itself a decision
that needs approval.
