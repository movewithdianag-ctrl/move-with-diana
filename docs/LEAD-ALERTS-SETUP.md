# Lead alerts: an email for every intake form

## Chosen setup

Decided: an **alert email to Diana only**. That is the whole setup. Her mail app should show each one as a notification on her phone, so no extra app should be needed. That is tested in step 9, not assumed. No ntfy, no Twilio and no GoHighLevel for now. Everything else in this guide is an optional extra that is not in use.

Diana: make sure notifications are switched on for your mail app. You can also mark the alert sender as a VIP, or give it its own notification sound, so a new lead stands out from other mail (Option 4 below has the steps).

The short path for Nick (full click-by-click in `integrations/google-sheet/SETUP.md`):

1. Open the Google Sheet that already exists in Diana's account. Do not write its address or ID anywhere in this project.
2. Check its sharing: **Share** > General access must be **Restricted** (only named people). The sheet will hold health answers, so it must never be "Anyone with the link".
3. Click **Extensions > Apps Script** and paste in all of `integrations/google-sheet/Code.gs`.
4. In **Project Settings > Script Properties** add one property:
   - `ALERT_EMAILS`: Diana's email address, and nobody else's.
   - Do not set `NTFY_TOPIC`. If it was added earlier, delete that Script Property. The script skips the ntfy channel when it is not set.
5. In the editor, run the function **setup** and allow the permissions.
6. **Deploy > New deployment > Web app**, Execute as **Me**, Who has access **Anyone**. Copy the web app URL that ends in `/exec`.
7. Give that URL to the site as `VITE_INTAKE_ENDPOINT` in the deploy host's environment variables, then redeploy. Never commit it.
8. Diana checks that notifications are on for her mail app (Option 4 below).
9. Run **testSubmit** and check that the row and the email both arrive. Then check Diana's phone: it must show a notification for that email. This is a pass or fail check. Delete the test row.

The alert is sent from the Google account that authorizes and deploys the script. If that is Diana's own account, the email reaches her from her own address, and mail apps often stay quiet for that. If step 9 fails for that reason, the fix is in `integrations/google-sheet/SETUP.md` under "Which account sends the alert": a notification rule on the subject `New intake:`, or authorizing the script from a different Google account.

Still to do: all of the above. None of it is set up yet.

---

Goal: every time someone submits the intake form at `/apply`, Diana gets an alert email on her phone, usually within a minute.

The intake form posts to a Google Apps Script web app. That script already saves the lead. This guide covers what the script can call to alert Diana, with the exact request for each option.

Facts checked in November 2026. Prices change, so confirm on the provider's page before paying for anything.

**Where the real script lives.** The script that runs is `integrations/google-sheet/Code.gs`, and its step-by-step setup is `integrations/google-sheet/SETUP.md`. Email, ntfy, Twilio, Telegram, Pushover and the webhook are already built into it. To switch a channel on you only add its Script Properties (SETUP.md, Part 3). No code needs pasting. The code samples in this guide show the request each provider expects and are for reference. The script accepts the property names used here and also its own preferred names: `ALERT_EMAILS` (same as `ALERT_EMAIL`), `ALERT_SMS_TO` (same as `ALERT_PHONE`) and `ALERT_WEBHOOK_URL` (same as `GHL_WEBHOOK_URL`).

---

## What was chosen, and the alternatives

| | Channel | Why |
| --- | --- | --- |
| **Chosen** | **Alert email** to Diana only (Option 4) | Costs nothing and carries the details she acts on. Her mail app should notify her on her phone, which the test in step 9 above confirms. |
| Not in use | **ntfy** push notification (Option 1) | A free extra buzz on the phone. Dropped for now because the email notification is enough. Documented below in case it is wanted later. |
| Not for now | **Twilio SMS** with a registered number (Option 5) | A real text message to her real number. About $20 to set up, then roughly $3 to $4 a month. Takes days to weeks to get approved. Documented below in case it is wanted later. |
| Not for now | **GoHighLevel** inbound webhook (Option 6) | If the consultant's GoHighLevel account already has an approved texting number, this gives a real SMS with no new registration. Depends on the consultant. Documented below in case it is wanted later. |

Telegram (Option 2) and Pushover (Option 3) are also built in, also optional and also not in use.

## Privacy rule for every option

