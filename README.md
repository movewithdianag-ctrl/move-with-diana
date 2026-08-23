# Move with Diana

Marketing site for Diana Gonçalves — Certified Personal Trainer & Classical
Pilates Instructor. React 18 + Vite + TypeScript + Tailwind CSS.

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, Cloudflare
Pages). Configure the host to serve `index.html` for all routes (SPA
fallback) so `/about`, `/offers`, and `/contact` work on direct load.

## Editing the site (no developer needed)

**Diana's path — the admin panel.** All copy and photos are edited at
`/admin` (Decap CMS + DecapBridge login: email/password or Google, no GitHub
account). See [`DIANA-GUIDE.md`](DIANA-GUIDE.md) for the printed walkthrough.
Publishing commits to this repo, which triggers a redeploy (~2 min).

**Developer path.** Content lives in the JSON files in
[`src/content/`](src/content/) (settings, home, about, offers, contact,
footer, testimonials); [`src/content/content.ts`](src/content/content.ts) is
the typed adapter mapping them onto component-facing shapes — change JSON
freely, change the adapter only when adding fields. The admin schema is
[`public/admin/config.yml`](public/admin/config.yml). To run the admin
locally without auth: `npx decap-server` alongside `npm run dev`, then open
`/admin/index.html`.

- **Weekly schedule** — display-only Google Calendar embed; the URL, the
  Skool community link, and the schedule section's visibility are all
  CMS-editable under "Site settings". Calendar setup steps live at the top of
  [`src/components/ScheduleEmbed.tsx`](src/components/ScheduleEmbed.tsx).

## Before launch — humans must fill these

1. `VITE_WEB3FORMS_KEY` in `.env` (copy `.env.example`; free key from
   https://web3forms.com using movewithdianag@gmail.com). Contact + newsletter
   forms email submissions to Diana's inbox through this key.
2. `GOOGLE_CALENDAR_EMBED_URL` in `src/lib/config.ts` (until then a labeled
   sample week is shown).
3. Replace `[YOUR CITY]` in `src/content/content.ts` (`site.city` and
   `site.basedInLine`) with Diana's real city.
4. Replace placeholder images in `public/images/`.
5. Update `SITE_ORIGIN` in `src/components/Seo.tsx` if the production domain
   ever changes from movewithdianag.com.

## Future work (structure is ready, nothing built)

Memberships / payments / on-demand video were deliberately excluded. Clean
seams for later: add routes in `src/App.tsx`, new content blocks in
`src/content/content.ts`, and swap the form transport in `src/lib/contact.ts`
(e.g. to Supabase + Resend) without touching any UI component.
