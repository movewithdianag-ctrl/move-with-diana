# Stripe setup for the 8-Week Pilates Program

A click-by-click guide for Diana. You will end up with **one** Stripe Payment Link:

- **$897, charged once.** That is the only price.

There is no payment plan run by you or by the website. A client who wants to pay over time picks a pay-later option (Klarna, Affirm or Afterpay) on the Stripe payment page, once you have turned those on (Part 5). The provider pays you the full amount up front and collects the installments from the client.

The link sends the client to `https://movewithdianag.com/pilates-program/welcome` after they pay, where they book their assessment and then their weekly sessions, one at a time.

**Where things stand.** The product and Payment Link were created on 2026-11-15 and the link is pasted into the site (Part 7). Do not send the link to buyers until the new pages are published, because the welcome page is not live yet. Affirm is the one pay-later method turned on in Stripe (decided 2026-11-15); Klarna and Afterpay are left off, so read Part 5 with that in mind. The Payment Link is still needed from Nick and Diana.

**Program policy.** The program has no refund and no cancellation, and the website says nothing about either. Where this guide mentions refunds, it only describes how Stripe behaves. It is not an offer to clients.

Checked against Stripe's own documentation in November 2026. Stripe renames buttons from time to time, so if a label is slightly different, look for the closest match.

Time needed: about 30 minutes, plus Stripe's identity check.

---

## Part 1. Create the Stripe account

1. Go to `https://dashboard.stripe.com/register`.
2. Enter your email, full name and a password. Verify the email Stripe sends you.
3. Stripe will ask you to activate payments. Have these ready:
   - Business type. If you have no LLC, choose **Individual / Sole proprietor**. If you have an LLC and an EIN, use those.
   - Your legal name, date of birth, home address, and the last 4 digits of your SSN (Stripe may ask for the full number or a photo ID).
   - Industry: choose the closest match to fitness instruction or personal training. Avoid "consulting", "coaching" or "professional services" if a fitness option fits, because some pay-later providers do not accept those categories (see Part 5).
   - Website: `https://movewithdianag.com`
   - A short description, for example: "Private online Classical Pilates sessions."
   - The bank account where you want payouts sent.
4. Turn on two-step authentication when Stripe offers it.

Stripe charges a fee on each successful payment. Part 5 has the numbers for cards and for pay-later methods. See `https://stripe.com/pricing` for today's rates.

## Part 2. Public details and receipts

Receipts will not send unless your public business details are filled in.

1. Go to **Settings** (gear icon) > **Business** > **Business details**.
2. Under **Public details**, click **Edit** and fill in:
   - Business name: Move with Diana
   - Support email and support phone
   - Support address
   - Privacy policy URL: leave empty. The site has no privacy page and one is not planned for now.
   - Statement descriptor: something clients will recognize on a bank statement, for example `MOVE WITH DIANA`
3. Go to **Settings** > **Business** > **Customer emails**.
4. Under **Payments**, turn on **Successful payments**. Turn on **Refunds** as well.
5. Optional but worth it: **Settings** > **Business** > **Branding**. Upload your logo and set the brand color so the payment page looks like your site.

Note: Stripe does not send automatic receipt emails for test payments. That is normal.

## Part 3. Create the product

Go to **More** > **Product catalog** > **+ Add product**.

- **Name**: `8-Week Pilates Program`
- **Description**: `1 online assessment and 7 private online sessions over 8 weeks.`
- **Pricing model**: Flat-rate pricing
- Select **One time**. This matters: Affirm and Afterpay only work on one-time prices, not on recurring ones.
- **Amount**: `897.00` USD
- Click **Add product**

## Part 4. Create the payment link ($897)

1. Go to **Payment Links** and click **+ New**.
2. Choose **Products or subscriptions** and select the product from Part 3.
3. Leave quantity at 1. Do not turn on "Let customers adjust quantity".
4. In **Options**:
   - Turn on **Require customers to provide a phone number**.
   - Leave **Limit the number of payments** off. (It limits how many people can use the link, which is not what you want.)
   - Leave **Collect customer addresses** off unless your accountant asks for it.
