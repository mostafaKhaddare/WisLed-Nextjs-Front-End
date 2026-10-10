# WISLED — Agilo Invoices Setup

> Nothing in this document was executed against the production database.

---

## 1. Compatibility — verified, compatible

| Check | Result |
|---|---|
| Package | `@agilo/medusa-invoices-plugin@1.0.0` |
| Peer range | `@medusajs/medusa` `>=2.11.3 <3.0.0` |
| Your Medusa | 2.12.5 |
| Verdict | **Compatible** — 2.12.5 is inside the range |

Also satisfied: `@medusajs/admin-sdk` 2.12.5, `@medusajs/ui` 4.0.33 (peer wants
`>=4.0.0 <5.0.0`), `@medusajs/icons` 2.12.5, `@medusajs/framework` 2.12.5.

Note the exact package name: it is `@agilo/medusa-invoices-plugin`, **not**
`@agilo/medusa-invoices`. The latter does not exist on npm — an easy 404.

---

## 2. What was actually done

The plugin is installed and configured on branch **`feat/agilo-invoices`** in the
backend repo. It is **not merged to `main` and not pushed.**

That branch is deliberate. `render.yaml` has `autoDeploy: true` and its
`startCommand` is `db:migrate && db:sync-links --execute-all && medusa start`, so
merging to `main` would run the plugin's migrations against the **production
database** on the next deploy. Keeping it on a branch means the integration is
built and verified without that ever happening.

Verified without touching production:
- `pnpm add @agilo/medusa-invoices-plugin` resolves cleanly.
- `npx medusa build` **succeeds** with the plugin loaded, including its admin
  extension (which is what exercises the `@medusajs/admin-sdk` / `@medusajs/ui` peers).
- The plugin ships **16 migrations** creating 3 tables (see §3).
- Migrations were **not** run anywhere.

### Dependency conflict found and fixed
`pnpm add` **removed** `@aws-sdk/client-s3` from `package.json`. Your custom
provider `src/providers/acl-free-s3` reaches AWS S3 through `@medusajs/file-s3`,
and that dependency was declared explicitly for that reason in commit `22987af`
("declare @aws-sdk/client-s3 instead of relying on hoisting"). It has been
restored as a devDependency on the branch. **Check this when upgrading.**

---

## 3. Schema the plugin adds

16 migrations create three tables:

- `invoice`
- `invoice_settings`
- `invoice_template`

The `invoice_template` table carries three auto-generation flags:
`auto_order_completed`, `auto_payment_captured`, `auto_fullfillment_created`.
**All three default to `false`.** Nothing auto-generates until you opt in, which
satisfies the requirement not to issue an invoice for every paid order by default.

---

## 4. Blocking prerequisite: working storage

Agilo writes invoice PDFs through Medusa's **File Module**. Without one,
generation fails at the moment it is triggered rather than surfacing a clear
boot-time error.

Your config gates the plugin on `isStorageConfigured` for exactly that reason
(see `medusa-config.ts`, the `isAgiloEnabled` guard). Storage has been repaired
on `main` — `render.yaml` declared `DO_SPACE_*` names while the config read
`S3_*`, so the file module never configured in production. Both naming schemes
are now accepted. Keep that fix when you deploy this branch.

---

## 5. Migration procedure (staging only)

1. Create the staging Postgres database.
2. On the staging backend, point `DATABASE_URL` at staging — **not** production.
3. On `feat/agilo-invoices`, deploy to staging. `startCommand` runs migrations
   automatically on Render, or run manually:
   ```bash
   npx medusa db:migrate
   npx medusa db:sync-links --execute-all
   ```
4. Confirm the three tables exist in staging:
   ```sql
   \dt invoice
   \dt invoice_settings
   \dt invoice_template
   ```
5. Confirm the auto flags are `false`:
   ```sql
   SELECT auto_order_completed, auto_payment_captured,
          auto_fullfillment_created
   FROM invoice_template;
   ```
6. Proceed to §6.

---

## 6. Configuring the template and generating a test PDF

Admin → **Settings → Invoices**. Configure:

- `template_id` — `clean` | `classic` | `compact`
- `store_name`, `store_address`, `store_tax_id`
- `bank_account_iban`, `bank_account_swift`
- `header_logo_type` — `text` | `image` | `none`
- `auto_generate_on` — **leave empty** until invoicing rules are decided

Then generate for a fictional order. Either Admin → Orders → *(order)* →
Invoice widget → Generate, or:

```bash
curl -X POST https://<staging>/admin/invoices/<order_id>/generate \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"created_by_event":"manual","template_id":"clean"}'
```

Status values to check: `queued` → `generating` → `completed` (or `failed`).
`failed` carries an `error_message`.

### What to verify on the PDF

- Order reference (`order_display_id`)
- Line item descriptions, variants, quantities, unit prices
- Discounts and shipping appear as separate lines
- Tax lines and totals reconcile with Medusa's authoritative totals
- Your company block and the customer's billing block
- Logo/header rendering, currency symbol and decimal separators

### Access control

- Admin endpoints (`/admin/invoices/*`, `/admin/invoice-settings`) require admin auth.
- Customer endpoint is `GET /store/invoices/{order_id}.pdf` — authentication
  required, and a customer can only fetch invoices for **their own** orders.

---

## 7. Triggers — do not enable without deciding

`availableTriggers` are `order.completed`, `order.fulfillment_created`, and
`payment.captured`. These are **not mutually exclusive and not conditional** —
enabling one fires a PDF on that event unconditionally.

Decide, for each, whether an invoice should be created there at all:

- `payment.captured` — event fires before fulfillment. For goods shipped later,
  invoicing here means invoicing an order you have not yet dispatched.
- `order.completed` — later and closer to "delivered", but still not a legal trigger.

Until this is decided, generate manually. Changing triggers later means
regenerating or cancelling earlier invoices.

---

## 8. Legal boundary — read this

**An Agilo PDF is not an Italian e-invoice.** It produces a human-readable PDF
document. Fattura elettronica requires an XML in the SdI format, transmitted
through the Sistema di Interscambio, with a valid codice destinatario or PEC and
a conserved file.

Nothing in this integration talks to SdI. Do not treat these PDFs as compliant
tax documents. Italian e-invoicing needs a provider such as Fatture in Cloud
wired to SdI, and is a separate piece of work.

Also: business details on invoices must be your **real** registered company
information. Do not put placeholder test values into production settings.
