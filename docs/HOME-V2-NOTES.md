# Home page v2 notes

Home page v2 is a test copy of the home page. It lives at `/v2`.

It keeps the same hero photo, the same offers carousel and the same FAQ look as the live home page. The words are rewritten to be clear, not clever, and the page has one call to action: send Diana a message.

It is not in the menu, the footer or any sitemap. It tells search engines not to index it. The live home page is not changed.

## Where things are

- Page: `src/pages/HomeV2.tsx`
- Words: `src/content/homeV2.json` (edit in the admin panel under "Home page v2")
- Typed adapter: `homeV2` in `src/content/content.ts`
- Admin form: the `homeV2` entry in `public/admin/config.yml`
- Route: `/v2` in `src/App.tsx` (the path is `HOME_V2_PATH` in `content.ts`)

## Rules for the words

- Facts only. Every claim comes from the existing content files.
- No prices, guarantees, bonuses, discounts, scarcity, client counts or years of experience.
- No medical claims. Pilates is exercise, not medical care.
- Classical Pilates only.
- Diana's voice, first person, short sentences.
- No em dashes or en dashes. Write "24 to 48" and "2 to 4".
- Reviews are picked by name. The text is pulled from `testimonials.json`, word for word. Never retype a review.

## The one call to action

- Main button: "Send me a message". It opens `/contact?interest=private-1:1`, which selects "Private 1:1" in the contact form.
- Second action: "See what I offer". It opens `/offers`.
- There is no link to the 8-Week Pilates Program, `/apply` or the order page. That program is not public yet.

## What each section is for

1. Hero. Says what this is, where, and who teaches it, in five seconds. Same photo as the live page.
2. Who it's for. A plain list so the right visitor can say "that's me".
3. What we work on together. Says what the sessions cover. No result is promised.
4. Reviews. Three real client reviews and a link to the full reviews page. They sit near the top so new visitors see them.
5. The method. Says what Classical Pilates is and how private sessions work, in four steps.
6. What you get with me. The reasons to choose Diana: certification, planned for you, all levels, always live.
7. Four ways to work with me. A short intro, the unchanged offers carousel, then the main button.
8. How to start. Three steps, so the visitor knows what happens after they write.
9. FAQ. Answers the common objections in this order: beginner, booking and cost, location, health, coming with a friend, athletes, what Classical Pilates is.
10. Closing band. The same call to action one last time. It is the last thing on the page.

## Flags for the owner

- A section called "Why a general class can feel like the wrong fit" was removed. Its points were not facts from the site content, and it argued against group classes on a page that also offers them. One sourced line stays in the "Who it's for" list: "You tried a group class and want more personal attention."
- The Spencer review mentions improvements "in the past month and a half". It is shown word for word, as stored. If Diana wants no result language at all on this page, swap Spencer for Jordan W or Darielle Gaines.
- The heading "Four ways to work with me" has the number in it. If an offer is added or removed, change the heading.
- Reply time is always written as "usually within 24 to 48 hours", the same as the contact page. Keep it hedged.

## Search engines

`/v2` is kept out of search results in two ways. The page adds a noindex tag, and `public/_headers` tells Netlify to send `X-Robots-Tag: noindex, nofollow` for `/v2`. Remove both when v2 becomes the real home page.

## Left out on purpose

The sales page outline asked for these. They are left out because Diana has not agreed any of them.

- Bonuses. None exist.
- Guarantee. None exists for the general offers. The promise in `program.json` belongs to the unreleased 8-Week Pilates Program.
- Pricing, anchor price and value stack. There are no public prices. The page says pricing is discussed by message, the same as the live FAQ.
- Proof placeholders. None render. Proof is three real stored reviews.
- Pattern interrupt opening. Replaced by the plain "Private Pilates is a good fit if" list.
- Vivid future pacing. Replaced by "What we work on together", with no promised result.
- Three button labels on the page. One label is used everywhere. The others are listed below.
- Scarcity, urgency, discounts, client counts, years of experience. No facts to support them.
- "Reduces injury risk" and "improves movement efficiency". These read as health outcome claims, so v2 does not use them.
- Any mention of the 8-Week Pilates Program, session lengths, equipment lists or camera setup. Those facts belong to the unreleased program.
- A hard coded review count. It changes often.
- Reviews that centre on pain, injury or recovery. They stay on the reviews page.

## Runner-up headlines

Chosen:

- Small label: Diana Gonçalves, Romana's Pilates certified instructor
- Headline: Private Classical Pilates in Boca Raton and online
- Subhead: One to one sessions in the original Pilates method. Beginners welcome. Every session is tailored to your current level.

The headline is short on purpose so the whole top of the page fits on a phone screen.

Runners-up, ready to test:

1. Headline: Classical Pilates, taught one to one, at your level
   Subhead: In person in Boca Raton or live online. I work with complete beginners, advanced practitioners and athletes.
2. Headline: New to Pilates? Start with a private session built for you.
   Subhead: Classical Pilates with Diana Gonçalves, in person in Boca Raton, Florida or live online. Every session is tailored to your current level.
3. Headline: Private Pilates sessions in Boca Raton and online
   Subhead: The original Pilates method, taught one to one. I watch how you move and correct your form as you go, in person or on camera.
4. Headline: Private Classical Pilates, planned for your body
   Subhead: For beginners, advanced practitioners and athletes. In person in Boca Raton, Florida, or live online with Diana Gonçalves.

To try one, change "Big headline" and "Sentence under the headline" in the admin panel under Home page v2, Top of page.

## Button label options

1. Send me a message (chosen)
2. Ask about a private session
3. Message Diana

To try one, change "Main button" in the admin panel under Home page v2, Buttons. Keep one label for the whole page.

## Alternate reviews

Shown now: Spencer, Ida, Lila Male.

Also suitable: Darielle Gaines, Jordan W.

To swap, change the names under Home page v2, Reviews. The name must match the name in Testimonials exactly.

## How to make v2 the real home page later

1. Get Diana's approval on the words.
2. In `src/App.tsx`, point the `/` route at `HomeV2` instead of `Home`.
3. In `src/pages/HomeV2.tsx`, remove `noindex` from the `Seo` tag and set `path="/"`. Delete the `/v2` block in `public/_headers`.
4. Decide what to do with `/v2`. Either remove the route or redirect it to `/`.
5. Keep `src/pages/Home.tsx` and `home.json`. The hero photo fields in `home.json` are still used by v2, and the old page is the fallback if you want to go back.
6. The live hero button goes to the Skool community. V2 sends people to the contact form instead. Check that this is what Diana wants before the switch.
7. Run `npx tsc --noEmit -p .` and `npm run build`, then check the page on a phone.
