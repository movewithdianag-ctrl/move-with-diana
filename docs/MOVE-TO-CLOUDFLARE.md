# Moving the website from Netlify to Cloudflare Pages

This moves the website to a free Cloudflare account in Diana's name. The code does not change. Only the place that builds and serves the site changes.

There are two parts:

- **Part A: set up Cloudflare.** Safe to do any time. The real site stays on Netlify, and visitors notice nothing.
- **Part B: switch the web address.** Do this once Diana's final edits are done. This is the only step that touches her domain, so it is the only one that needs care.

Netlify keeps running until the very end, so we can always go back.

---

## What is already done (in the code)

- The site builds the same way on both hosts (`npm run build`, output folder `dist`).
- `.node-version` tells Cloudflare to build with Node 22, the same as on Nick's computer.
- `public/_headers` (keeps the booking pages out of Google) works on Cloudflare as it is.
- `public/_redirects` is only needed by Netlify. Cloudflare ignores it and shows a warning in the build log. That warning is expected. Delete the file after the switch.
- Tested in Cloudflare's own local simulator: every page, the admin editor at `/admin/`, images, and the "keep out of Google" header on `/book/*` all work.

## What you need before starting

- Diana's email address and a new password for her Cloudflare account. She (or Nick) types the password. Claude never does.
- Access to her GitHub account `movewithdianag-ctrl` to approve Cloudflare.
- The project's `.env` and `.env.local` files on Nick's computer. They hold the two settings in step A4.
- For Part B only: access to her Squarespace account (Domains).

---

## Part A: set up Cloudflare (safe now)

### A1. Create her Cloudflare account

1. Go to **dash.cloudflare.com/sign-up**.
2. Use Diana's email (the one she uses for the business). Choose a password.
3. Confirm the email Cloudflare sends.
4. If it asks what you want to build, skip it.

The free plan is all we need. Do not enter a card.

### A2. Start a Pages project from GitHub

1. In the left menu, open **Compute** then **Workers & Pages** (older menus just say **Workers & Pages**).
2. Click **Create application**.
3. Choose **Pages** (it may be a tab, or a small link that says "Looking to deploy Pages? Get started"). Do **not** pick a Worker.
4. Click **Import an existing Git repository** (may say **Connect to Git**).
5. Click **Connect GitHub**. GitHub opens:
   - Sign in as `movewithdianag-ctrl`.
   - Choose **Only select repositories** and pick `move-with-diana`.
   - Click **Install & Authorize**.
6. Back in Cloudflare, pick `move-with-diana` and click **Begin setup**.

### A3. Build settings

| Setting | Value |
| --- | --- |
| Project name | `movewithdianag` (this becomes `movewithdianag.pages.dev`; if it is taken, use `move-with-diana`) |
| Production branch | `main` |
| Framework preset | `React (Vite)` (or `None`; the next two lines are what matter) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | leave empty |

### A4. The two settings (environment variables)

Still on the same screen, open **Environment variables (advanced)** and add both. Copy each value from the file named, everything after the `=` sign, with no spaces or quotes.

| Variable name | Copy the value from | What breaks without it |
| --- | --- | --- |
| `VITE_WEB3FORMS_KEY` | `.env` | The contact form and newsletter signup stop sending. |
| `VITE_INTAKE_ENDPOINT` | `.env.local` | Applications on `/apply` do not reach the Google Sheet. |

Then click **Save and Deploy**. The first build takes 1 to 3 minutes.

If you skipped the variables, add them later under the project's **Settings** then **Variables and Secrets** (choose type **Text**, environment **Production**), then go to **Deployments** and click **Retry deployment** on the latest one. Variables only take effect on the next build.

### A5. Check the test address

Open `https://movewithdianag.pages.dev` (or the name you chose). Check:

