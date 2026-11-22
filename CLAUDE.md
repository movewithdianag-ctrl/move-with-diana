# Move with Diana: notes for Claude

This is Diana Gonçalves's website, movewithdianag.com (Classical Pilates, in person and online). Diana edits it herself, sometimes with Claude. She is not a developer, so explain things in plain, simple English and do the technical steps for her.

## How the site works

- React 18 + Vite + TypeScript + Tailwind. `npm run dev` runs it locally on port 5173. `npm run build` must pass before any push.
- Almost all words on the site live in `src/content/*.json` and are read through `src/content/content.ts`. Change copy in the JSON, not in the components.
- Diana can also edit copy in the browser at movewithdianag.com/admin (Decap CMS, login through DecapBridge). Its fields are defined in `public/admin/config.yml`. A new JSON field must also be added there, or the editor will drop it when she saves.
- A section with empty text hides itself. To remove a line, set it to `""` rather than deleting the key.
- Every push to `main` goes live automatically within a few minutes. There is no staging site. Check your work with `npm run build` and the local preview before pushing.
- Hosting moves from Netlify to Cloudflare Pages; see `docs/MOVE-TO-CLOUDFLARE.md` for where that stands.

## Other systems (not in this repo)

- **Booking calendars:** Cal.com, user `movewithdianag`. The three calendars and their reminders are documented in `docs/SCHEDULING-SETUP.md`. The text reminder's phone box only exists while the text reminder workflow is switched on for that calendar.
- **Payments:** Stripe payment link, set in `src/content/program.json`.
- **Program applications (`/apply`):** saved to a Google Sheet by the Apps Script in `integrations/google-sheet/`. Changing `Code.gs` here does nothing until it is pasted into Apps Script and deployed as a new version (see `integrations/google-sheet/SETUP.md`).
- **Contact form and newsletter signup:** Web3Forms.

## Rules

- **Never commit secrets.** `.env` and `.env.local` stay out of git. Never write the Google Sheet link or ID, the Apps Script web app URL, or any API key into a file in this repo. The repo is public.
- **Privacy:** names, emails and health answers never go into URLs, analytics or text messages.
- **Copy style:** be clear, not clever. Short, plain sentences. No em dashes or en dashes. No invented facts, prices, guarantees or promises. No medical claims (Pilates is exercise, not treatment). It is Classical Pilates. Skip filler reassurance.
- When Diana gives exact wording, use it exactly.
- Show her the change in the local preview, or give her the page link once it is live, and tell her in a sentence or two what changed.
- In a cloud session (claude.ai/code or the phone app) there is no local preview. Push to a branch, not `main`, and give her the Cloudflare preview link for that branch. Merge to `main` only when she says to publish.

## Useful docs

- `DIANA-GUIDE.md`: Diana's own guide to editing the site.
- `docs/SCHEDULING-SETUP.md`: Cal.com calendars and reminders.
- `docs/CLIENT-PLAYBOOK.md`: what happens after someone applies or pays.
- `docs/MOVE-TO-CLOUDFLARE.md`: moving the hosting off Netlify.
