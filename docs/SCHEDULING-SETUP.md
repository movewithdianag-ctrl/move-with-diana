# Scheduling setup for the 8-Week Pilates Program

Last checked: 15 November 2026. Free plans change often, so if something below does not match what you see on screen, trust the screen and tell Nick.

This guide is for Diana. It covers which booking tool to use, how to set it up step by step, and what to paste into the website so the welcome page can show the booking calendars.

**Where things stand now.** Your Cal.com account exists (username `movewithdianag`), the three booking links are created and already pasted into the website. Your hours are set (Monday to Friday, 9:00 am to 4:00 pm Eastern), all three booking types wait for your approval, and three reminders are switched on. Sections 6, 7 and 8 describe the settings that are on your account today and why. Sections 3 and 4 are kept for reference in case anything ever has to be set up again.

**Still needed**

- Diana: install the Zoom app inside Cal.com and set Zoom as the location on the three event types (section 5). This comes before the Stripe link goes live, because the order page already says sessions are on Zoom and recorded. Record one test session and send the recording to check it works.
- Diana: check whether the text reminder really sends on the free plan (the "Reminders" section after section 8).
- Diana: make sure notifications are on for your mail app. Lead alerts now come by email only, with no extra app to install. You can mark the alert sender as a VIP or give it its own sound so a new lead stands out (`docs/LEAD-ALERTS-SETUP.md`).
- Nick: deploy the Google Sheet script and give the site its web app URL as `VITE_INTAKE_ENDPOINT` (`integrations/google-sheet/SETUP.md`).
- Nick and Diana: create the Stripe Payment Link, and switch on the pay-later methods in Stripe (`docs/STRIPE-SETUP.md`).
- Nick: review the copy and the pages and ask for changes.

**No longer needed**

- Your real weekly hours. They are in.
- A privacy policy page, the private hub link on the welcome page, a referral reward, and a price for anything after week 8.

---

## 1. The short answer

**Use Cal.com on the free plan.** Fallback if Cal.com does not work out: **Zcal** (free plan).

### Why Cal.com

| What you need | Cal.com free plan |
| --- | --- |
| Three event types (75 min, 60 min and a 15 min call) | Yes. Unlimited event types. |
| Works with Apple Calendar (iCloud) | Yes. Connects with your Apple ID and an app-specific password. |
| Also check a Google calendar | Yes. Unlimited connected calendars, so iCloud and Gmail can both be checked. |
| Never double-book | Yes. You tick which calendars count as "busy". |
| New bookings appear in your calendar | Yes. You choose one calendar to write to. |
| Fixed weekly hours | Yes. One availability schedule shared by all three events. |
| Buffers, minimum notice, booking window | Yes, per event type. |
| Embeds inline on the website | Yes. Official inline embed that resizes itself. |
| Video link included | Yes. Cal Video is built in and free, and it is what the events use today. Your sessions are meant to run on Zoom, which you add by installing the Zoom app (section 5). |
| A booking link that is not public | Yes, unlisted. Hide the event from your public page and only share the link on the welcome page. It is not locked: anyone who has the link can ask for a time, so you approve each booking (section 8). |
| Cost | $0 for one user. |

### Things the free plan does NOT do (so nothing surprises you)

- **Recording in Cal Video needs a paid Team plan.** Your sessions are recorded, so they run on Zoom and Zoom does the recording. See sections 5 and 9.
- **"Powered by Cal.com" branding stays** on the booking widget. Removing it is a paid feature.
- **Text reminders may not send on the free plan.** The two email reminders and the text reminder are switched on (see "Reminders" after section 8). Whether the text really goes out on the free plan is not confirmed yet.
- **Recurring bookings are paid.** You do not need them. Your schedule changes every week, so clients book their weekly sessions one at a time.

### How the options compare