- [ ] Home, About, Reviews and Contact pages load, with photos.
- [ ] Open `/apply` directly in a new tab. It loads (not a "not found" page).
- [ ] `/book/session` shows the calendar.
- [ ] `/pilates-program` shows the order page and the pay button.
- [ ] Send one contact form with the word TEST in it. It arrives in her inbox.
- [ ] Send one application with first name TEST. It appears in the Google Sheet. Delete the row afterwards.

Do not test the admin editor (`/admin`) here. Its login only knows the real address, so test it after Part B.

From now on, every change pushed to GitHub builds on **both** Netlify and Cloudflare. That is fine. Keep working as normal.

---

## Part B: switch the web address (after the final edits)

Her domain is registered at Squarespace, and Squarespace also holds the domain's records. Those records point the website at Netlify **and** keep her Gmail working. We move the records to Cloudflare first, check they all arrived, and only then point the website at Cloudflare. The site and email stay up the whole time.

### B1. Add the domain to Cloudflare

1. In Cloudflare, click **Add a domain** (may say **Onboard a domain**).
2. Type `movewithdianag.com`. Keep **Quick scan for DNS records** on. Continue.
3. Choose the **Free** plan.
4. Cloudflare shows the records it found. Compare them with this list. **Every line must be there.** Add any that are missing by hand.

| Type | Name | Content | Notes |
| --- | --- | --- | --- |
| A | `movewithdianag.com` (or `@`) | `75.2.60.5` | The site on Netlify, for now. |
| CNAME | `www` | `movewithdianag.netlify.app` | The www address, for now. |
| MX | `@` | `aspmx.l.google.com` | Priority 1. Gmail. |
| MX | `@` | `alt1.aspmx.l.google.com` | Priority 5. Gmail. |
| MX | `@` | `alt2.aspmx.l.google.com` | Priority 5. Gmail. |
| MX | `@` | `alt3.aspmx.l.google.com` | Priority 10. Gmail. |
| MX | `@` | `alt4.aspmx.l.google.com` | Priority 10. Gmail. |
| TXT | `@` | `trustpilot-one-time-verification-id=2e893321-7357-47df-92fa-56f69ccdcf51` | Trustpilot. |
| TXT | `_dmarc` | `v=DMARC1; p=none` | Email safety record. |
| CNAME | `_domainconnect` | `_domainconnect.domains.squarespace.com` | Squarespace helper. Harmless, keep it. |

5. For the A and the www CNAME, set **Proxy status** to **DNS only** (grey cloud) for now. The MX and TXT lines have no cloud.
6. Continue. Cloudflare shows **two nameservers**, for example `xxx.ns.cloudflare.com` and `yyy.ns.cloudflare.com`. Keep this tab open.

### B2. Point Squarespace at Cloudflare

1. Log in to Squarespace and open **Domains** then `movewithdianag.com`.
2. Open **DNS** (may say **DNS settings**) then **Nameservers**.
3. Choose **Use custom nameservers**. Remove the existing ones and enter the two Cloudflare names exactly.
4. Save. If Squarespace warns that its own records will stop being used, that is expected: Cloudflare now has the copy you checked in B1.
5. Back in Cloudflare, click **Check nameservers now**.

Cloudflare emails Diana when the domain is **Active**. That is often under an hour and can take up to a day. Nothing changes for visitors or email during the wait, because both places hold the same records.

### B3. Point the website at Cloudflare Pages

Only after the domain shows **Active** in Cloudflare:

1. Open **Workers & Pages**, then the `movewithdianag` project, then **Custom domains**.
2. Click **Set up a custom domain**, type `movewithdianag.com`, continue, and accept the record Cloudflare offers to create.
3. Do the same for `www.movewithdianag.com`.
4. Wait until both show **Active** (usually a few minutes, while the security certificate is issued).

