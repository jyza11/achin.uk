# Business features — design (parked)

**STATUS: NOT STARTED.** Parked 2026-09-06 — moved out of `CMS-design.md` by the owner's
decision. Do not design or build until the CMS data layer exists.

## Scope

Donations, sales/orders, currency support, order emails. Existing input: the donation spec
`../SUPPORT-README.md` + three mockups `../support-mockup-*.html`; `DonationCard.svelte` is the
waiting stub.

## Already agreed (carry forward)

- **Never handle card data.** Processor only (PayPal / Stripe Checkout). The database stores
  order rows + the processor's transaction ID, updated by webhook. Multi-currency comes from the
  processor.
- Depends on the `orders` collection defined by `CMS-design.md`.

## Open questions — answer before designing

1. Merchant of record: the owner (UK) or the artist (Taiwan)? Tax/legal before code.
2. Processor: Stripe is limited in Taiwan; PayPal works. Follows from (1).
3. Terms of sale, privacy policy, GDPR for UK/EU buyers.
4. Transactional email provider (shared with CMS password resets).