5. Click the **After payment** tab (it may read **After the payment**).
   - Under **Confirmation page**, choose **Don't show confirmation page** and redirect customers to your website.
   - Paste: `https://movewithdianag.com/pilates-program/welcome`
   - Optional: turn on **Create an invoice PDF** if you want clients to get an itemized invoice as well as a receipt. Stripe charges a small fee for this on one-time payments, so it is fine to leave off.
6. Click **Create link**.
7. Click **Copy**. The link looks like `https://buy.stripe.com/xxxxxxxxxxxx`. Keep it for Part 7.

Leave the payment methods on the link set to automatic. That is the default, and it is what lets the pay-later methods, Apple Pay and Google Pay appear by themselves.

## Part 5. Turn on pay over time (Affirm, Klarna, Afterpay)

This is how a client spreads the cost. You do not run a plan and there is nothing to cancel or chase.

### How it works

- The client picks Klarna, Affirm or Afterpay on the Stripe payment page and goes through that provider's quick approval.
- **You are paid in full up front**, minus the fee. Stripe's wording for Affirm and Klarna is that it "makes the full amount of the funds (minus fees) available to you upfront". Affirm payouts can take up to 2 business days. Klarna and Afterpay follow your normal payout schedule.
- The client repays the provider, not you. If the client stops paying the provider, that is the provider's loss, not yours. (Stripe states this plainly for Klarna and Afterpay. For Affirm it says the client "repays Affirm directly".)
- Refunds and disputes are still yours to handle, the same as with a card. If you refund, the provider cancels the client's remaining installments. Clients can open a dispute for 120 days with Affirm and Afterpay, and 180 days with Klarna.

### Turn it on

1. Go to **Settings** > **Payments** > **Payment methods** (`https://dashboard.stripe.com/settings/payment_methods`).
2. Turn on **Affirm**. Klarna and Afterpay (may be listed as Cash App Afterpay) are left off for now. The page shows whether your account is eligible.
3. For Affirm, choose the **Standard** package unless you decide the higher fee of Enhanced is worth it (see the fees below).
4. To see what a buyer would see, open `https://dashboard.stripe.com/settings/payment_methods/review` and enter `897` and `USD`.

That is all. Because the link uses automatic payment methods, anything you turn on shows up on the $897 link without creating a new link. Stripe decides which methods to show each person, so not everyone sees every option.

### What a client is offered at $897

These are the providers' US terms in November 2026. The provider sets them and can change them, and approval is decided per person.

| Provider | Options in range at $897 |
| --- | --- |
| Klarna | Pay in 4, pay in 30 days, financing, or pay in full |
| Affirm | Monthly payments over 6, 12 or 18 months. Its pay in 4 only goes up to $500, so it is not offered. |
| Afterpay | Pay in 4, or monthly payments over 6 or 12 months |

Some of these carry interest that the provider charges the client. Some Klarna options are not available in every US state.

### The fees

A pay-later sale costs you about twice the card fee. Check `https://stripe.com/pricing/local-payment-methods` for today's numbers before you rely on these.

| Method | Fee | On $897 | You receive |
| --- | --- | --- | --- |
| Card, Apple Pay, Google Pay (US card) | 2.9% + $0.30 | $26.31 | $870.69 |
| Klarna | 5.99% + $0.30 | $54.03 | $842.97 |
| Affirm, Standard | 6% + $0.30 | $54.12 | $842.88 |
| Affirm, Enhanced | 7.99% + $0.30 | $71.97 | $825.03 |
| Afterpay | 6% + $0.30 | $54.12 | $842.88 |

- **You cannot charge more for pay-later.** All three providers forbid adding a fee or a higher price for clients who choose them. The price is $897 whatever the method.
- A lost Klarna dispute costs a $15 fee.
- Assume the pay-later fee is not handed back to you when you refund a client. This has not been confirmed either way.

