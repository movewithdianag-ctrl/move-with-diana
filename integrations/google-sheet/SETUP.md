# 8-Week Pilates Program intake: Google Sheet setup

## Chosen setup

Decided: Nick pastes and deploys the script himself, into the Google Sheet that already exists in Diana's account. Alerts are an **email to Diana only**. Her mail app should show each one as a notification on her phone, so no extra app should be needed. That is tested in step 9, not assumed. No ntfy, no Twilio and no GoHighLevel for now. The other channels further down are optional extras that are not in use.

Diana: make sure notifications are switched on for your mail app. You can also mark the alert sender as a VIP, or give it its own notification sound, so a new lead stands out from other mail (`docs/LEAD-ALERTS-SETUP.md`, Option 4).

The short path for Nick:

1. Open the existing Google Sheet in Diana's account. Do not write its address or ID anywhere in this project. (Part 1 below, creating a sheet, is already done.)
2. Check its sharing: **Share** > General access must be **Restricted** (only named people). The sheet will hold health answers, so it must never be "Anyone with the link".
3. **Extensions > Apps Script**, then paste in all of `Code.gs` (Part 2).
4. Add one Script Property (Part 3):
   - `ALERT_EMAILS`: Diana's email address, and nobody else's.
   - Do not set `NTFY_TOPIC`. If it was added earlier, delete that Script Property. The script skips the ntfy channel when it is not set.
5. Run the function **setup** and allow the permissions (Part 4).
6. Deploy as a web app, Execute as **Me**, Who has access **Anyone** (Part 6). Copy the web app URL that ends in `/exec`.
7. Give that URL to the site as `VITE_INTAKE_ENDPOINT` in the deploy host's environment variables and redeploy (Part 7). Never commit it.
8. Diana checks that notifications are on for her mail app.
9. Run **testSubmit** (Part 5) and check that the row and the email both arrive. Then check Diana's phone: it must show a notification for that email. This is a pass or fail check (see below). Delete the test row.

**Which account sends the alert.** Alert emails are sent from the Google account that is signed in when the script is authorized and deployed ("Execute as: Me"). The sheet lives in Diana's account, so if the script was authorized there, the alert reaches her from her own address. Mail apps often stay quiet for mail that comes from your own account, so do not take the phone notification as a given. Step 9 is the pass or fail check:

- **Pass:** her phone shows a notification for the test email. Nothing more to do.
- **Fail:** the email is in her inbox but the phone stayed quiet. First, in her mail app, add a notification rule or filter for mail whose subject starts with `New intake:` (every alert starts with those words), then run **testAlerts** and check again. If the phone is still quiet, authorize and deploy the script from a different Google account that is already a named editor of the sheet (run **setup**, then make a new deployment from that account). The alert then arrives from that other address and is treated like any other incoming mail. A new deployment has a new web app URL, so update `VITE_INTAKE_ENDPOINT` to match and redeploy the site. Then run step 9 again.

---

This connects the application form on the website (`/apply`) to a private Google Sheet and sends an alert the moment someone applies.

Time needed: about 15 minutes. No coding. You copy, paste and click.

What you end up with:

- A **Leads** tab. One row per applicant, with the tracking columns Diana already uses (Status, Paid?, Sessions used, Testimonial) followed by every intake answer, one column per fact.
- A **Log** tab. A plain list of anything that went wrong, so problems are never silent.
- An email to Diana for every finished application. Her mail app should show it as a notification on her phone (step 9 above checks that it does).

## Privacy first

The sheet holds health details that people shared in confidence.

- Keep the sheet **private**. Because it holds health answers, its sharing must be set to **Restricted** (only named people), not "Anyone with the link". Share it only with named people who need it (Share > add their email).
- **Never** use File > Share > Publish to web.
- Do not paste rows into group chats, tickets or other tools.
- The web app URL you create below can only **add** an application. It cannot read the sheet, and opening it in a browser shows a one-line status with no data.
- Tokens and phone numbers go in Script Properties (Part 3), never in the code and never in the website.

## The four files in this folder

| File | What it is |
| --- | --- |
| `Code.gs` | The script. You paste this into Google once. |
| `appsscript.json` | Optional settings file. Limits the script's permission to this one sheet. Recommended. |
| `test-payload.json` | A pretend application, used by the test command in Part 8. |
| `SETUP.md` | This guide. |