| Tool | Free plan event types | iCloud / Apple Calendar | Embed on a website | Payments and redirect | Gotchas |
| --- | --- | --- | --- | --- | --- |
| **Cal.com** (pick) | Unlimited | Yes, unlimited calendars | Yes, inline, popup or button | Stripe and PayPal on free. Redirect after booking exists as a setting, plan not stated in their docs. | Recording in Cal Video, branding removal and recurring events are paid. Text reminders may need credits or a paid plan, not confirmed yet. |
| **Zcal** (fallback) | Unlimited | Yes ("Apple Calendar" listed on the free plan), unlimited calendar accounts | Yes | Stripe on free with a 3% fee. Custom redirect is paid. | Small company. Reviews mention slow support. |
| Koalendar | Unlimited booking pages | Yes, but only 2 calendars on free | Yes | No payments and no redirect on free | Free video is Google Meet only. Branding stays. |
| TidyCal | Unlimited booking types | Yes, but only 1 calendar to read on free | Yes | Stripe and PayPal with a 1% fee. Redirect is paid. | One calendar is not enough if you keep more than one. |
| Calendly | **1 event type** on free | **No new iCloud connections** (reported as closed to new connections since August 2024) and 1 calendar connection | Yes | Payments are paid plans only | Fails twice: you need two event types and iCloud. |
| Google Calendar appointment schedules | 1 booking page on a free personal account | Only checks Google calendars, not iCloud | Yes, as a simple frame | Payments need paid Workspace | Would mean moving your whole schedule into Google. |
| SavvyCal | You can build links for free, but people can only book on a paid plan (from about $10 to $12 a month) | Yes | Yes | Paid | Not a real free option. |

---

## 2. Before you start (5 minutes)

Have these ready:

1. Your **Apple ID email and password**, and your iPhone nearby (Apple will send a code).
2. The login for **movewithdianag@gmail.com**, if any of your appointments live in that Google account.

### Quick check: where do your calendars actually live?

This matters. The Apple Calendar app can show calendars from several places. Cal.com can only block times on calendars it is connected to.

1. Open the **Calendar** app on your Mac.
2. Look at the left sidebar (if you do not see it, click the calendar icon at the top left).
3. Calendars are grouped under headings such as **iCloud**, **Google** or your Gmail address, and **Other** or **Subscribed**.

- Calendars under **iCloud**: covered by the Apple connection in section 4.
- Calendars under **Google** or **movewithdianag@gmail.com**: you must ALSO connect Google in section 4, step 9. They are not part of iCloud.
- Calendars under **On My Mac**: these never leave your computer and no booking tool can see them. Move those events to an iCloud calendar.
- **Subscribed** calendars (holidays, a studio schedule feed): not seen by the Apple connection. If one of them has real commitments on it, tell Nick.

---

## 3. Create your Cal.com account

1. Go to **https://cal.com** and click **Get started** (or **Sign up**).
2. Sign up with **movewithdianag@gmail.com**. Choosing "Continue with Google" is the quickest.
3. Pick your **username**. This becomes part of every booking link. Yours is `movewithdianag`, so your links look like `cal.com/movewithdianag/...`.
4. Enter your name as **Diana Goncalves**.
5. Set your time zone to **America/New_York** (Eastern Time).
6. If it offers to connect a calendar or video app during the welcome steps, you can skip and do it properly in the next section.
7. If it asks about a plan or trial, choose the **Free** plan for individuals. You do not need Teams.

---

## 4. Connect your Apple (iCloud) calendar

Cal.com cannot use your normal Apple password. Apple makes you create a special one-time "app-specific password" for it. This is safe and you can cancel it at any time.

### Part A: create the app-specific password at Apple

1. Go to **https://appleid.apple.com** (Apple may send you on to account.apple.com, that is the same place).
2. Click **Sign In** and log in with your Apple ID. Enter the 6 digit code sent to your iPhone.
   - Two-factor authentication must be on for your Apple ID. On almost every account it already is.
3. Open **Sign-In and Security**.
4. Click **App-Specific Passwords**.
5. Click **Generate an app-specific password** (or the **+** button).
6. Name it `Cal.com` and click **Create**. Apple may ask for your Apple password again.
7. Apple shows a password that looks like `abcd-efgh-ijkl-mnop`. **Copy it now.** Apple only shows it once. Leave this tab open until Part B is done.

### Part B: connect it inside Cal.com

1. In Cal.com, click **Settings** (bottom left, or click your name).
2. Click **Calendars**.
3. Click **Add calendar** (it may say **Connect your first calendar**).
4. Choose **Apple Calendar** and click **Install**.
5. In the Apple Calendar setup screen:
   - **Apple ID**: your Apple ID email.
   - **Password**: paste the app-specific password from Part A (NOT your normal Apple password).