The intake form collects health details (the health check boxes, whether a doctor or physical therapist has cleared them for exercise, pain, and anything they add in their own words). **Never put those in an alert.** Send only what Diana needs to know that a lead arrived:

```
New intake: Jane D., QUALIFIED. Open the sheet for details.
```

First name, last initial (taken from the one name field on the form), and the result. The result is always one of the sheet's own status words: `QUALIFIED` or `NOT CLEARED`. If you build a filter in GoHighLevel, Zapier or Make, match on `QUALIFIED`, written exactly like that. Everything else stays in the Google Sheet.

In `integrations/google-sheet/Code.gs` every push and text uses this short form by default. Twilio, Telegram and Pushover can send a fuller line instead (full name, result, pain score and phone number), but only if Diana chooses that by adding the Script Property `ALERT_TEXT_DETAIL` with the value `full`. The ntfy push always stays short.

## What the alert email tells Diana

The alert email is the only alert in use, and it is where Diana acts. (A push or text, if one is ever switched on, only says that someone applied.) The email is laid out so she can reply within minutes without having to work anything out. From top to bottom:

1. **The result in plain words.** One of "Good fit", "Good fit, but read their notes first" or "Not cleared yet". It is the first line, so it shows in the inbox preview.
2. **One suggested next step.** For example "Next step: text them within 5 minutes. Say hello and offer to answer any question before they reserve." For a "Not cleared yet" result it always says to email a kind note, even when a mobile number was given, and reminds her: no payment or booking until their doctor or PT gives the OK.
3. **One-tap buttons.** Call, Text and Email, plus a link that opens the person's row in the sheet. Call and Text only appear when the person left a mobile number.
4. **The details table.** Contact details, their answers and where they came from.

Two things to know:

- **Text and Email open with the first line already typed.** It reads "Hi [first name], this is Diana from Move with Diana. Thank you for applying to the 8-Week Pilates Program." Diana adds the rest and sends it herself. Nothing is sent automatically. That first line is the same for every result and never contains a health detail. The email also has the subject "Your 8-Week Pilates Program application".
- **The form does not ask how the person likes to be contacted.** Email is required and a mobile number is optional ("So I can text you about scheduling"). So for a good fit the next step suggests a text when a mobile number was given and an email when it was not. "Not cleared yet" is always an email. If Diana would like the form to ask "How would you like me to reach you?", that is a small change to the form for Nick.

The message templates that go with each result are in `docs/CLIENT-PLAYBOOK.md`, section 1 (the 5 minute rule).

The health answers appear only in the email's details table, never in the subject, the prefilled message, a push or a text. To keep them out of the email as well, set the Script Property `EMAIL_INCLUDE_ANSWERS` to `false` (SETUP.md, Part 3).

## Where secrets go

Never paste tokens or passwords into the script code. In the Apps Script editor go to **Project Settings** > **Script Properties** and add them there. The examples below read them with `PropertiesService.getScriptProperties().getProperty('NAME')`.

Always wrap the alert in `try/catch` and pass `muteHttpExceptions: true`, so a failed alert can never stop the lead from being saved.

---

## Option 1. ntfy (free, optional extra, not in use)

**Not in use.** The owners dropped ntfy for now, because the alert email already notifies Diana on her phone. `NTFY_TOPIC` is not set, so the script skips this channel. This section is kept only in case it is wanted later.

ntfy is a free push notification service. Diana installs the ntfy app on her iPhone and subscribes to a private "topic". Anything posted to that topic appears on her phone.

- **Cost**: free. The public server allows 250 messages a day, far more than needed.
- **Feels like a text**: yes. Banner, lock screen, sound. Priority 4 or 5 makes it more insistent.
- **Catch**: the topic name works like a password. Anyone who knows it can read the alerts, so make it long and random and keep health details out (see the privacy rule).

### Setup

1. On the iPhone, install **ntfy** from the App Store and allow notifications.
2. Make up a topic name that nobody could guess: `mwd-leads-` followed by 16 or more random letters and numbers of your own. Letters, numbers, dashes and underscores only, up to 64 characters. Do not write the real name in this project.
3. In the app tap **+**, type the topic name, and subscribe.
4. In iPhone **Settings** > **Notifications** > **ntfy**, turn on Lock Screen, Banners and Sounds. If she uses a Focus mode, add ntfy to the allowed apps.
5. Save the topic name as the script property `NTFY_TOPIC`.