### Things that can get in the way

- **US clients only.** These methods are offered to US customers paying in US dollars. Visitors from other countries see the price in their own currency and do not see them.
- **Account review.** Stripe says your account "might be reviewed after activation to confirm eligibility".
- **Business category.** Klarna is the least likely to object. Affirm does not accept "professional services" or "consulting", so make sure your Stripe business category is fitness (Part 1). Afterpay lists "health services" and "other personal services" as prohibited or needing extra approval, so it may not activate for you. The Payment methods page in Stripe shows the answer for your account.
- **Affirm wants a public price.** Affirm asks for a publicly reachable website that shows the price. The 8-Week Pilates Program pages are not in the site menu, so this could come up in a review. Tell Nick if it does.

### What the website may say about it

The order page does not mention paying over time. If you ever add a question about it at `/admin` (8-Week Program > FAQ questions & answers):

- Only keep the question while at least one pay-later method is turned on and active. If none is active, delete it.
- Do not promise terms or approval. Avoid "0% interest", "no credit check", "4 payments of $224.25" or "everyone qualifies". The provider sets the terms, the interest and the approval for each person.
- If you name Klarna or Affirm on the site, you must follow that provider's marketing rules, and you may not use their logos unless they come from the provider's own kit. Do not mention Affirm in text messages. Do not use the Afterpay name or logo without its consent. This is why the line on the site does not name a provider.

## Part 6. Apple Pay and Google Pay

There is nothing to set up. On a Stripe Payment Link they are on by default, and no domain registration is needed for the Stripe-hosted `buy.stripe.com` page.

- A client sees Apple Pay or Google Pay only if they have it set up on their device and are using a browser that supports it. So you may not see the button yourself on every device.
- They are charged at the card rate (2.9% + $0.30).
- To check, open **Settings** > **Payments** > **Payment methods** and confirm Apple Pay and Google Pay are on. The website does not list payment methods, so there is nothing to edit there if you turn one off.

## Part 7. Put the link on the website

1. Go to `https://movewithdianag.com/admin` and sign in.
2. Open **8-Week Program (order page, welcome, booking)** (this edits the file `src/content/program.json`), then scroll to **Order page (price & payment link)**.
3. Open **Price and Stripe link** and paste the link into the box **Stripe payment link** (`checkout.payInFull.stripeUrl` in the file).
4. Save and publish. The site rebuilds in a minute or two.

Paste the plain link only, with nothing after it. The website adds the extra details itself (see Part 8).

While the box is empty, the order page shows "Payment link coming soon" and an "Email me for a payment link" button instead of a pay button.

## Part 8. What the website adds to the link (for the developer)

The website adds these six URL parameters to the payment link when it knows them (`withPrefill` in `src/lib/intake.ts`). They go at the end of the link after a `?`, joined with `&`.

| Parameter | What it does | Rules |
| --- | --- | --- |
| `prefilled_email` | Fills in the email field on the payment page. The client can still change it. | Must be a valid email, URL-encoded (`@` becomes `%40`). Invalid values are ignored. |
| `client_reference_id` | Attaches your own reference to the payment so it can be matched to the intake form. Appears on the Checkout Session and in the `checkout.session.completed` webhook. | Letters, numbers, dashes and underscores only, up to 200 characters. An email address is not valid here (no `@` or `.`), so use an intake or lead ID. Invalid values are silently dropped. |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` | Campaign tracking. Stripe copies these onto the redirect URL after payment, so the welcome page receives them. | Letters, numbers, dashes and underscores, up to 150 characters each. |

Stripe also supports these. The website does not send them:

| Parameter | What it does | Rules |
| --- | --- | --- |
| `locked_prefilled_email` | Like `prefilled_email`, but the client cannot edit it. Wins if both are sent. | Same as `prefilled_email`. |
| `utm_term` | One more campaign tracking value. | Same as the other `utm_` values. |
| `prefilled_promo_code` | Fills in a promotion code. | Only works if promotion codes are enabled on the link. |
| `locale` | Forces the payment page language, for example `en`, `es` or `pt-BR`. | Optional. Stripe picks the browser language by default. |

Example:

```
https://buy.stripe.com/xxxxxxxxxxxx?prefilled_email=jane%40example.com&client_reference_id=lead_2026-11-14_ab12cd&utm_source=instagram&utm_medium=dm&utm_campaign=pilates-program
```

Notes:

- The website sends `prefilled_email` rather than the locked version so a client can pay with a different email if they want to.
- Do not put health details or anything private in `client_reference_id`. Links get forwarded.
- The redirect URL can include `{CHECKOUT_SESSION_ID}` if the welcome page ever needs it, for example `https://movewithdianag.com/pilates-program/welcome?session_id={CHECKOUT_SESSION_ID}`. This is optional and the page works without it.
- You can preview these parameters in Stripe: open a payment link, click the arrow next to **Copy**, and choose **URL parameters**.