6. Click **Save**. You are taken back to **Settings > Calendars** and your iCloud calendars are listed.

### Part C: choose which calendars block your time

Still on **Settings > Calendars**:

7. Under your Apple account you will see every iCloud calendar (for example Home, Work, Family). Turn the **Check for conflicts** switch **ON** for every calendar that holds real commitments: in-studio clients, personal appointments, family, travel. If in doubt, switch it on. A calendar that is switched off will be ignored and you could get double-booked.
8. At the top, find **Add events to**. Choose the ONE calendar where new bookings should be written. Recommended: make a new iCloud calendar called **Online Clients** in the Apple Calendar app first (File > New Calendar > iCloud), then pick it here. Make sure that calendar is also switched ON in step 7.

### Part D: connect Google too (only if section 2 showed Google calendars)

9. Click **Add calendar** again, choose **Google Calendar**, click **Install**, sign in as **movewithdianag@gmail.com** and allow access. Then switch **Check for conflicts** ON for those calendars as well.

### Good to know

- Changes you make in Apple Calendar can take a few minutes to reach Cal.com. That is normal for iCloud.
- An event only blocks time if it is marked busy. All-day events and events you declined may not block time.
- If you ever change your Apple ID password, Apple cancels all app-specific passwords. Bookings will stop checking your calendar until you repeat Part A and Part B. Cal.com emails you if the connection breaks.

---

## 5. Set up the video link

**What is set today:** all three event types use **Cal Video**, which is built into Cal.com. Every booking gets its own private video link automatically, in the confirmation email and in the calendar event on both sides.

**What it should be:** your sessions are on Zoom and are recorded, and the client gets the recording. Switching to Zoom cannot be done for you. You have to install the Zoom app yourself, logged in as you.

### Switch the three events to Zoom (a manual step for Diana)

1. Log in at **https://app.cal.com** as yourself.
2. Click **Apps** in the left menu (the Cal.com App Store), search for **Zoom**, open it and click **Install**.
3. Sign in to your Zoom account when it asks, and allow the connection.
4. Click **Event types** (or **Links**) and open the first of the three 8-Week Pilates Program events.
5. Under **Location**, choose **Zoom** and remove Cal Video. Click **Save**.
6. Repeat steps 4 and 5 for the other two, so that the quick call, the online assessment and the weekly session all use Zoom.
7. In Zoom, open **Settings**, then **Recording**, and switch on recording. Cloud recording gives you a link you can send to the client. Local recording saves a file on your computer that you then share by a private link.
8. Make one test booking (section 11) and check that the confirmation email now carries a Zoom link.

Two things to check on your own Zoom plan before you rely on it:

- A free Zoom account usually ends a meeting at 40 minutes. Your assessment is 75 minutes and your sessions are 60. If your Zoom account has that limit, you need a paid Zoom plan, or the meeting will cut off part way through.
- Cloud recording is normally a paid Zoom feature. Local recording normally works on a free account.

The website says "live on video" and does not name Zoom, so nothing on the site has to change when you switch.

---

## 6. Your weekly hours

The three 8-Week Pilates Program event types use their own schedule, separate from anything else in your Cal.com account. It is called **8-Week Pilates Program hours**.

| Day | Hours offered (Eastern time, America/New_York) |
| --- | --- |
| Monday to Friday | 9:00 am to 4:00 pm |
| Saturday | Closed |
| Sunday | Closed |

These are the outer limits. Inside them, Cal.com removes anything that is already on your connected Apple and Google calendars, so a client is only ever offered time that is really free. Every request still waits for your approval (section 8).

Why a separate schedule: you can change your online client hours without touching anything else, and nothing else can change them by accident.

### Every Friday

Your week is different every week, so you do not hold a fixed weekly time for a client. Instead:

1. Every Friday, plan next week in Apple Calendar. Put in everything that takes your time.
2. Cal.com then offers clients whatever is left between 9:00 am and 4:00 pm, Monday to Friday. You do not have to touch Cal.com for this.
3. To keep a time free without a reason, add an event called "Busy" in Apple Calendar.
4. Accept or decline the booking requests that are waiting.

Clients book their weekly sessions one at a time, and the session calendar only shows the next 14 days, so your Friday plan is what they choose from. Changes in Apple Calendar can take a few minutes to reach Cal.com.