If Cloudflare says a record already exists, or a domain stays **Pending** for more than 15 minutes: open the domain's **DNS**, delete the old record for that name (the A record `75.2.60.5` for `movewithdianag.com`, or the `www` CNAME to `movewithdianag.netlify.app`), then go back to **Custom domains** and click **Check DNS records** (or **Retry**). The site is down for a moment between the delete and the new record, so do both right away, one after the other.

### B4. Send www to the main address

Today `www.movewithdianag.com` forwards to `movewithdianag.com`. Keep it that way:

1. In Cloudflare, open the `movewithdianag.com` domain, then **Rules** then **Redirect Rules** (may be under **Rules** then **Overview**).
2. Create a rule from the template **Redirect from WWW to root**. Status code **301**, keep the path and query string. Deploy.

### B5. Check the live site

- [ ] `https://movewithdianag.com` loads. Your browser's developer tools (or Claude) show the server as `cloudflare`, not `Netlify`.
- [ ] `https://www.movewithdianag.com/about` lands on `https://movewithdianag.com/about`.
- [ ] `http://movewithdianag.com` lands on `https://`.
- [ ] Every check from A5 again, on the real address.
- [ ] `movewithdianag.com/admin` lets Diana sign in and shows her pages.
- [ ] Send Diana's Gmail a test email from another account. It arrives.
- [ ] Ask Claude to confirm the email (MX) records still point at Google.

### B6. Tidy up (wait a few days first)

1. In Netlify, open the site, then **Site configuration**, then **Delete this site**. Then cancel any paid Netlify plan.
2. Ask Claude to delete `public/_redirects` and update `DIANA-GUIDE.md` (sections 9 to 11), `README.md` and `integrations/google-sheet/SETUP.md`, which still say Netlify.

---

## Part C: Diana makes changes with her own Claude

She does not need a computer setup. Claude Code runs in the cloud, so she can use it from a web browser or the Claude phone app.

### C1. One-time setup (about 10 minutes)

1. She needs a paid Claude plan (Pro or higher) on her own Claude account.
2. On a computer, go to **claude.ai/code** and sign in.
3. Click **Connect GitHub**. GitHub opens: sign in as `movewithdianag-ctrl`, allow the Claude app for the `move-with-diana` repository, and approve.
4. Pick `move-with-diana` as the repository.
5. On her phone, install the **Claude** app and sign in. The **Code** section shows the same repository.

### C2. Making a change

1. Open claude.ai/code (or Code in the phone app) and pick `move-with-diana`.
2. Type what she wants in plain words, for example: "Change the home page headline to ...".
3. Claude makes the change and puts it on a new branch (a draft copy), not on the live site.
4. Cloudflare builds that draft on its own and gives it a preview link like `https://<draft-name>.movewithdianag.pages.dev`. Claude can tell her the link, and it is also under **Workers & Pages**, the project, then **Deployments**.
5. She opens the preview link on her phone and checks it.
6. If it looks right, she tells Claude "Publish it" (Claude merges it into `main`), or taps **Merge** on the pull request in GitHub. The live site updates in a few minutes.
7. If it looks wrong, she tells Claude what to fix, or just closes the session. Nothing went live.

Small text changes can still be made at `movewithdianag.com/admin`, with no Claude at all.

---

### If something goes wrong

- **Site down after B3:** Netlify is still running, so the old site can come straight back:
  1. In **Workers & Pages**, open the project, then **Custom domains**, and remove both domains.
  2. In the domain's **DNS**, delete the records Pages made for `movewithdianag.com` and `www`.
  3. Add an **A** record: name `movewithdianag.com`, content `75.2.60.5`, proxy **DNS only** (grey cloud).
  4. Add a **CNAME** record: name `www`, content `movewithdianag.netlify.app`, proxy **DNS only** (grey cloud).
  5. If you made the www rule in B4, turn it off under **Rules**.
- **Email stops after B2:** compare the MX lines in Cloudflare **DNS** with the table in B1 and add what is missing. In the worst case, switch Squarespace back to **Use Squarespace nameservers**. Its old records are still there.