### The request

```
POST https://ntfy.sh/<topic>
Headers:
  Title: New 8-Week Pilates Program application
  Priority: 4
  Tags: bell
Body (plain text):
  New intake: Jane D., QUALIFIED. Open the sheet for details.
```

- `Priority` runs from 1 (silent) to 5 (urgent). 3 is the default, 4 is high.
- The script sends no `Click` link with the push. A link to the sheet would travel through the public ntfy server, so the row link is in the alert email only.
- Message limit is 4,096 bytes.
- A successful call returns HTTP 200 with a small JSON body.

JSON form, if preferred (note it posts to the server root, not the topic URL):

```
POST https://ntfy.sh/
Headers:
  Content-Type: application/json
Body:
  {"topic":"<topic>","title":"New 8-Week Pilates Program application","message":"New intake: Jane D., QUALIFIED. Open the sheet for details.","priority":4,"tags":["bell"]}
```

### Apps Script

```js
function alertNtfy(text) {
  var topic = PropertiesService.getScriptProperties().getProperty('NTFY_TOPIC');
  UrlFetchApp.fetch('https://ntfy.sh/' + topic, {
    method: 'post',
    payload: text,
    headers: {
      Title: 'New 8-Week Pilates Program application',
      Priority: '4',
      Tags: 'bell'
    },
    muteHttpExceptions: true
  });
}
```

---

## Option 2. Telegram bot (free)

A good choice if Diana already uses Telegram. Delivery is fast and dependable.

- **Cost**: free.
- **Feels like a text**: yes, as a Telegram message from a bot.
- **Catch**: needs the Telegram app and a five-minute bot setup.

### Setup

1. In Telegram, open a chat with **@BotFather**, send `/newbot`, and follow the prompts. BotFather replies with a bot token that looks like `123456789:AA...`.
2. Open a chat with the new bot and send it any message (bots cannot message someone who has not written to them first).
3. In a browser, open `https://api.telegram.org/bot<token>/getUpdates` and find `"chat":{"id":123456789`. That number is the chat ID.
4. Save the script properties `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID`.

### The request

```
POST https://api.telegram.org/bot<token>/sendMessage
Headers:
  Content-Type: application/json
Body:
  {"chat_id":"<chat id>","text":"New intake: Jane D., QUALIFIED. Open the sheet for details."}
```

Success returns HTTP 200 with `{"ok":true,...}`.

### Apps Script

```js
function alertTelegram(text) {
  var props = PropertiesService.getScriptProperties();
  UrlFetchApp.fetch('https://api.telegram.org/bot' + props.getProperty('TELEGRAM_TOKEN') + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: props.getProperty('TELEGRAM_CHAT_ID'), text: text }),
    muteHttpExceptions: true
  });
}
```

---

## Option 3. Pushover (small one-time cost)

A paid push app built for exactly this. More polished than ntfy and private by design.

- **Cost**: a small one-time purchase of the iPhone app after a free trial (check `https://pushover.net/pricing`). Sending is free up to 10,000 messages a month.
- **Feels like a text**: yes. Priority 1 breaks through the app's quiet hours. Priority 2 keeps repeating until she acknowledges it.

### Setup

1. Create an account at `https://pushover.net` and install the Pushover app on the iPhone.
2. Copy the **User Key** from the Pushover dashboard.
3. Click **Create an Application/API Token**, name it "Move with Diana leads", and copy the **API Token**.
4. Save the script properties `PUSHOVER_TOKEN` and `PUSHOVER_USER`.

### The request

```
POST https://api.pushover.net/1/messages.json
Headers:
  Content-Type: application/x-www-form-urlencoded
Body (form fields):
  token=<api token>
  user=<user key>
  title=New 8-Week Pilates Program application
  message=New intake: Jane D., QUALIFIED. Open the sheet for details.
  priority=1
  url=https://docs.google.com/spreadsheets/d/<sheet id>
  url_title=Open the sheet
```

- `token`, `user` and `message` are required. The rest are optional.
- JSON is also accepted with `Content-Type: application/json` and the same field names.
- Message limit 1,024 characters, title 250.
- Priority 2 also needs `retry` (at least 30 seconds) and `expire` (at most 10800 seconds).
- Success returns HTTP 200 with `{"status":1,"request":"..."}`.