### If the hours ever need to change

1. Log in at **https://app.cal.com**.
2. Click **Availability** in the left menu.
3. Click the schedule named **8-Week Pilates Program hours**.
4. Check the time zone says **America/New_York**.
5. Use the switch to turn a day on or off, and click the start and end time to change them. To add a second block on the same day, click the **+** next to that day.
6. Click **Save**.

You do not need to change the event types. All three already point at this schedule and pick up new hours straight away.

Holidays and trips: on the same Availability screen, use **Date overrides** to block a day or change hours for one date. Or simply put an event in your Apple Calendar. That blocks the time too.

---

## 7. Your three event types

Cal.com is in the middle of renaming "Event types" to "Links" in its menus. If you see **Links** or **Booking links**, that is the same thing.

These three are already created on your account. This is what is set on each one today, and why.

| | Quick call | Online assessment | Weekly session |
| --- | --- | --- | --- |
| Link | `cal.com/movewithdianag/strong-safe-call` | `cal.com/movewithdianag/strong-safe-assessment` | `cal.com/movewithdianag/strong-safe-session` |
| Page on your site (once the site changes are published, see section 10) | `movewithdianag.com/book/intro-call` | `movewithdianag.com/book/assessment` | `movewithdianag.com/book/session` |
| Length | 15 minutes | 75 minutes | 60 minutes |
| Start times offered | Every 15 minutes | Every 15 minutes | Every 15 minutes |
| Earliest booking | 2 hours ahead | 12 hours ahead | 24 hours ahead |
| Furthest booking | 5 days out | 10 days out | 14 days out |
| You approve each one | Yes | Yes | Yes |
| Schedule | 8-Week Pilates Program hours | 8-Week Pilates Program hours | 8-Week Pilates Program hours |
| Location today | Cal Video (Zoom once installed, section 5) | Cal Video (Zoom once installed) | Cal Video (Zoom once installed) |
| "Add guests" field on the form | Hidden | Hidden | Hidden |
| "Phone number (Text notifications)" field | Shown, optional | Shown, optional | Shown, optional |

Why each setting is the way it is:

- **Start times every 15 minutes, on all three.** More start times means a client is more likely to find one that fits their day.
- **You approve every booking, on all three.** Your schedule changes from week to week, so nothing is final until you say yes. The client gets a note that the request was sent, and the confirmation email once you accept.
- **Quick call: 2 hours ahead.** Someone with a question can talk to you the same day, while they are still interested. Accept these quickly.
- **Quick call: up to 5 days out.** A call booked for next week is often forgotten. A short window keeps it close.
- **Assessment: 12 hours ahead.** A new client can start as soon as tomorrow, and you still have the evening to read their notes.
- **Assessment: up to 10 days out.** New clients begin while they are keen, not three weeks after paying.
- **Weekly session: 24 hours ahead.** You always have a day to plan the session.
- **Weekly session: up to 14 days out.** Sessions are booked one at a time, from the week you planned on Friday. A client cannot take a time months ahead that you may not be able to keep.
- **Guests hidden.** These are private sessions, so the form does not offer to invite anyone else.
- **One phone box, optional.** The form shows "Phone number (Text notifications)". Cal.com adds that box itself because the text reminder is switched on, and the reminder texts the number typed there (see "Reminders" after section 8). A client can leave it empty. Cal.com's own "Phone number" box is hidden so clients are not asked twice. Do not switch it back on, and do not remove the text reminder from an event, or the text box disappears from that form.

### Where to change any of these

1. Click **Event types** (or **Links**) in the left menu.
2. Click the event you want to change.
3. Open the **Limits** tab for **Minimum notice** (earliest booking), **Limit future bookings** (furthest booking), **Time-slot intervals** (start times) and the buffers before and after.
4. Open the **Availability** tab to see which schedule it uses.
5. Open the **Advanced** tab for **Requires confirmation** and the booking questions.
6. Click **Save**.

Optional but recommended on the weekly session, under **Limits**: **Limit booking frequency** to a number per day that suits you, so your day cannot fill up without you noticing.

### If an event ever has to be created again