## Part 9. Test before going live

Stripe has a practice area where no real money moves.

1. In the Dashboard, click your account name (top left) and choose **Sandboxes**, or switch on **Test mode** if your Dashboard shows that toggle.
2. Repeat Parts 3 and 4 there. Test links start with `https://buy.stripe.com/test_`.
3. Open the test link and pay with the test card `4242 4242 4242 4242`, any future expiry date, any 3-digit CVC and any ZIP code.
4. Check that:
   - the phone number field is shown and required
   - you land on `https://movewithdianag.com/pilates-program/welcome` afterwards
   - the payment appears under **Payments**
5. Products made in a sandbox can be copied across with **Copy to live mode** on the product page. Payment links do not copy, so create the live link again in live mode.
6. Only the live link (no `test_` in the address) goes on the website.

## Quick checklist

- [ ] Stripe account activated and bank account connected, business category set to fitness
- [ ] Public details filled in, receipts for successful payments turned on
- [ ] One product: $897, one time
- [ ] One payment link, phone number required
- [ ] The link redirects to `https://movewithdianag.com/pilates-program/welcome`
- [ ] The link tested in a sandbox
- [ ] Affirm turned on under **Settings** > **Payments** > **Payment methods** (Klarna and Afterpay left off for now), and you know your account was approved for it
- [ ] Apple Pay and Google Pay are on in the same place
- [ ] Before the live link goes on the site: the Zoom app is installed in Cal.com, Zoom is the location on all three booking types, and one recorded test session has been sent to a test client (`docs/SCHEDULING-SETUP.md`, sections 5 and 9). The order page says sessions are on Zoom and recorded, so this has to be true first
- [ ] Live link pasted into `checkout.payInFull.stripeUrl` at `/admin`

## Sources

- Create a payment link: https://docs.stripe.com/payment-links/create
- Customize a payment link (phone number, limits, URL parameters): https://docs.stripe.com/payment-links/customize
- Track a payment link (client_reference_id, UTM codes): https://docs.stripe.com/payment-links/url-parameters
- After a payment (redirects, receipts): https://docs.stripe.com/payment-links/post-payment
- Receipts: https://docs.stripe.com/receipts
- Dynamic payment methods: https://docs.stripe.com/payments/payment-methods/dynamic-payment-methods
- Affirm: https://docs.stripe.com/payments/affirm and https://stripe.com/legal/affirm
- Klarna: https://docs.stripe.com/payments/klarna, https://docs.stripe.com/payments/klarna/compliance and https://docs.stripe.com/payments/klarna/disputes
- Afterpay: https://docs.stripe.com/payments/afterpay-clearpay and https://stripe.com/afterpay-clearpay/legal
- Fees for pay-later methods: https://stripe.com/pricing/local-payment-methods
- Products and prices: https://docs.stripe.com/products-prices/manage-prices
- Sandboxes: https://docs.stripe.com/sandboxes