### Apps Script

```js
function alertPushover(text) {
  var props = PropertiesService.getScriptProperties();
  UrlFetchApp.fetch('https://api.pushover.net/1/messages.json', {
    method: 'post',
    payload: {
      token: props.getProperty('PUSHOVER_TOKEN'),
      user: props.getProperty('PUSHOVER_USER'),
      title: 'New 8-Week Pilates Program application',
      message: text,
      priority: '1'
    },
    muteHttpExceptions: true
  });
}
```

---

## Option 4. Email with an iPhone VIP alert (free, chosen)

No outside service at all. The script emails Diana, and her iPhone is set to treat that email like a text.

- **Cost**: free. A personal Google account can send to about 100 recipients a day from Apps Script.
- **Feels like a text**: close, if the VIP alert is set up. It can take a few seconds to a minute to arrive. The VIP steps below are for the Apple Mail app. In another mail app, switch on its notifications and give the alert sender its own sound if the app allows it.

### Setup

1. The script sends from the Google account that owns it. Use a subject that always starts the same way, for example `New lead:`.
2. On the iPhone, add the sending address to Contacts as "Website Leads". This only helps when the sender is not Diana's own address. If the script sends from her own account, skip the VIP steps and use the fix in `integrations/google-sheet/SETUP.md` under "Which account sends the alert".
3. Open the **Mail** app > **Mailboxes** > tap the (i) next to **VIP** > **Add VIP** and choose "Website Leads".
4. Go to **Settings** > **Notifications** > **Mail** > **Customize Notifications** > **VIP**. Turn on Alerts and pick a distinct sound.
5. If she uses a Focus mode, allow the Mail app or the "Website Leads" contact.

### The call

This is a built-in Apps Script call, not an HTTP request.

```js
function alertEmail(text) {
  MailApp.sendEmail({
    to: PropertiesService.getScriptProperties().getProperty('ALERT_EMAIL'),
    subject: 'New lead: 8-Week Pilates Program application',
    body: text
  });
}
```

---

## Option 5. Twilio SMS (reliable, paid, not used for now)

A real SMS to Diana's own phone number. Nothing to install on the phone.

### What it costs (US, November 2026)

| Item | Cost |
| --- | --- |
| Outbound SMS, per segment | $0.0083 |
| Carrier fee, per message | $0.0035 to $0.005 depending on her carrier |
| Local phone number | $1.15 a month |
| Toll-free phone number | $2.15 a month |

So each alert is about 1.2 to 1.3 cents. Keep alerts under 160 characters and free of emoji so each one is a single segment.

### Registration is required

US carriers block texts from unregistered business numbers. There are two ways to register.

**Route A: local number with A2P 10DLC, Sole Proprietor brand.** For a business with no EIN.

| Fee | Cost |
| --- | --- |
| Sole Proprietor brand registration | $4.50 one time (older Twilio pages say $4) |
| Campaign vetting | $15 one time |
| Campaign fee | $2 a month |

- Requirements: no EIN, a US or Canadian address, and a mobile number that can receive a one-time verification code.
- Limits: one campaign and one phone number per brand, with low daily volume. Plenty for lead alerts.
- If Diana has an EIN (for example through an LLC), she is not eligible for Sole Proprietor and should use the **Low Volume Standard** brand instead. Fees differ slightly; check Twilio's console.
- Approval usually takes several days and can take a few weeks.
- Running cost: about $3.15 a month plus about 1.3 cents per text. First-year total around $60.

**Route B: toll-free number with toll-free verification.**

- Toll-free numbers must be verified before they can send at all.
- Since February 17, 2026 Twilio requires a business registration number (such as an EIN) on toll-free verifications for every business type except sole proprietors. A sole proprietor with no EIN can still apply, but the application may go to manual review and take longer.
- Twilio's pricing page does not list a separate fee for the verification itself. Confirm in the console.
- Running cost: about $2.15 a month plus about 1.3 cents per text.

For Diana, Route A is the straightforward choice if she has no EIN. Route B is a fair alternative if she has one.

In both cases, describe the use honestly as internal notifications sent only to the business owner's own phone. Twilio will still ask for a sample message and how consent is collected; the answer is that the only recipient is the account owner.