1. Click **Event types** (or **Links**), then **New**.
2. Fill in the **Title**, the **URL** (the last part of the link in the table above) and the **Duration**.
3. Click **Continue** (or **Create**).
4. **Location**: choose **Zoom** if the Zoom app is installed (section 5). Otherwise choose **Cal Video**.
5. Set the **Availability**, **Limits** and **Advanced** tabs to match the table above.
6. Click **Save**. If the link changed, paste the new one into the website (section 10).

---

## 8. Keep the assessment and the sessions for paying clients only

The goal: the assessment and session links are unlisted, and no booking is final until you have checked that the person has paid. The 15 minute quick call is different in one way only. It is free, and it is for people who applied and still have a question before they pay, so there is no payment to check. It still waits for your approval like the other two, and you confirm it by email when you accept.

Be clear about what the website does and does not do. The welcome page (`/pilates-program/welcome`) is where Stripe sends people after they pay, but the page itself is not locked. It cannot tell whether a visitor has paid. Anyone who has its address can open it and see both calendars. So the lock is you: **Requires confirmation** is ON for all three events (section 7), and you accept an assessment or a session only when the email matches a payment in Stripe. Do not rely on the name: the welcome page fills in the first name from the application, so a request often shows a first name only.

1. Go to **Event types** (or **Links**).
2. Next to the weekly session, switch the toggle **OFF**. This marks it **Hidden**. It disappears from your public page at `cal.com/movewithdianag`, but the direct link still works for anyone who has it.
3. Do the same for the online assessment. It is also for paying clients, so hide it too.
4. Delete or hide the sample event types Cal.com created for you (15 Min Meeting, 30 Min Meeting, Secret Meeting), so your public page is empty.
5. Only share these two links through the welcome page on your website and in direct messages to enrolled clients. The quick call link is fine to share with anyone who has applied.

How safe is this? A hidden link is "unlisted", like an unlisted YouTube video. It is not password protected. If a client forwarded the link, or someone opened the welcome page without paying, they could ask for a time. Two safeguards:

- Keep **Requires confirmation** ON for all three events (each event, **Advanced** tab). Every request waits for you to tap Accept. The trade-off is one extra tap per booking. Approval stays on. It is how the booking system works with a schedule that changes every week.
- Before you accept an assessment or a session, look the email up in Stripe (**Payments**). If the email is different, check the name too, or ask the client. If there is no payment, decline it with one click.
- One exception: an existing private client who is not in the program, and who you sent `movewithdianag.com/book/session` to yourself. They have no program payment in Stripe to match. Accept that request only when you know the person and sent them the link. Decline anyone else.

There is also a feature called **Private links** (inside the event, under Privacy & security or Advanced). It creates extra secret URLs that can expire after a set number of bookings, for example 7. It is useful if you want to DM one client a personal link that stops working after their 7 sessions. Note that turning it on does not switch off the normal link, so you still need the hidden toggle above. The website does not need this feature.

---

## Reminders (Workflows)

People show up when they are reminded. Cal.com sends the confirmation email with the video link when you accept a booking. On top of that, three reminders are already switched on for you. They were created on 15 November 2026 and you can see them in Cal.com under **Workflows** (if you do not see it in the left menu, click **More** first). They are named:

| Workflow name | What it does |
| --- | --- |
| `8-Week Pilates Program: email reminder 24 hours before` | Emails the client 24 hours before every booking. |
| `8-Week Pilates Program: email reminder 3 hours before` | Emails the client 3 hours before every booking. |
| `8-Week Pilates Program: text reminder 3 hours before` | Texts the client 3 hours before, only when they typed a number into the "Phone number (Text notifications)" box on the booking form. That box is optional. |

You do not have to create anything. To change the wording, open a workflow, edit the message and click **Save**.

### Not confirmed yet: do the texts really send?

The text reminder exists and is switched on, but we have not confirmed that Cal.com actually delivers texts on your free plan. Text messages can need credits or a paid plan. Please check once:

1. Open your weekly session link in a private browser window and book a time at least 3 hours away, using a different email address than your Cal.com login and **your own mobile number**.
2. Accept the request in Cal.com.
3. Three hours before the time, see whether the text arrives on your phone.
4. If it does not, open **Workflows**, click the text reminder, and read any notice on it about credits or your plan. Tell Nick what it says. Do not pay for anything without talking to Nick first.
5. Cancel the test booking.

