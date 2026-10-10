# WISLED — Stripe & PayPal Setup

> Environment variables are listed **by name only**. No real secret values are stored in this repo.

---

## 1. Current state (verified 2026-10-10)

| Item | Status |
|---|---|
| `@medusajs/medusa/payment-stripe` | **Installed** (2.12.5, transitively pulls `stripe@19.1.0`) |
| Stripe provider registered in config | **Yes**, but gated behind env vars |
| Stripe enabled at runtime | **No** — `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` are unset |
| PayPal provider | **Not installed** |
| Frontend Stripe UI | **Present and functional** (`pp_stripe_stripe` → `confirmCardPayment`) |
| Frontend PayPal UI | **Present** (`pp_paypal_paypal` → `PayPalButtons`) but inert — no provider to back it |

The Stripe wiring in `medusa-config.ts:36-57` is already correct. Nothing needs
to be written for Stripe — only credentials and region/provider enablement.

---

## 2. Environment variables

### Render (backend) — set these in the service dashboard

| Variable | Value | Notes |
|---|---|---|
| `STRIPE_API_KEY` | `sk_test_…` (sandbox) | **Secret. Backend only.** Never prefixed `NEXT_PUBLIC_`. |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` | Signing secret for the webhook endpoint. |

Both are read only by the backend and are gated behind `isStripeConfigured`,
so the provider does not load — and no Stripe code path runs — until both are set.

### Vercel (frontend) — set these in the project

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_KEY` | `pk_test_…` | Stripe **publishable** key. Already referenced by `payment-wrapper/index.tsx:19`. |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | sandbox client id | Already referenced by `payment-wrapper/index.tsx:22`. Leave unset until PayPal ships. |

Only **publishable** keys may appear on the frontend. `sk_test`/`sk_live` must
never be set on Vercel.

### Webhook URLs to register in Stripe

| Environment | Endpoint |
|---|---|
| staging | `https://<staging-backend>/hooks/payment/stripe_stripe` |
| production | `https://<production-backend>/hooks/payment/stripe_stripe` |

The provider id is `stripe` (set in `medusa-config.ts`), which Medusa turns into
the `stripe_stripe` webhook slug.

Events to subscribe: `payment_intent.succeeded`, `payment_intent.payment_failed`,
`payment_intent.processing`, `payment_intent.canceled`.

---

## 3. Enabling the provider (manual, in Medusa Admin)

The provider must be enabled per-region, or it will not appear at checkout.

1. Admin → **Settings → Regions**, pick your region.
2. **Payment providers** → add **Stripe** (id `stripe`).
3. Confirm the region's currency is one Stripe supports for your account.
4. Save. Only then does `listCartPaymentMethods` return Stripe.

Stripe handles Visa and Mastercard automatically once enabled — no separate
per-card configuration is needed. Card-brand checkboxes do not exist in the
Medusa Stripe provider; brand selection is a Stripe dashboard concern.

---

## 4. What is safe to test

- Sandbox keys (`sk_test_` / `pk_test_`) only.
- Stripe's published test cards: `4242 4242 4242 4242` succeeds,
  `4000 0000 0000 0002` is declined by the issuer.
- Never send a real card through a test endpoint.

Card data goes straight to Stripe via `CardElement`/`PaymentElement`. The
application never sees or stores PAN or CVV — confirm this stays true; do not
add custom card-input fields.

---

## 5. PayPal — blocked, needs a decision

Medusa v2 has **no first-party PayPal provider**. The frontend already contains
a working PayPal flow (`payment-button/index.tsx:223-291`, `createOrder` →
`order.authorize()` → `placeOrder()`), which will start working the moment a
`pp_paypal*` provider is registered on the backend. No frontend work is required.

Options:

| Option | Effort | Risk |
|---|---|---|
| Third-party community provider | Low | You inherit someone else's maintenance. Audit before adopting. |
| Custom `AbstractPaymentProvider` module | Medium–high | Full control, but you own webhook/verification correctness. |
| Ship Stripe only | None | PayPal unavailable. |

I have **not** installed any PayPal package — adding a dependency for a payment
provider to a production-tracking branch is exactly the kind of change to make
with approval. Tell me which option you want and I will implement it.

---

## 6. Known gaps in the current checkout

Found during the audit, worth fixing alongside payments:

- **Duplicate submissions.** The only guard against a double click or a refresh
  mid-request is `Button`'s `pointer-events-none` while loading
  (`payment-button/index.tsx`, `common/components/button/index.tsx:30`). There is
  no idempotency key and no server-side dedupe, so two requests can both reach
  `placeOrder()`. `payment/index.tsx:229-233` does not even put `isLoading` into
  `disabled`.
- **Provider id is hardcoded** as `'pp_stripe_stripe'` at
  `payment-button/index.tsx:132` and `:204`.
- Dead code: a commented-out gift-card branch at `payment-button/index.tsx:69-86`.