### Setup

1. Create an account at `https://www.twilio.com` and upgrade it from trial (trial accounts add a prefix to every message and only text verified numbers).
2. Buy a local number (Route A) or toll-free number (Route B) with SMS capability.
3. Complete the registration under **Messaging** > **Regulatory Compliance** in the Twilio console and wait for approval.
4. Create an API key under **Account** > **API keys & tokens**. Note the key SID (starts with `SK`) and the secret.
5. Save the script properties `TWILIO_ACCOUNT_SID` (starts with `AC`), `TWILIO_API_KEY`, `TWILIO_API_SECRET`, `TWILIO_FROM` (the Twilio number, like `+15615550100`) and `ALERT_PHONE` (Diana's mobile in the same format).

### The request

```
POST https://api.twilio.com/2010-04-01/Accounts/<AccountSid>/Messages.json
Headers:
  Authorization: Basic base64(<ApiKeySid>:<ApiKeySecret>)
  Content-Type: application/x-www-form-urlencoded
Body (form fields):
  To=+15615550123
  From=+15615550100
  Body=New intake: Jane D., QUALIFIED. Open the sheet for details.
```

- Phone numbers use E.164 format: `+1` followed by the 10 digits.
- The Account SID and Auth Token also work as the Basic auth username and password, but an API key is safer because it can be revoked on its own.
- `MessagingServiceSid=MG...` can be sent in place of `From` if a Messaging Service is set up.
- Success returns HTTP 201 with a JSON body containing `"status":"queued"`.

### Apps Script

```js
function alertTwilio(text) {
  var p = PropertiesService.getScriptProperties();
  var auth = Utilities.base64Encode(p.getProperty('TWILIO_API_KEY') + ':' + p.getProperty('TWILIO_API_SECRET'));
  UrlFetchApp.fetch('https://api.twilio.com/2010-04-01/Accounts/' + p.getProperty('TWILIO_ACCOUNT_SID') + '/Messages.json', {
    method: 'post',
    headers: { Authorization: 'Basic ' + auth },
    payload: {
      To: p.getProperty('ALERT_PHONE'),
      From: p.getProperty('TWILIO_FROM'),
      Body: text
    },
    muteHttpExceptions: true
  });
}
```

---

## Option 6. GoHighLevel inbound webhook (through the consultant, not used for now)

The consultant already has GoHighLevel. A workflow there can receive the lead and text Diana from the account's existing number. It can also add the lead as a contact, which may be useful for follow-up.

- **Cost**: no new subscription. GoHighLevel bills its usual per-text rate, and the Inbound Webhook is one of its premium workflow triggers, which can carry a small per-run charge depending on the plan. Ask the consultant.
- **Catch**: texts still need an A2P-approved number inside that GoHighLevel sub-account. If the consultant already sends texts from it, that is done. It also means the alert depends on someone else's account.

### Setup (done by the consultant)

1. In the sub-account, go to **Automation** > **Workflows** > **Create Workflow** > **Start from Scratch**.
2. **Add New Trigger** > **Inbound Webhook**. GoHighLevel shows a unique webhook URL. Copy it. It usually looks like `https://services.leadconnectorhq.com/hooks/<location id>/webhook-trigger/<trigger id>`.
3. Send one test submission from the site, then click **Test Trigger** (or fetch the sample request) in the trigger panel and select the request that arrived. This teaches the workflow the field names.
4. Optional: add a **Create/Update Contact** action and map `email`, `phone`, `first_name` and `name` (the form has one name field, so `name` is the full name as typed).
5. Add an **Internal Notification** action, type **SMS**, sent to a custom number (Diana's mobile) or to her user. Message: `New 8-Week Pilates Program application: {{inboundWebhookRequest.first_name}} ({{inboundWebhookRequest.status}})`.
6. Save and **Publish** the workflow.
7. Send the webhook URL to the developer, who saves it as the script property `GHL_WEBHOOK_URL`. Treat the URL as a secret. Anyone who has it can trigger the workflow.

### The request

```
POST <the unique webhook URL from step 2>
Headers:
  Content-Type: application/json
Body:
  {"event":"intake_submitted","first_name":"Jane","name":"Jane Doe","email":"jane@example.com","phone":"+15615550123","status":"QUALIFIED","needs_review":"N","source":"instagram","lead_id":"lead_2026-11-14_ab12cd"}
```

- The trigger accepts POST, GET and PUT. Use POST with JSON.
- Keep the keys flat and simple. They become the mapping names inside the workflow.
- No auth header. The URL itself is the secret.
- The real script also sends `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `ref`, `submitted_at`, `sheet_row_url` and `summary` (see `webhookBody_` in `Code.gs`).
- Health answers stay out of this payload unless Diana and the consultant decide they belong in the CRM. The Script Property `ALERT_WEBHOOK_INCLUDE_ANSWERS` = `true` adds them: `pain_today`, `main_goal`, `areas`, `surgery_6mo`, `serious_condition`, `pregnant`, `postpartum`, `current_injury` (each `Y` or `N`), `other_flags` (any ticked box without a column of its own), `cleared` (`yes`, `no`, `not_sure` or `not asked`, plus `config error` or `unknown` when something needs fixing) and `details`.

### Apps Script

```js
function alertGhl(lead) {
  UrlFetchApp.fetch(PropertiesService.getScriptProperties().getProperty('GHL_WEBHOOK_URL'), {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      first_name: lead.firstName,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source
    }),
    muteHttpExceptions: true
  });
}
```

---

## Not recommended: carrier email-to-text addresses

The old trick of emailing `5615550123@carrier-domain` to produce a free text is no longer dependable.

| Carrier | Address | Status in late 2026 |
| --- | --- | --- |
| AT&T (and Cricket) | `number@txt.att.net` | Shut down June 17, 2025. |
| T-Mobile (and Sprint) | `number@tmomail.net` | No official notice found, but widely reported as failing or dead since late 2024. Sprint's own gateway closed earlier. |
| Verizon | `number@vtext.com` | Still switched on but heavily filtered. Verizon is phasing it out, with completion expected by March 31, 2027. |

Most of the shutdown reporting comes from companies selling replacements, so exact dates other than AT&T's are soft. The practical answer is the same either way: do not build on these.

For the record, the "request" was just an email:

```js
MailApp.sendEmail('5615550123@vtext.com', '', 'New application: Jane D.');
```

---

## Suggested wiring in the Apps Script

This is the idea in its simplest form. `integrations/google-sheet/Code.gs` already does it (see `ALERT_CHANNELS` in that file), so there is nothing to paste. Each channel runs on its own, and one failing never stops the others or the save.

The chosen setup sends the email to Diana on every submission and nothing else. ntfy, Twilio and GoHighLevel are not in use. The three commented lines show where they would go if that ever changes.

```js
function notifyDiana(lead) {
  var text = 'New intake: ' + lead.firstName + ', ' + lead.status + '. Open the sheet for details.';
  try { alertEmail(text); } catch (e) { console.error(e); }
  // try { alertNtfy(text); } catch (e) { console.error(e); }
  // try { alertTwilio(text); } catch (e) { console.error(e); }
  // try { alertGhl(lead); } catch (e) { console.error(e); }
}
```

After changing the script, deploy a new version of the web app (**Deploy** > **Manage deployments** > edit > **New version**), or the live form keeps using the old code. The first run that calls an outside service asks the script owner to approve the "connect to an external service" permission.

## Sources

- Twilio US SMS pricing: https://www.twilio.com/en-us/sms/pricing/us
- Twilio A2P 10DLC registration types and fees: https://support.twilio.com/hc/en-us/articles/4407882914971
- Twilio Sole Proprietor registration: https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/direct-sole-proprietor-registration-overview
- Twilio toll-free business registration number change (February 17, 2026): https://www.twilio.com/en-us/changelog/business-registration-numbers-required-for-toll-free-messaging-p
- Twilio Message resource: https://www.twilio.com/docs/messaging/api/message-resource
- ntfy publishing: https://docs.ntfy.sh/publish/
- Pushover API: https://pushover.net/api
- Telegram Bot API: https://core.telegram.org/bots/api
- GoHighLevel Inbound Webhook trigger: https://help.gohighlevel.com/support/solutions/articles/155000003147-workflow-trigger-inbound-webhook
- Carrier gateway status: https://sigspan.com/carrier-gateway-shutdown and https://email2phone.net/verizon-vtext-shutdown/