Until this is checked, treat the two emails as the reminders you can count on. Your own short personal messages (see `docs/CLIENT-PLAYBOOK.md`, section 3) still do the most important part of the job.

Good to know:

- The 15 minute quick call can be booked 2 hours ahead, so the 24 hour reminder will often not apply to it, and the 3 hour reminders may be skipped for a call booked at the last minute. That is fine.
- These reminders, the Cal.com confirmation and the Stripe receipt are the only automatic messages a client gets. There are no other automatic follow-up emails or texts.

---

## 9. About recording sessions

Sessions are on Zoom and are recorded, and the client gets the recording.

- **Zoom does the recording.** Once Zoom is the location on the three events (section 5), start the recording at the beginning of each session, or switch on automatic recording in Zoom's settings.
- **Send it to the client afterwards.** With cloud recording, Zoom gives you a link to share. With local recording, share the file by a private link (iCloud or Google Drive). Send it to that client only.
- **Until Zoom is installed**, bookings use Cal Video, and recording in Cal Video needs Cal.com's paid Team plan. As a stopgap you can record on your Mac: press Shift + Command + 5, choose to record the browser window, and make sure the audio is captured.

Tell the client at the start of each session that you are recording.

---

## 10. What the website needs from you

The welcome page (`/pilates-program/welcome`) shows both booking calendars inline, as two numbered steps: 1. book your online assessment, 2. book a weekly session. Sessions are booked one at a time, so a client can come back to this page every week to book the next one. It reads two values from the site content file `src/content/program.json`:

| Field | What to paste | Example |
| --- | --- | --- |
| `booking.assessmentUrl` | The full link to the online assessment | `https://cal.com/movewithdianag/strong-safe-assessment` |
| `booking.sessionUrl` | The full link to the weekly session | `https://cal.com/movewithdianag/strong-safe-session` |

All three links are already pasted in. You only need this section if a link ever changes.

### The three booking pages you can send

Each Cal.com link also has its own page on your site. Send one of these to an existing client and they book by themselves, so you do not have to do it by hand.

| Page to send | Field it reads | Cal.com link behind it |
| --- | --- | --- |
| `https://movewithdianag.com/book/intro-call` | `booking.callUrl` | `https://cal.com/movewithdianag/strong-safe-call` |
| `https://movewithdianag.com/book/assessment` | `booking.assessmentUrl` | `https://cal.com/movewithdianag/strong-safe-assessment` |
| `https://movewithdianag.com/book/session` | `booking.sessionUrl` | `https://cal.com/movewithdianag/strong-safe-session` |

- The three pages only work once the site changes are published. Until then, send the Cal.com link from the last column. Those work today.
- Each page shows the same calendar as its Cal.com link, with times in the visitor's time zone. All three are live on video.
- Every booking still waits for your approval by email. Once you approve it, it lands on your calendar by itself.
- If a Cal.com link ever changes, paste the new one in the admin panel as described below and the matching page follows it.
- When to send which link, with messages ready to paste, is in `docs/CLIENT-PLAYBOOK.md` under "Your three booking links".

There is a third field, `booking.callUrl`, now set to `https://cal.com/movewithdianag/strong-safe-call`. It is for the free 15 minute quick call, for people who applied and still have a question before they pay. Like every booking, it waits for your approval and you confirm it by email. It is not shown on the welcome page. On the order page it is the last question, "Not ready to decide yet?". When this link is filled in, the link in its answer reads "Book a 15 minute video call with me" and opens your quick call calendar. When it is empty, the link reads "Ask me a question first" and opens an email to you. The wordings can be changed in the admin panel under **Order page (price & payment link)**.

Under each calendar on the welcome page there is also an **"I can't find a time that works"** button. It opens an email to Diana (the site email in Site settings) with the subject and the first lines already written, asking for the days and times that suit the client. Diana replies and books the time herself in Cal.com. The button only shows once a booking link is pasted. Its words are in the admin panel under **Booking calendars**.

### Where to find each link

1. In Cal.com, go to **Event types** (or **Links**).
2. Next to the event, click the **copy link** icon. That is the value to paste.

### Where to paste them