---

## Part 1. Create the sheet

**Already done.** The sheet exists in Diana's account, so skip to Part 2. If it already has rows or tabs, that is fine: the script adds its own **Leads** and **Log** tabs and never deletes data. The steps below are kept in case a sheet ever has to be made again.

1. Sign in to the Google account that should own the client list. Use Diana's business account if she has one. Whoever does this step is also the account the alert emails are sent from.
2. Go to [sheets.new](https://sheets.new). A blank spreadsheet opens.
3. Click the title at the top left and name it `8-Week Pilates Program leads`.

Leave it empty. The script builds the tabs and the header row for you.

## Part 2. Add the script

1. In the sheet, click **Extensions > Apps Script**. A new browser tab opens with a code editor.
2. Click the project name at the top (`Untitled project`) and rename it `MWD intake`.
3. In the editor you will see a file called `Code.gs` with a few lines in it. Select everything in it and delete it.
4. Open `integrations/google-sheet/Code.gs` from this folder, copy all of it, and paste it into the editor.
5. Click the save icon (or press Cmd+S on a Mac, Ctrl+S on Windows).

### Recommended: add the settings file

This step makes Google ask for a narrower permission ("only this spreadsheet" instead of "all your spreadsheets") and sets the time zone to US Eastern.

1. In the Apps Script editor, click the gear icon on the left (**Project Settings**).
2. Tick **Show "appsscript.json" manifest file in editor**.
3. Click the `< >` icon on the left (**Editor**). A file named `appsscript.json` now appears in the file list. Click it.
4. Replace everything in it with the contents of `integrations/google-sheet/appsscript.json`. Save.

If Diana is not in the Eastern time zone, change `America/New_York` in that file to her zone (for example `America/Chicago`).

## Part 3. Script Properties (addresses and tokens)

Everything private lives here, not in the code.

1. Click the gear icon on the left (**Project Settings**).
2. Scroll down to **Script Properties** and click **Add script property**.
3. Type the name in **Property** exactly as shown below (capitals and underscores matter), and the value in **Value**.
4. Click **Save script properties**.

This one is the whole chosen setup. It is enough to go live.

| Property | Value | Notes |
| --- | --- | --- |
| `ALERT_EMAILS` | `diana@example.com` | Who gets the alert email. Decided: Diana's address only. (The script accepts several addresses separated by commas, but lead alerts go to Diana alone.) |

Every channel below is an optional extra and is not in use. Any of them can be added later. No redeploy is needed when you change a property. It takes effect on the next application. To switch a channel off again, delete its properties.

### Free phone push with ntfy (optional extra, not in use)

**Not in use.** The owners dropped ntfy for now, because the alert email already notifies Diana on her phone. Leave `NTFY_TOPIC` unset. If it was added earlier, delete it. The steps are kept only in case it is wanted later.

A free app that makes the phone buzz. No account needed.

1. Install the **ntfy** app on Diana's phone (App Store or Google Play).
2. Invent a long topic name nobody could guess, for example `mwd-leads-` followed by 12 or more random letters and numbers. Letters, numbers, dashes and underscores only.
3. In the app, tap **+** (Subscribe to topic) and enter that exact name.
4. Add the property below.

| Property | Value | Notes |
| --- | --- | --- |
| `NTFY_TOPIC` | your long topic name | Treat it like a password. Anyone who knows it can read the pushes. |
| `NTFY_PRIORITY` | `4` | Optional. 1 (quiet) to 5 (urgent). Default 4. |
| `NTFY_SERVER` | `https://ntfy.sh` | Optional. Only for a self-hosted ntfy server. |
| `NTFY_TOKEN` | an ntfy access token | Optional. Only if the topic is protected on a paid or self-hosted server. |

Because the topic name is the only lock, the ntfy push is always the short version: first name, last initial and status. No phone number, no health details and no link to the sheet. The link to the row is in the alert email.

### Text message with Twilio (paid, not used for now)

Needs a Twilio account and a number that is approved to send texts in the US (Twilio walks you through that registration). See `docs/LEAD-ALERTS-SETUP.md` for the account steps.

| Property | Value | Notes |
| --- | --- | --- |
| `TWILIO_ACCOUNT_SID` | starts with `AC` | From the Twilio console home page. |
| `TWILIO_AUTH_TOKEN` | the auth token | From the same page. |
| `TWILIO_FROM` | `+15615550100` | The Twilio number, with `+1` and no spaces. |
| `ALERT_SMS_TO` | `+15615550199` | Diana's mobile, with `+1` and no spaces. Several numbers can be separated by commas. |
| `TWILIO_API_KEY` and `TWILIO_API_SECRET` | optional | Use these two instead of `TWILIO_AUTH_TOKEN` if you prefer an API key (starts with `SK`). Keep `TWILIO_ACCOUNT_SID` as well. |
| `TWILIO_MESSAGING_SERVICE_SID` | optional, starts with `MG` | Use instead of `TWILIO_FROM` if the number sits in a Messaging Service. |

### Telegram (free, not in use)

| Property | Value |
| --- | --- |
| `TELEGRAM_TOKEN` | The bot token from @BotFather. |
| `TELEGRAM_CHAT_ID` | The chat id of Diana's conversation with the bot. |

### Pushover (one-time app purchase, not in use)

| Property | Value | Notes |
| --- | --- | --- |
| `PUSHOVER_TOKEN` | The application token. | |
| `PUSHOVER_USER` | Diana's user key. | |
| `PUSHOVER_PRIORITY` | `1` | Optional. `2` repeats the alert every minute for up to an hour until it is acknowledged. |

### Webhook for GoHighLevel, Zapier or Make (not used for now)

| Property | Value | Notes |
| --- | --- | --- |
| `ALERT_WEBHOOK_URL` | the inbound webhook URL | Must start with `https://`. The URL itself is the secret. |
| `ALERT_WEBHOOK_INCLUDE_ANSWERS` | `true` | Optional. See below. |

The webhook receives simple JSON: `event`, `first_name`, `name`, `email`, `phone`, `status`, `needs_review`, `source`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `ref`, `lead_id`, `submitted_at`, `sheet_row_url` and `summary`.

Health answers are **left out** unless you add `ALERT_WEBHOOK_INCLUDE_ANSWERS` = `true`. With it on, the webhook also gets `pain_today`, `main_goal`, `areas`, `surgery_6mo`, `serious_condition`, `pregnant`, `postpartum`, `current_injury` (each `Y` or `N`), `other_flags`, `cleared` and `details`. Only do that if the tool on the other end is one you are happy to store health details in.

### Fine tuning (all optional)

| Property | Default | What it does |
| --- | --- | --- |
| `ALERT_TEXT_DETAIL` | `minimal` | `minimal` sends "New intake: Jane D., QUALIFIED. Open the sheet for details." to Twilio, Telegram and Pushover, with no pain score and no phone number. Set it to `full` only if you are happy for a text service and your lock screen to show "New intake: Jane Doe, QUALIFIED, pain 6/10, (561) 555-0123". |
| `EMAIL_INCLUDE_ANSWERS` | `true` | Set to `false` and the alert email carries only the name, contact details, status and a link to the row. One exception: the emergency backup email (sent when a row could not be saved) always carries every answer, because it is then the only copy of the application. |
| `DAILY_RESCUE_LIMIT` | `10` | Safety cap on those emergency backup emails per day. After the cap the script answers `write_failed` or `busy`, writes one line in the Log tab, and the site sends the application by its own backup email if one is set up. |
| `DAILY_ALERT_LIMIT` | `30` | Safety cap on alerts per day, so a flood of junk can never use up the email allowance or run up a text bill. Rows are still saved after the cap is reached. The cap counts alerts, not emails: one alert sends one email to each address in `ALERT_EMAILS`. |
| `DAILY_ROW_LIMIT` | `300` | Safety cap on new rows per day, so a flood of junk can never bury the real leads. After the cap the script saves nothing new until the next day, answers `rate_limited`, and writes one line in the Log tab. The site then sends the application by its backup email if one is set up. |
| `LEADS_SHEET` | `Leads` | Only if you want the tab to have a different name. |

The script also creates a few properties by itself: `ALERT_COUNTER`, `ROW_COUNTER` and `ROW_LIMIT_WARNED`. Those are the daily tallies. Leave them alone.

## Part 4. Run setup and give permission

1. Click the `< >` icon on the left to go back to the **Editor**, and click `Code.gs`.
2. At the top there is a dropdown with a function name in it. Choose **setup**.
3. Click **Run**.
4. Google asks for permission the first time:
   - Click **Review permissions** and choose the same Google account.
   - You will probably see **Google hasn't verified this app**. That is normal for a script you made yourself. Click **Advanced**, then **Go to MWD intake (unsafe)**.
   - Click **Allow**. The script asks to edit this spreadsheet, send email as you, and connect to an outside service (that last one is for the push and text alerts).
5. An **Execution log** opens at the bottom. It should end with a short report like "Email alert: ON, 1 address(es)" and a list of which channels are on.

Now look at the sheet. There is a **Leads** tab with a bold, frozen header row, Y/N dropdowns, and colours ready for the Status column, plus a **Log** tab.

It is safe to run `setup` again at any time. It never deletes data.

## Part 5. Send a test from the editor

1. In the function dropdown choose **testSubmit**. Click **Run**.
2. The Execution log should show `testSubmit result: {"ok":true}`.
3. Check three things:
   - A row for "Test Lead" appeared in the Leads tab.
   - The alert email arrived. The top line gives the result in plain words (for example "Good fit"), then one suggested next step, then buttons to call, text and email, and a link that opens the row.
   - Tap **Text** or **Email** on your phone. A new message opens with a friendly first line already typed. It never contains a health detail, and nothing is sent until you press send.
   - Diana's phone showed a notification for the alert email. If it stayed quiet, follow "Which account sends the alert" at the top of this guide.
4. Delete the test row (right-click the row number > Delete row).

To test the alerts again without adding a row, run **testAlerts**. The log lists each channel as `sent`, `off` or `FAILED` with the reason.

## Part 6. Deploy as a web app

1. At the top right click **Deploy > New deployment**.
2. Next to "Select type" click the gear icon and choose **Web app**.
3. Fill it in:
   - **Description**: `Intake v1`
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**
4. Click **Deploy**. If Google asks for permission again, allow it the same way as in Part 4.
5. Copy the **Web app URL**. It ends in `/exec`. Click **Done**.

"Anyone" sounds alarming. It only means the website can hand an application to the script without a Google login. Nobody gets access to the sheet.

Use the URL that ends in `/exec`. A URL that ends in `/dev` only works for you while signed in.

## Part 7. Give the URL to the website

The website reads the URL from a setting called `VITE_INTAKE_ENDPOINT`.

**On the live site (Netlify):**

1. Open the site in Netlify.
2. Go to **Site configuration > Environment variables**.
3. Click **Add a variable**. Key: `VITE_INTAKE_ENDPOINT`. Value: the `/exec` URL. Save.
4. Go to **Deploys** and click **Trigger deploy > Deploy site**.

The redeploy matters. The site only picks the URL up when it is rebuilt. If the site is hosted somewhere else, the steps are the same idea: add the environment variable in that host's settings, then redeploy.

**On Nick's computer (local testing):**

Open the `.env` file in the project folder and add this line, then restart the dev server:

```
VITE_INTAKE_ENDPOINT=https://script.google.com/macros/s/PASTE_YOURS_HERE/exec
```

The `.env` file is never committed. `.env.example` shows the name of the setting without a value.

## Part 8. Test the live connection

**Quick check in a browser.** Paste the `/exec` URL into the address bar. You should see exactly:

```
{"ok":true,"service":"mwd-intake"}
```

**Full check from the Terminal.** From the project folder, with your own URL in the quotes:

```
curl -L -H "Content-Type: text/plain;charset=utf-8" --data-binary @integrations/google-sheet/test-payload.json "https://script.google.com/macros/s/PASTE_YOURS_HERE/exec"
```

It should print `{"ok":true}`, a "Jane Doe" row should appear, and the alerts should fire. Keep the `-L`. Google answers through a redirect and `-L` follows it.

Run the same command a second time and you still have one Jane Doe row and no second alert. That is the duplicate protection working. Delete the row when you are done.

**Real check.** Open the live site, go to `/apply`, and fill the form in as a pretend person. Then delete that row.

## Part 9. Changing the code later

Pasting new code into the editor and saving is **not** enough. The live URL keeps running the old version until you publish a new one.

1. Paste the new `Code.gs` into the editor and save.
2. Click **Deploy > Manage deployments**.
3. Click the pencil icon (**Edit**) on the existing deployment.
4. Under **Version** choose **New version**.
5. Click **Deploy**.

The URL stays the same, so nothing changes on the website.

Do **not** use "New deployment" for an update. That creates a second, different URL and the website would still be pointing at the old one.

**When the form gains a question.** The script and the form are updated together. After you publish the new version, the next application adds any missing column headers on the far right of the Leads tab, in bold. Nothing already in the sheet moves or changes, and Diana's tracking columns keep their values. Drag the new columns wherever you like. Until the new version is published the form still works, but the new answers are not saved to the sheet.

### The answer columns

The form is one short page, and the sheet keeps one column per fact:

| Column | What it holds |
| --- | --- |
| Surgery last 6 months (Y/N) | `Y` if they ticked "surgery in the last 6 months" on the health check, otherwise `N`. |
| Serious condition (Y/N) | `Y` if they ticked the serious condition box. |
| Pregnant (Y/N) | `Y` if they ticked "pregnant". |
| Recently postpartum (Y/N) | `Y` if they ticked "recently postpartum". |
| Current injury (Y/N) | `Y` if they ticked "a current injury". |
| Other health boxes | Almost always empty. If a box is added to the health check in the admin panel, or one is renamed, it has no column of its own yet, so its name is listed here when it is ticked. |
| Cleared | Their answer to "has a doctor or physical therapist cleared you for exercise": `yes`, `no` or `not_sure`. It says `not asked` when nothing was ticked on the health check, because the form skips that question for them. Two more values mean something needs fixing, and both come with NOT CLEARED and Needs review `Y`: `config error` (the form's screening rule was broken, so it turned the person away to be safe) and `unknown` (a box was ticked but the answer that arrived was missing or not one of the above). Tell Nick if either shows up, and contact the person yourself. |
| Details | Anything they chose to add about what they ticked. Optional, so often empty. |
| Areas | Where the body needs the most care, for example `back, hips, other: wrists`. |
| Pain 0-10 at start | The number they picked for a typical day. |
| Main goal | Their own words. |
| Anything else | Their answer to the optional last question, "Is there anything else you'd like me to know?" Often empty. |
| Consent (Y/N) | Empty for new rows: the form no longer has a tick box at the end. Older rows show `Y` when the box was ticked. |

### Moving from the longer form (one time)

The first version of the form asked more questions and used different column names. If the sheet was created with that version:

1. Publish the new `Code.gs` (the five steps above), then run **setup** once from the editor. The new columns appear on the far right with their dropdowns.
2. These older columns are no longer filled in. Delete them, or keep them for the old rows: `First name`, `Last name`, `Surgery in last 6 months`, `Serious diagnosis`, `Pregnant or postpartum`, `Current injuries`, `Medications`, `Cleared for exercise`, `Pilates experience`, `Heard about me from`, `Agreed: exercise, not medical care`.
3. Older rows keep `Yes` or `Y` in the Consent column. New rows leave it empty, because the form no longer has a tick box at the end.
4. If any row has the status `PARTIAL`, it came from an old setting that saved contact details before the form was finished. That setting is gone. Those rows can be deleted.

A sheet created fresh with this version needs none of this.

Changing a Script Property never needs a redeploy.

---

## Using the sheet day to day

- **Status** is filled in for you: `QUALIFIED` or `NOT CLEARED`. A person who ticked something on the health check and has not been cleared for exercise yet is `NOT CLEARED`.
- **Needs review** is `Y` when someone is cleared for exercise but ticked surgery, a serious condition, pregnant or recently postpartum. Read the Details column before booking.
- **Start date**, **Paid?**, **Sessions used** and **Testimonial** are Diana's columns. The script fills in a starting value (`N`, `0`) on a new row and never touches them again.
- You can **reorder columns** by dragging them. The script finds each column by its header text, not its position.
- You can **add your own columns** anywhere (notes, follow up date). The script leaves them alone.
- You can **sort and filter** freely.
- You can lightly rename a header. Capitals, punctuation and anything in brackets are ignored, so `Paid?` and `Paid? (Y/N)` are the same column. If you change the actual words (say `Paid?` to `Payment`), the script no longer recognises it and adds a fresh `Paid? (Y/N)` column on the far right.
- Leave the **Lead ID** column in place. It is how the script recognises the same person sending the form twice and updates their row instead of adding a second one. If a different person applies from the same phone or computer, or the same person applies again with a different result, the script adds a new row so nothing is overwritten. You can hide the column (right-click the column letter > Hide column).
- Do not put a formula that fills a whole column (an ARRAYFORMULA) in one of the script's own columns. Use a column of your own for that.

## Limits to know about

| Limit | Free Gmail account | Google Workspace account |
| --- | --- | --- |
| Alert emails | About 100 recipients a day | About 1,500 a day |
| Push, text and webhook calls | About 20,000 a day | About 100,000 a day |

- An alert sent to two addresses counts as two.
- The count resets roughly every 24 hours. Run `setup` to see "Emails left today".
- If the email allowance runs out, the row is still saved and the other channels still fire. The Log tab records it.
- The script always keeps the last 10 emails of the day for its emergency backup (the email it sends when a row could not be saved). A normal alert email is skipped once only those are left. The backup email always includes the full answers (see `EMAIL_INCLUDE_ANSWERS` above) and is capped at 10 a day (`DAILY_RESCUE_LIMIT`).
- The site waits 25 seconds for the script. So the script waits at most 10 seconds for a busy sheet, and once a request has been running for 15 seconds it sends the email alert only and skips the push, text and webhook alerts for that one application. The Log tab records it.
- If the optional ntfy push is ever switched on (it is not in use), the free public ntfy server allows about 250 pushes a day.
- The script's own safety cap (`DAILY_ALERT_LIMIT`, default 30 alerts) normally kicks in before the email limit. Each alert uses one email per address, so on a free Gmail account keep `DAILY_ALERT_LIMIT` times the number of addresses under about 90. With three or more addresses, lower the cap or use a Workspace account.

## Troubleshooting

**First stop: the Log tab.** Every failed alert is written there with the channel name and the reason. The log never contains names, contact details, health answers or tokens. The second stop is the Apps Script editor > **Executions** (clock icon on the left), which lists every run.

| What you see | Likely cause and fix |
| --- | --- |
| The browser check shows a Google sign-in page or "Sorry, unable to open the file" | "Who has access" is not set to **Anyone**, or the URL ends in `/dev`. Fix it in Deploy > Manage deployments > Edit. Being signed in to several Google accounts at once can also cause this. Try a private window. |
| The site form shows an error, or the application arrives by email only and not in the sheet | `VITE_INTAKE_ENDPOINT` is missing or wrong in the host's settings, or the site was not redeployed after adding it. Redo Part 7. |
| Rows arrive but there is no email | `ALERT_EMAILS` is missing or misspelled. Run `setup` and read the report. Check the spam folder. Check the Log tab for "quota". |
| The email arrives but the phone does not buzz | Check that notifications are on for the mail app, and that a Focus or Do Not Disturb mode is not hiding them. Mark the alert sender as a VIP or give it its own sound (`docs/LEAD-ALERTS-SETUP.md`, Option 4). Email apps often stay quiet for mail that comes from your own account. If that is the cause, follow "Which account sends the alert" at the top of this guide. The optional ntfy push in Part 3 is a last resort. It is not in use today. |
| You changed the code and nothing changed | The new version was not published. Do Part 9. |
| "Authorization is required" or a permission error after an update | Run `setup` once from the editor and allow the permissions again, then do Part 9. |
| `twilio: FAILED (Twilio is only partly set up...)` | One of the Twilio properties is missing. The message names it. |
| A text never arrives although Twilio shows no error | The Twilio number is not yet approved for US texting. Check the message status in the Twilio console. |
| A new column appeared on the far right | Either the form gained a question (see Part 9, this is expected), or a header was renamed to words the script does not recognise. For a renamed header: rename it back, move any values across, and delete the extra column. |
| A cell shows a leading apostrophe, like `'+1 561...` | That is the script making sure the text is never run as a formula. It is harmless. Normally Sheets hides the apostrophe. |
| The same person appears twice | They sent the form from two different browsers or devices, so they have two different Lead IDs. Delete the extra row. |
| Nothing arrives and the Log tab is empty | The request never reached the script. Run the curl test in Part 8 to see the raw answer. |

**Error codes** the script can send back (visible with the curl test):

| Code | Meaning |
| --- | --- |
| `empty_body` | Nothing was sent. |
| `invalid_json` / `invalid_payload` | What was sent is not a proper application. |
| `too_large` | The submission is far bigger than a real one. |
| `missing_name` | No name. |
| `missing_contact` | Neither a valid email nor a valid phone number. |
| `busy` | Too many submissions at the same instant. The site falls back to email. |
| `write_failed` | The sheet could not be written. If `ALERT_EMAILS` is set, the script emails the application to Diana instead and answers `ok` (at most 10 times a day, see `DAILY_RESCUE_LIMIT`). |
| `rate_limited` | The daily row cap (`DAILY_ROW_LIMIT`) was reached. Nothing was saved. Check the sheet for junk, and raise the cap if the traffic is real. |
| `server_error` | Something unexpected. Look at the Log tab. |

A filled-in bot trap (a hidden field on the form, sent as `website`) is answered with `{"ok":true}` on purpose, and nothing is saved.

## Notes for Nick

- **Payload.** The script accepts exactly what `src/lib/intake.ts` sends: a JSON string in a `text/plain` POST body, answered with `{"ok":true}` or `{"ok":false,"error":"..."}`. It never throws to the client.
- **One submission per application.** The form sends once, when the person presses the button at the end. There is no partial capture and no `stage` field.
- **Duplicates.** A repeat with the same `leadId`, the same contact (email, or phone when there is no email) and the same status updates the row without a new alert. Anything else with a known `leadId` (a different person, or a different status) is added as a new row and alerts.
- **Server time.** The Timestamp column uses the time the script received the application, in the project's time zone.
- **Property name aliases.** `ALERT_EMAIL`, `ALERT_PHONE` and `GHL_WEBHOOK_URL` (the names used in `docs/LEAD-ALERTS-SETUP.md`) work as well as `ALERT_EMAILS`, `ALERT_SMS_TO` and `ALERT_WEBHOOK_URL`.
- **Field ids.** The form sends these answer keys, built in `buildPayload` in `src/lib/intake.ts` from the blocks in `src/content/intake.json`: `surgery6mo`, `seriousDiagnosis`, `pregnant`, `postpartum`, `currentInjury` (each `Y` or `N`, one per option of the `healthFlags` block), `otherFlags` (the values of any ticked option that is not one of those five), `cleared` (`yes`, `no`, `not_sure`, `not asked`, or `config error` when the eligibility rules in `intake.json` do not match the blocks), `conditionDetails`, `areas`, `painToday`, `goal`, `anythingElse`, `consent`, plus `name`, `firstName`, `email` and `phone`. A new question needs a line in `COLUMNS`, `normalise_` and `rowValues_` in `Code.gs` (and in `buildEmail_` and `webhookBody_` if it should be in the alerts), then Part 9.
- **Health answers.** Everything in that list except the contact fields is treated as a health answer: in the alert email only while `EMAIL_INCLUDE_ANSWERS` is not off, and in the webhook only when `ALERT_WEBHOOK_INCLUDE_ANSWERS` is `true`. The email shows the health check boxes as one line that lists what was ticked.
- **Cleared is checked on the server.** `normalise_` accepts only the values in `CLEARED_VALUES`. With a box ticked and anything else in `cleared` (missing, unrecognised, or `not asked`), the row is saved as `unknown`, NOT CLEARED, Needs review `Y`. So if the option values of the `cleared` block are ever changed in `intake.json`, update `CLEARED_VALUES` to match and publish (Part 9). After publishing this version, run **setup** once so the Cleared dropdown learns the new values.
- **Local testing never reaches the sheet.** On the dev server (`npm run dev`) the form prints the payload to the browser console and shows the next page (the order page or the "not yet" page) without sending anything. The contact form and the newsletter signup follow the same rule there: the email is printed to the console, not sent. To send for real from the dev server, add `VITE_INTAKE_SEND_IN_DEV=1` to `.env` and restart it. The built site is not affected.
- **Tests.** The cleaning, row and alert text logic was run in Node against stubbed Google services. A live run of Parts 4, 5 and 8 is still the real proof.