- **In the admin panel**: go to `movewithdianag.com/admin`, open **8-Week Program (order page, welcome, booking)**, find **Booking calendars**, paste each link into **Assessment booking link (75 minutes)** and **Weekly session booking link (60 minutes)**, then **Publish**. The optional quick call link goes in **Quick call booking link** in the same place. The site updates a minute or two later.
- **Or send both links to Nick** and he will put them in `src/content/program.json`.

Paste the plain link only. Do not paste the embed code from Cal.com. The website builds the embed from the link.

### For the developer: the embed mechanism

This is built in `src/components/BookingEmbed.tsx` and used on the welcome page in `src/pages/ProgramWelcome.tsx`. The site uses Cal.com's official inline embed. From the stored URL, strip the origin to get the `calLink` (for example `movewithdianag/strong-safe-assessment`).

Embed script: `https://app.cal.com/embed/embed.js` (checked 14 November 2026, returns JavaScript, no frame-blocking headers on booking pages).

Standard inline snippet, as produced by Cal.com's own generator (Event types > three dots > **Embed** > Inline > HTML):

```html
<div style="width:100%;height:100%;overflow:scroll" id="my-cal-inline-assessment"></div>
<script type="text/javascript">
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");

  Cal("init", "assessment", { origin: "https://app.cal.com" });

  Cal.ns.assessment("inline", {
    elementOrSelector: "#my-cal-inline-assessment",
    calLink: "movewithdianag/strong-safe-assessment",
    config: { layout: "month_view", theme: "light" },
  });

  Cal.ns.assessment("ui", { hideEventTypeDetails: false, layout: "month_view" });
</script>
```

How the React component behaves:

- Props: `url`, `title`, `pendingNote`, an optional `minHeight` (default 640) and an optional `fallbackSubject`. The "open in a new tab" and loading labels come from `booking.openLinkLabel` and `booking.loadingLabel` in `program.json`.
- The component draws edge to edge, with a rule above and below the calendar only. The numbered step card in `ProgramWelcome.tsx` supplies the outer border and rounded corners, so the calendar keeps its width on a phone.
- If the URL field is empty (or is not an https link), it shows a calm placeholder panel with `booking.pendingNote` instead of an empty frame.
- When `fallbackSubject` is passed, an "I can't find a time that works" ghost button sits under a live calendar. It is a `mailto:` link to `site.email` with that subject and `booking.cantFindBody` as the body (line breaks kept). Labels: `booking.cantFindLabel`, `booking.cantFindAssessmentSubject`, `booking.cantFindSessionSubject`. It is not shown in the empty-link state, where the pending note already says Diana will be in touch.
- A link on `cal.com`, `www.cal.com` or `app.cal.com` uses the official embed script. The script is added to the page once and each calendar gets its own **namespace**, so the assessment and session calendars can sit on the same page. Any query parameters on the stored link are passed through to Cal.com.
- The script creates an iframe whose address follows this pattern: `https://app.cal.com/{username}/{event-slug}/embed?embed={namespace}&layout=month_view&theme=light`. The script listens for size messages from the frame and sets the iframe height itself, so nothing scrolls inside the frame. The component gives that iframe a `title` for screen readers.
- Nothing loads until the calendar is close to the screen. A skeleton holds the space until Cal.com sends its `linkReady` event, or 9 seconds pass, whichever is first.
- If the script cannot load, the component falls back to a plain iframe at `https://cal.com/{username}/{event-slug}?embed=true&layout=month_view&theme=light` with a fixed height of at least 700px.
- A plain "open the booking page in a new tab" link to the stored URL always sits under the calendar, for anyone whose browser blocks the frame.
- Any other https booking link is shown in a plain iframe. Zcal links get `?embed=1&embedType=iframe` and Calendly links get their inline embed parameters. These two were written from the providers' usual embed formats and have not been tested against a live account, so test them if you ever switch.
- The welcome page now passes the client's first name and email into the calendar, so they do not type them twice. The values come from the application they sent in the same browser tab (`readIntakeSession()` in `src/lib/intake.ts`) and are merged into the embed config in `calPrefill()` in `BookingEmbed.tsx`. Nothing else from the application is passed, and no health answer ever is. If there is no application on file, nothing is prefilled and the form is empty.
- There is an official React package, `@calcom/embed-react`, but the project rule is no new dependencies, so it is not used.
- Not used yet: `Cal.ns.<namespace>("on", { action: "bookingSuccessfulV2", callback })` fires after a booking and could later show "Step 1 done, now book your sessions".
- If Cal.com's **Redirect on booking** setting is used (event > Advanced or Confirmation tab), Cal.com appends `uid`, `title`, `startTime`, `endTime`, `email` and `isEmbed` to the redirect address. The site does not need this. Their docs do not say whether it is free.

---

## 11. Test checklist

Do this once before sending anyone to the page. Use a different email address than your Cal.com login when you book as a "client".

- [ ] Open `cal.com/movewithdianag` in a private browser window. The assessment and the weekly session are not listed.
- [ ] Open the assessment link directly. It shows 75 minutes, and only offers times Monday to Friday between 9:00 am and 4:00 pm Eastern. No Saturday or Sunday times.
- [ ] Open the weekly session link directly. It shows 60 minutes and offers no date more than 14 days ahead.
- [ ] Open the quick call link directly. It shows 15 minutes.
- [ ] On each booking form there is no "add guests" option, and there is one phone box, "Phone number (Text notifications)", which can be left empty.
- [ ] Put a fake appointment in your Apple Calendar tomorrow inside your open hours. Wait 5 minutes, refresh the booking page, and confirm that time (plus any buffer you set) is gone.
- [ ] If you connected Google, repeat that with a fake event in the Google calendar.
- [ ] Confirm the earliest times offered match section 7: 2 hours ahead for the call, 12 hours for the assessment, 24 hours for the weekly session.
- [ ] Book a test Assessment. You get a request email. Tap **Accept**. Within a few minutes the session appears in the **Online Clients** calendar in Apple Calendar on your Mac and iPhone.
- [ ] Book a test weekly session and a test quick call. Each one also waits for your **Accept**. Nothing confirms by itself.
- [ ] The confirmation email arrives for both you and the "client" after you accept, with a video link (Zoom once the Zoom app is installed, Cal Video before that). Click it and check camera and microphone work.
- [ ] Try to book the same slot again from another window. It is no longer offered.
- [ ] Use the reschedule link in the email, then the cancel link. The event moves, then disappears from Apple Calendar.
- [ ] On your phone, open the website welcome page. Both calendars load, fit the screen without sideways scrolling, and a booking can be completed.
- [ ] Fill in the application on the website first, then open the welcome page in the same tab. Your first name and email are already in the booking form.
- [ ] For a test booking more than 24 hours away, the reminder emails arrive 24 hours before and 3 hours before.
- [ ] Do the text reminder check once (see "Not confirmed yet" in the Reminders section).
- [ ] Tap **I can't find a time that works** under each calendar. Your mail app opens a new email to you with the subject and first lines already filled in.
- [ ] Delete the fake appointments.

---

## 12. If something goes wrong

| Problem | Likely cause and fix |
| --- | --- |
| Cal.com says the Apple password is wrong | You used your normal Apple password. Create an app-specific password (section 4, Part A). |
| A client booked over something on my calendar | That calendar was not switched on under **Settings > Calendars > Check for conflicts**, or it lives in Google or "On My Mac" (section 2). |
| Bookings are not showing in Apple Calendar | Check **Add events to** under **Settings > Calendars**, and that the Online Clients calendar is ticked in the Apple Calendar sidebar. |
| No times are showing at all | Your calendar may simply be full between 9:00 am and 4:00 pm for the days on offer (the assessment looks 10 days ahead, the weekly session 14). Otherwise the event is using the wrong schedule or the schedule is empty. Cal.com has a **Troubleshoot** button on the Availability page. |
| The calendar is blank on the website | The link in the admin panel has a typo, or the event was deleted. Open the link directly to check. |
| Times look off by hours | The time zone on your profile or schedule is not America/New_York. Clients always see times in their own time zone. |

---

## Fallback: Zcal

If Cal.com changes its free plan or the iCloud connection gives you trouble, Zcal's free plan currently offers unlimited booking links, unlimited calendar accounts including Apple Calendar, website embeds, and Zoom or Google Meet links. The setup follows the same shape: connect Apple with an app-specific password, set weekly hours, create a 75 minute, a 60 minute and a 15 minute link, keep the first two unlisted, and paste the links into the same website fields. The website embed code would need a small change by Nick, since Zcal uses its own embed.
