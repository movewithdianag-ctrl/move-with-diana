/**
 * Move with Diana: 8-Week Pilates Program intake backend (Google Apps Script web app).
 *
 * What it does, in order, for every application sent from /apply:
 *   1. Reads the JSON the site posts (a JSON string in a text/plain body,
 *      exactly what src/lib/intake.ts sends).
 *   2. Drops bots (honeypot), checks the basics, trims every field.
 *   3. Saves one row in the "Leads" tab, matching columns by header NAME,
 *      so columns can be reordered or added without breaking anything.
 *   4. Alerts Diana: email, plus any push / text / webhook channel that has
 *      been switched on in Script Properties.
 *   5. Answers {"ok":true} or {"ok":false,"error":"..."}. It never throws.
 *
 * Nothing secret lives in this file. Every address, token and phone number
 * is read from Project Settings > Script Properties (see SETUP.md).
 *
 * The functions you can run from the editor: setup, testSubmit, testAlerts.
 * Names that end in an underscore are private helpers.
 *
 * PRIVACY: the sheet holds health details. Keep it private. Never publish it
 * to the web and never share it by public link.
 */

/* ================================ Settings ================================ */

var SERVICE_NAME = 'mwd-intake';
var DEFAULT_LEADS_SHEET = 'Leads';
var LOG_SHEET = 'Log';

/** Largest request body accepted, in characters. A real application is about 1,500. */
var MAX_BODY_CHARS = 20000;
/**
 * How long one request waits for another to finish writing. Kept well under
 * the 25 seconds the site waits (SHEET_TIMEOUT_MS in src/lib/intake.ts), so
 * the site hears "ok" or "busy" before it gives up and sends its backup email.
 */
var LOCK_WAIT_MS = 10000;
/**
 * Once a request has been running this long, the alert channels after the
 * email are skipped (and logged), for the same reason: the site must get its
 * answer in time. The row is already saved by then.
 */
var ALERT_DEADLINE_MS = 15000;
/** The Log tab keeps roughly this many of the newest lines. */
var LOG_MAX_ROWS = 500;
/**
 * Alerts per day before the script goes quiet (rows are still saved).
 * Each alert uses one email per address in ALERT_EMAILS, and a free Gmail
 * account can send about 100 a day, so 30 leaves room for two addresses.
 */
var DEFAULT_DAILY_ALERT_LIMIT = 30;
/** New rows per day before the script stops saving (a flood of junk cannot bury real leads). */
var DEFAULT_DAILY_ROW_LIMIT = 300;
/** Emails always kept back for the emergency "row could not be saved" backup. */
var RESCUE_EMAIL_RESERVE = 10;
/** Emergency backup emails per day, so a flood during a sheet outage cannot fill the inbox. */
var DAILY_RESCUE_LIMIT = 10;

var STATUS_QUALIFIED = 'QUALIFIED';
var STATUS_NOT_CLEARED = 'NOT CLEARED';
var STATUS_UNKNOWN = 'UNKNOWN';

/**
 * What the "Cleared" column may hold: the three answers on the form, "not
 * asked" when no health box was ticked (the form then skips the question),
 * and "config error" when the form's own screening rule was broken and it
 * turned the person away to be safe.
 */
var CLEARED_VALUES = ['yes', 'no', 'not_sure', 'not asked', 'config error'];
/** Written by this script when the value sent does not add up. */
var CLEARED_UNKNOWN = 'unknown';

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var LEAD_ID_RE = /^[A-Za-z0-9_-]{1,200}$/;

/** Length cap for every field the site can send. */
var LIMITS = {
  firstName: 80,
  name: 170,
  email: 254,
  phone: 40,
  areas: 500,
  choice: 40,
  longText: 2000,
  tag: 150,
  referrer: 300,
  page: 200,
  leadId: 200
};

/**
 * The columns, in the order they are created on a brand new sheet.
 *
 *   header    the text in row 1. Matching ignores capitals, punctuation and
 *             anything in brackets, so "Paid?" and "Paid? (Y/N)" are the same.
 *   field     which value from rowValues_() goes in the column.
 *   format    number format for the cell. Left out = plain text (keeps phone
 *             numbers and leading zeros intact). null = leave the cell's
 *             format alone.
 *   tracking  true for the columns Diana fills in by hand. They get a starting
 *             value on a new row and are never overwritten afterwards.
 *
 * One column per fact. The five health check columns hold Y or N, and "Other
 * health boxes" lists any ticked box that has no column of its own. "Cleared"
 * holds one of CLEARED_VALUES, or CLEARED_UNKNOWN (see normalise_).
 */
var COLUMNS = [
  { header: 'Timestamp', field: 'timestamp', format: 'yyyy-mm-dd hh:mm', width: 130 },
  { header: 'Status', field: 'status', width: 110 },
  { header: 'Needs review (Y/N)', field: 'needsReview', width: 110 },
  { header: 'Name', field: 'name', width: 160 },
  { header: 'Email / Phone', field: 'emailPhone', width: 260 },
  { header: 'Start date', field: 'startDate', format: null, tracking: true, width: 100 },
  { header: 'Paid? (Y/N)', field: 'paid', tracking: true, width: 90 },
  { header: 'Sessions used (0-8)', field: 'sessionsUsed', format: '0', tracking: true, width: 110 },
  { header: 'Pain 0-10 at start', field: 'pain', format: '0', width: 110 },
  { header: 'Main goal', field: 'goal', width: 300 },
  { header: 'Testimonial (Y/N)', field: 'testimonial', tracking: true, width: 110 },
  { header: 'Email', field: 'email', width: 200 },
  { header: 'Phone', field: 'phone', width: 130 },
  { header: 'Surgery last 6 months (Y/N)', field: 'surgery6mo', width: 110 },
  { header: 'Serious condition (Y/N)', field: 'seriousDiagnosis', width: 110 },
  { header: 'Pregnant (Y/N)', field: 'pregnant', width: 90 },
  { header: 'Recently postpartum (Y/N)', field: 'postpartum', width: 110 },
  { header: 'Current injury (Y/N)', field: 'currentInjury', width: 110 },
  { header: 'Other health boxes', field: 'otherFlags', width: 160 },
  { header: 'Cleared', field: 'cleared', width: 100 },
  { header: 'Details', field: 'conditionDetails', width: 300 },
  { header: 'Areas', field: 'areas', width: 200 },
  { header: 'Consent (Y/N)', field: 'consent', width: 90 },
  { header: 'Source', field: 'source' },
  { header: 'UTM source', field: 'utmSource' },
  { header: 'UTM medium', field: 'utmMedium' },
  { header: 'UTM campaign', field: 'utmCampaign' },
  { header: 'UTM content', field: 'utmContent' },
  { header: 'Referrer', field: 'referrer' },
  { header: 'Page', field: 'page' },
  { header: 'Ref', field: 'ref' },
  { header: 'Lead ID', field: 'leadId', width: 190 }
];

/* ============================== Web app entry ============================== */

/** Health check. Open the /exec URL in a browser to see it. Returns no data. */
function doGet() {
  return json_({ ok: true, service: SERVICE_NAME });
}

/** Receives one application. Always answers with JSON, never throws. */
function doPost(e) {
  var result;
  try {
    result = handlePost_(e);
  } catch (err) {
    log_('ERROR', 'doPost', err);
    result = fail_('server_error');
  }
  return json_(result);
}

function handlePost_(e) {
  var startedAt = Date.now();
  var raw = e && e.postData && typeof e.postData.contents === 'string' ? e.postData.contents : '';
  if (!raw) return fail_('empty_body');
  if (raw.length > MAX_BODY_CHARS) return fail_('too_large');

  var data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return fail_('invalid_json');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return fail_('invalid_payload');

  // Honeypot: a hidden field real people never see. Answer "ok" so the bot
  // learns nothing, and save nothing.
  if (text_(data.website, 200) !== '') {
    log_('INFO', 'doPost', 'Honeypot was filled in. Submission dropped.');
    return { ok: true };
  }

  var lead = normalise_(data);
  if (!lead.name) return fail_('missing_name');
  if (!lead.emailOk && !lead.phoneOk) return fail_('missing_contact');

  var saved = null;
  var saveError = null;
  var wantsAlert = false;
  var withinBudget = true;
  var locked = false;
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(LOCK_WAIT_MS);
    locked = true;
    var written = saveLead_(SpreadsheetApp.getActiveSpreadsheet(), lead);
    SpreadsheetApp.flush();
    saved = written;
  } catch (err) {
    saveError = err;
  }

  if (saved) {
    wantsAlert = shouldAlert_(saved);
    if (wantsAlert) {
      try {
        withinBudget = alertBudgetOk_();
      } catch (err) {
        withinBudget = true;
      }
    }
  }

  if (locked) {
    try {
      lock.releaseLock();
    } catch (err) {
      /* nothing to do */
    }
  }

  if (!saved) {
    log_('ERROR', 'saveLead', saveError);
    // Last resort so the lead is not lost: email everything to Diana.
    if (rescueByEmail_(lead)) return { ok: true };
    return fail_(locked ? 'write_failed' : 'busy');
  }

  // Too many new rows today: nothing was written. The site then falls back
  // to its backup email (or shows "try again"), and the Log says why, once.
  if (saved.action === 'rate_limited') {
    warnRowLimitOnce_();
    return fail_('rate_limited');
  }

  if (saved.action === 'updated') {
    log_('INFO', 'doPost', 'Repeat submission for row ' + saved.row + '. Row updated, no new alert.');
  }

  if (wantsAlert) {
    if (withinBudget) {
      sendAlerts_(lead, { rowUrl: saved.rowUrl, row: saved.row, startedAt: startedAt });
    } else {
      log_('WARN', 'alerts', 'Daily alert limit reached. Row ' + saved.row + ' was saved without an alert.');
    }
  }

  return { ok: true };
}

function fail_(code) {
  return { ok: false, error: code };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ============================ Cleaning the input ============================ */

/**
 * One value from the payload as trimmed, length-capped text.
 * Control characters are removed. Line breaks are kept only when multiline.
 */
function text_(value, max, multiline) {
  var s;
  if (typeof value === 'string') {
    s = value;
  } else if (typeof value === 'number' && isFinite(value)) {
    s = String(value);
  } else if (typeof value === 'boolean') {
    s = value ? 'true' : 'false';
  } else if (Array.isArray(value)) {
    s = value
      .filter(function (v) {
        return typeof v === 'string' || (typeof v === 'number' && isFinite(v));
      })
      .join(', ');
  } else {
    s = '';
  }
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  s = multiline ? s.replace(/\r\n?/g, '\n').replace(/\t/g, ' ') : s.replace(/[\r\n\t]+/g, ' ');
  s = s.replace(/^\s+|\s+$/g, '');
  return s.slice(0, max);
}

/** A 0 to 10 whole number, or "" when missing or out of range. */
function pain_(value) {
  var n;
  if (typeof value === 'number') {
    n = value;
  } else if (typeof value === 'string' && value.replace(/\s/g, '') !== '') {
    n = Number(value);
  } else {
    return '';
  }
  if (!isFinite(n)) return '';
  n = Math.round(n);
  return n >= 0 && n <= 10 ? n : '';
}

/** "not_sure" becomes "Not sure". Used where a person reads the answer (the alert email). */
function pretty_(value) {
  var s = String(value || '').replace(/_/g, ' ');
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/** Best effort +1XXXXXXXXXX form of a phone number ("" when unsure). */
function e164_(phone) {
  var digits = String(phone || '').replace(/\D/g, '');
  if (/^\s*\+/.test(String(phone || '')) && digits.length >= 8 && digits.length <= 15) return '+' + digits;
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.charAt(0) === '1') return '+' + digits;
  return '';
}

function isYes_(value) {
  return value === true || /^(true|y|yes|1)$/i.test(text_(value, 10));
}

/** "Y" or "N" for the yes / no columns. Anything that is not a clear yes is "N". */
function yesNo_(value) {
  return isYes_(value) ? 'Y' : 'N';
}

/** Turn the raw payload into a clean lead object. Every field is capped. */
function normalise_(data) {
  var name = text_(data.name, LIMITS.name).replace(/\s+/g, ' ');
  var firstName = text_(data.firstName, LIMITS.firstName) || name.split(' ')[0];
  var email = text_(data.email, LIMITS.email).toLowerCase();
  var phone = text_(data.phone, LIMITS.phone);
  var phoneDigits = phone.replace(/\D/g, '');

  var status;
  var sentStatus = text_(data.status, 20).toUpperCase().replace(/_/g, ' ');
  var outcome = text_(data.outcome, 20).toLowerCase();
  if (sentStatus === STATUS_QUALIFIED || sentStatus === STATUS_NOT_CLEARED) status = sentStatus;
  else if (outcome === 'qualified') status = STATUS_QUALIFIED;
  else if (outcome === 'not_cleared') status = STATUS_NOT_CLEARED;
  else status = STATUS_UNKNOWN;

  var leadId = text_(data.leadId, LIMITS.leadId);
  if (!LEAD_ID_RE.test(leadId)) leadId = '';

  // The health check: one Y or N per box on the form. A ticked box with no
  // column of its own (added or renamed in the admin panel) arrives by name.
  var surgery6mo = yesNo_(data.surgery6mo);
  var seriousDiagnosis = yesNo_(data.seriousDiagnosis);
  var pregnant = yesNo_(data.pregnant);
  var postpartum = yesNo_(data.postpartum);
  var currentInjury = yesNo_(data.currentInjury);
  var otherFlags = text_(data.otherFlags, LIMITS.tag);
  var anyFlag =
    [surgery6mo, seriousDiagnosis, pregnant, postpartum, currentInjury].indexOf('Y') !== -1 || otherFlags !== '';

  // "Cleared" must be a known value that fits the boxes. Anything else (an old
  // copy of the form, a hand-made request) fails closed: with a box ticked the
  // row says "unknown", NOT CLEARED and needs review. With nothing ticked the
  // question was never asked.
  var needsReview = isYes_(data.needsReview);
  var cleared = text_(data.cleared, LIMITS.choice).toLowerCase();
  if (CLEARED_VALUES.indexOf(cleared) === -1 || (anyFlag && cleared === 'not asked')) {
    if (anyFlag) {
      cleared = CLEARED_UNKNOWN;
      status = STATUS_NOT_CLEARED;
      needsReview = true;
    } else {
      cleared = 'not asked';
    }
  }

  return {
    status: status,
    needsReview: needsReview,
    name: name,
    firstName: firstName,
    email: email,
    emailOk: EMAIL_RE.test(email),
    phone: phone,
    phoneOk: phoneDigits.length >= 7 && phoneDigits.length <= 15,
    phoneE164: e164_(phone),
    surgery6mo: surgery6mo,
    seriousDiagnosis: seriousDiagnosis,
    pregnant: pregnant,
    postpartum: postpartum,
    currentInjury: currentInjury,
    otherFlags: otherFlags,
    cleared: cleared,
    conditionDetails: text_(data.conditionDetails, LIMITS.longText, true),
    areas: text_(data.areas, LIMITS.areas),
    painToday: pain_(data.painToday),
    goal: text_(data.goal, LIMITS.longText, true),
    consent: yesNo_(data.consent),
    source: text_(data.source, LIMITS.tag),
    utmSource: text_(data.utm_source, LIMITS.tag),
    utmMedium: text_(data.utm_medium, LIMITS.tag),
    utmCampaign: text_(data.utm_campaign, LIMITS.tag),
    utmContent: text_(data.utm_content, LIMITS.tag),
    ref: text_(data.ref, LIMITS.tag),
    referrer: text_(data.referrer, LIMITS.referrer),
    page: text_(data.page, LIMITS.page),
    leadId: leadId
  };
}

/* ================================ The sheet ================================ */

/** Header text reduced to a matching key: "Paid? (Y/N)" becomes "paid". */
function headerKey_(text) {
  return String(text === null || text === undefined ? '' : text)
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function leadsSheetName_() {
  return prop_('LEADS_SHEET') || DEFAULT_LEADS_SHEET;
}

/** The Leads tab, created if missing. A lone empty first tab is reused. */
function getLeadsSheet_(ss) {
  var name = leadsSheetName_();
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  var sheets = ss.getSheets();
  if (sheets.length === 1 && sheets[0].getLastRow() === 0 && sheets[0].getLastColumn() === 0) {
    sheets[0].setName(name);
    return sheets[0];
  }
  return ss.insertSheet(name, 0);
}

/**
 * Make sure every column in COLUMNS has a header in row 1 (missing ones are
 * added on the right, bold) and return { headerKey: columnNumber }.
 */
function ensureHeaders_(sheet) {
  var lastCol = sheet.getLastColumn();
  var existing = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var map = {};
  for (var i = 0; i < existing.length; i++) {
    var key = headerKey_(existing[i]);
    if (key && !map[key]) map[key] = i + 1;
  }

  var missing = COLUMNS.filter(function (column) {
    return !map[headerKey_(column.header)];
  });

  if (missing.length > 0) {
    var needed = lastCol + missing.length;
    var maxCols = sheet.getMaxColumns();
    if (needed > maxCols) sheet.insertColumnsAfter(maxCols, needed - maxCols);
    var headers = missing.map(function (column) {
      return column.header;
    });
    var range = sheet.getRange(1, lastCol + 1, 1, missing.length);
    range.setNumberFormat('@');
    range.setValues([headers]);
    range.setFontWeight('bold');
    for (var m = 0; m < missing.length; m++) {
      map[headerKey_(missing[m].header)] = lastCol + 1 + m;
    }
  }

  if (sheet.getFrozenRows() < 1) sheet.setFrozenRows(1);
  return map;
}

function columnOf_(map, header) {
  return map[headerKey_(header)] || 0;
}

/** Row number of the newest row with this lead id (0 = none). */
function findRowByLeadId_(sheet, map, leadId) {
  var col = columnOf_(map, 'Lead ID');
  var lastRow = sheet.getLastRow();
  if (!col || !leadId || lastRow < 2) return 0;
  var values = sheet.getRange(2, col, lastRow - 1, 1).getValues();
  for (var i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]).replace(/^\s+|\s+$/g, '') === leadId) return i + 2;
  }
  return 0;
}

/**
 * Stop a value being read as a formula. Anything that starts with = + - or @
 * gets a leading apostrophe, which Sheets treats as "this is plain text".
 */
function safeCell_(value) {
  if (typeof value === 'number') return value;
  if (Object.prototype.toString.call(value) === '[object Date]') return value;
  var s = String(value === null || value === undefined ? '' : value);
  if (/^[=+\-@\t\r]/.test(s)) return "'" + s;
  return s;
}

/** What goes in each column, keyed by the "field" names in COLUMNS. */
function rowValues_(lead) {
  return {
    timestamp: new Date(),
    status: lead.status,
    needsReview: lead.needsReview ? 'Y' : 'N',
    name: lead.name,
    emailPhone: [lead.email, lead.phone]
      .filter(function (part) {
        return part !== '';
      })
      .join(' / '),
    startDate: '',
    paid: 'N',
    sessionsUsed: 0,
    pain: lead.painToday,
    goal: lead.goal,
    testimonial: 'N',
    email: lead.email,
    phone: lead.phone,
    surgery6mo: lead.surgery6mo,
    seriousDiagnosis: lead.seriousDiagnosis,
    pregnant: lead.pregnant,
    postpartum: lead.postpartum,
    currentInjury: lead.currentInjury,
    otherFlags: lead.otherFlags,
    cleared: lead.cleared,
    conditionDetails: lead.conditionDetails,
    areas: lead.areas,
    consent: lead.consent,
    source: lead.source,
    utmSource: lead.utmSource,
    utmMedium: lead.utmMedium,
    utmCampaign: lead.utmCampaign,
    utmContent: lead.utmContent,
    referrer: lead.referrer,
    page: lead.page,
    ref: lead.ref,
    leadId: lead.leadId
  };
}

/**
 * Write one lead into one row. Only the script's own columns are touched, so
 * extra columns Diana adds (notes, formulas) are left exactly as they are.
 */
function writeRow_(sheet, map, row, values, isNew) {
  var cells = [];
  COLUMNS.forEach(function (column) {
    if (column.tracking && !isNew) return;
    var col = columnOf_(map, column.header);
    if (!col) return;
    cells.push({ col: col, value: safeCell_(values[column.field]), format: column.format });
  });
  cells.sort(function (a, b) {
    return a.col - b.col;
  });

  var i = 0;
  while (i < cells.length) {
    var j = i;
    while (j + 1 < cells.length && cells[j + 1].col === cells[j].col + 1) j++;
    var run = cells.slice(i, j + 1);
    var range = sheet.getRange(row, run[0].col, 1, run.length);
    var formats = range.getNumberFormats()[0];
    var rowValues = [];
    for (var k = 0; k < run.length; k++) {
      if (run[k].format !== null) formats[k] = run[k].format === undefined ? '@' : run[k].format;
      rowValues.push(run[k].value);
    }
    range.setNumberFormats([formats]);
    range.setValues([rowValues]);
    i = j + 1;
  }
}

/**
 * Save the lead. A lead id that is already in the sheet updates that row
 * instead of adding a second one, but only when it is clearly the same
 * application sent twice (a retry, a double tap): same person, same result.
 *
 * Anything else that arrives with a known lead id (a different person on the
 * same phone, or the same person applying again with a different result) is
 * added as a NEW row, so the earlier record is never overwritten and Diana
 * is alerted about it.
 *
 * action: "created", "updated" or "rate_limited" (the daily row cap was hit
 * and nothing was written).
 */
function saveLead_(ss, lead) {
  var sheet = getLeadsSheet_(ss);
  var map = ensureHeaders_(sheet);
  var existingRow = findRowByLeadId_(sheet, map, lead.leadId);
  var row;

  if (existingRow) {
    var previousStatus = cellText_(sheet, existingRow, columnOf_(map, 'Status')).toUpperCase();
    var sameApplication = previousStatus === lead.status && sameContact_(sheet, map, existingRow, lead);
    if (!sameApplication) existingRow = 0;
  }

  if (existingRow) {
    row = existingRow;
  } else {
    var allowed = true;
    try {
      allowed = dailyBudgetOk_('DAILY_ROW_LIMIT', DEFAULT_DAILY_ROW_LIMIT, 'ROW_COUNTER');
    } catch (err) {
      allowed = true;
    }
    if (!allowed) return { row: 0, rowUrl: '', action: 'rate_limited' };
    row = sheet.getLastRow() + 1;
    var maxRows = sheet.getMaxRows();
    if (row > maxRows) sheet.insertRowsAfter(maxRows, row - maxRows);
  }

  writeRow_(sheet, map, row, rowValues_(lead), !existingRow);

  return {
    row: row,
    rowUrl: rowUrl_(ss, sheet, row),
    action: existingRow ? 'updated' : 'created'
  };
}

/** One cell as trimmed text ("" when the column is missing). */
function cellText_(sheet, row, col) {
  if (!col) return '';
  return String(sheet.getRange(row, col).getValue()).replace(/^\s+|\s+$/g, '');
}

/** True when the row already holds this same person: email first, phone when there is no email. */
function sameContact_(sheet, map, row, lead) {
  var rowEmail = cellText_(sheet, row, columnOf_(map, 'Email')).toLowerCase();
  if (lead.email !== '' || rowEmail !== '') return rowEmail === lead.email;
  var rowPhone = cellText_(sheet, row, columnOf_(map, 'Phone')).replace(/\D/g, '');
  return rowPhone === lead.phone.replace(/\D/g, '');
}

function rowUrl_(ss, sheet, row) {
  try {
    return ss.getUrl() + '#gid=' + sheet.getSheetId() + '&range=A' + row;
  } catch (err) {
    return '';
  }
}

/* ============================= Alert decisions ============================= */

/** One alert per new row. The same application sent twice updates its row and stays quiet. */
function shouldAlert_(saved) {
  return saved.action === 'created';
}

/**
 * A simple daily cap so a flood of junk can never burn through the email
 * quota or run up a text bill. Rows are still saved; only alerts stop.
 * The cap counts ALERTS. Each alert sends one email per address in
 * ALERT_EMAILS, so two addresses use two emails per alert.
 * Change the cap with the Script Property DAILY_ALERT_LIMIT.
 */
function alertBudgetOk_() {
  return dailyBudgetOk_('DAILY_ALERT_LIMIT', DEFAULT_DAILY_ALERT_LIMIT, 'ALERT_COUNTER');
}

function today_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Count one more against a daily cap. false = the cap is already used up.
 * The tally lives in a Script Property as "2026-11-14|7" and restarts each day.
 * Used for alerts (DAILY_ALERT_LIMIT) and for new rows (DAILY_ROW_LIMIT).
 */
function dailyBudgetOk_(limitProp, defaultLimit, counterProp) {
  var props = PropertiesService.getScriptProperties();
  var limit = parseInt(props.getProperty(limitProp), 10);
  if (!(limit >= 0)) limit = defaultLimit;
  var today = today_();
  var parts = String(props.getProperty(counterProp) || '').split('|');
  var count = parts[0] === today ? parseInt(parts[1], 10) || 0 : 0;
  if (count >= limit) return false;
  props.setProperty(counterProp, today + '|' + (count + 1));
  return true;
}

/** One line in the Log tab per day when the row cap turns applications away. */
function warnRowLimitOnce_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var today = today_();
    if (props.getProperty('ROW_LIMIT_WARNED') === today) return;
    props.setProperty('ROW_LIMIT_WARNED', today);
  } catch (err) {
    /* log it anyway */
  }
  log_(
    'WARN',
    'rows',
    'Daily row limit reached. New applications are not being saved until tomorrow. If this is real traffic, raise DAILY_ROW_LIMIT.'
  );
}

/* ================================== Alerts ================================== */

function prop_(name) {
  var value = PropertiesService.getScriptProperties().getProperty(name);
  return value === null || value === undefined ? '' : String(value).replace(/^\s+|\s+$/g, '');
}

function isOff_(value) {
  return /^(false|no|off|0)$/i.test(String(value || ''));
}

function isOn_(value) {
  return /^(true|yes|on|1)$/i.test(String(value || ''));
}

function listProp_(name) {
  return prop_(name)
    .split(/[,;\s]+/)
    .filter(function (item) {
      return item !== '';
    });
}

/** The channels, in the order they fire. Each returns "sent" or "off", or throws. */
var ALERT_CHANNELS = [
  ['email', alertEmail_],
  ['ntfy', alertNtfy_],
  ['twilio', alertTwilio_],
  ['telegram', alertTelegram_],
  ['pushover', alertPushover_],
  ['webhook', alertWebhook_]
];

/**
 * Fire every configured channel. Each one is wrapped on its own, so a failure
 * in one never blocks the others and never reaches the visitor. Failures go
 * to the Log tab.
 *
 * When ctx.startedAt is given (a live request), the email always goes, and
 * the channels after it are skipped once ALERT_DEADLINE_MS has passed, so the
 * visitor's browser gets its answer in time. One Log line says so.
 */
function sendAlerts_(lead, ctx) {
  var results = [];
  var outOfTime = false;
  for (var i = 0; i < ALERT_CHANNELS.length; i++) {
    var channel = ALERT_CHANNELS[i][0];
    if (!outOfTime && i > 0 && ctx && ctx.startedAt && Date.now() - ctx.startedAt > ALERT_DEADLINE_MS) {
      outOfTime = true;
      log_(
        'WARN',
        'alerts',
        'The request was running long, so the alert channels after "' + ALERT_CHANNELS[i - 1][0] + '" were skipped. The row is saved.'
      );
    }
    if (outOfTime) {
      results.push({ channel: channel, result: 'SKIPPED' });
      continue;
    }
    try {
      results.push({ channel: channel, result: ALERT_CHANNELS[i][1](lead, ctx) });
    } catch (err) {
      results.push({ channel: channel, result: 'FAILED', error: redact_(errorText_(err)) });
      log_('ERROR', 'alert:' + channel, err);
    }
  }
  return results;
}

/** POST helper: quiet on HTTP errors, then throws a short readable message. */
function post_(url, options) {
  options.method = 'post';
  options.muteHttpExceptions = true;
  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('HTTP ' + code + ': ' + String(response.getContentText()).slice(0, 200));
  }
  return response;
}

/** "Jane D." for the alerts that must stay vague. */
function shortName_(lead) {
  var parts = lead.name.split(' ').filter(function (part) {
    return part !== '';
  });
  var first = lead.firstName || parts[0] || 'Someone';
  var initial = parts.length > 1 ? ' ' + parts[parts.length - 1].charAt(0).toUpperCase() + '.' : '';
  return first + initial;
}

/** The health check boxes that were ticked, as one readable line for the alert email. */
function healthCheckText_(lead) {
  var ticked = [
    ['Surgery in the last 6 months', lead.surgery6mo],
    ['Serious condition', lead.seriousDiagnosis],
    ['Pregnant', lead.pregnant],
    ['Recently postpartum', lead.postpartum],
    ['Current injury', lead.currentInjury]
  ]
    .filter(function (item) {
      return item[1] === 'Y';
    })
    .map(function (item) {
      return item[0];
    });
  if (lead.otherFlags) ticked.push('Other: ' + lead.otherFlags);
  return ticked.length > 0 ? ticked.join(', ') : 'Nothing ticked';
}

/**
 * The short alert line.
 *   full     "New intake: Jane Doe, QUALIFIED, pain 6/10, (561) 555-0123"
 *   minimal  "New intake: Jane D., QUALIFIED. Open the sheet for details."
 */
function alertText_(lead, detail) {
  if (detail === 'minimal') {
    return 'New intake: ' + shortName_(lead) + ', ' + lead.status + '. Open the sheet for details.';
  }
  var parts = ['New intake: ' + (lead.name || lead.email), lead.status];
  if (lead.painToday !== '') parts.push('pain ' + lead.painToday + '/10');
  parts.push(lead.phone || lead.email || 'no phone');
  if (lead.needsReview) parts.push('needs review');
  return parts.join(', ').slice(0, 300);
}

/**
 * Script Property ALERT_TEXT_DETAIL: "minimal" (default) or "full".
 * Minimal is the default so no pain score and no phone number reach a text
 * service or a lock screen unless Diana chooses that.
 */
function textDetail_() {
  return prop_('ALERT_TEXT_DETAIL').toLowerCase() === 'full' ? 'full' : 'minimal';
}

/* ---------------------------------- Email ---------------------------------- */

function esc_(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function alertRecipients_() {
  var all = listProp_('ALERT_EMAILS').concat(listProp_('ALERT_EMAIL'));
  var seen = {};
  return all.filter(function (address) {
    var key = address.toLowerCase();
    if (!EMAIL_RE.test(address) || seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

/**
 * The result in plain words, for the very top of the alert email.
 * Worked out from the status and the needs review flag only.
 */
function resultLine_(lead) {
  if (lead.status === STATUS_QUALIFIED) {
    return lead.needsReview ? 'Good fit, but read their notes first' : 'Good fit';
  }
  if (lead.status === STATUS_NOT_CLEARED) return 'Not cleared yet';
  return 'Result unclear';
}

/**
 * One line telling Diana what to do now. The form does not ask how the person
 * likes to be contacted, so this suggests a text when they left a mobile
 * number (the form says it is for texting) and an email when they did not.
 * A "not cleared" note is always an email: it refers to their health answers,
 * and that does not belong in a text.
 */
function nextStep_(lead) {
  var how = lead.phoneOk ? 'Text' : 'Email';
  if (lead.status === STATUS_QUALIFIED && lead.needsReview) {
    return 'Next step: read their health notes, then ' + how.toLowerCase() + ' them within 5 minutes to say hello.';
  }
  if (lead.status === STATUS_QUALIFIED) {
    return 'Next step: ' + how.toLowerCase() + ' them within 5 minutes. Say hello and offer to answer any question before they reserve.';
  }
  if (lead.status === STATUS_NOT_CLEARED) {
    return 'Next step: email a kind note today. No payment or booking until their doctor or PT gives the OK.';
  }
  return 'Next step: open the row and check the answers before you reply.';
}

/**
 * The first line already typed for Diana when she taps Text or Email.
 * It is the same for every result and never carries a health detail.
 */
function replyOpener_(lead) {
  return (
    'Hi ' +
    (lead.firstName || 'there') +
    ', this is Diana from Move with Diana. Thank you for applying to the 8-Week Pilates Program. '
  );
}

/**
 * Subject, plain body and HTML body for the alert email.
 * The emergency backup (ctx.rescue) always carries every answer, even with
 * EMAIL_INCLUDE_ANSWERS off: that email is then the only copy of the lead.
 */
function buildEmail_(lead, ctx) {
  var includeAnswers = ctx.rescue === true || !isOff_(prop_('EMAIL_INCLUDE_ANSWERS'));
  var subject = 'New intake: ' + (lead.name || lead.email || 'no name') + ' (' + lead.status + ')';

  var rows = [
    ['Status', lead.status],
    ['Needs review', lead.needsReview ? 'Yes. Read the details before booking.' : 'No'],
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone', lead.phone]
  ];
  if (includeAnswers) {
    rows = rows.concat([
      ['Pain on a typical day', lead.painToday === '' ? '' : lead.painToday + '/10'],
      ['Main goal', lead.goal],
      ['Areas', lead.areas],
      ['Health check', healthCheckText_(lead)],
      ['Cleared for exercise', pretty_(lead.cleared)],
      ['Details', lead.conditionDetails],
      ['Consent', lead.consent === 'Y' ? 'Yes' : 'No']
    ]);
  }
  rows = rows.concat([
    ['Source', lead.source],
    ['UTM source', lead.utmSource],
    ['UTM medium', lead.utmMedium],
    ['UTM campaign', lead.utmCampaign],
    ['UTM content', lead.utmContent],
    ['Ref', lead.ref],
    ['Referrer', lead.referrer],
    ['Page', lead.page],
    ['Lead ID', lead.leadId]
  ]);
  rows = rows.filter(function (row) {
    return row[1] !== '';
  });

  var phoneDigits = lead.phone.replace(/\D/g, '');
  var dial = lead.phoneOk ? lead.phoneE164 || phoneDigits : '';
  // The text and the email open with a friendly first line already typed.
  // "?&body=" is the form that both iPhone and Android accept.
  var opener = encodeURIComponent(replyOpener_(lead));
  var mailto = lead.emailOk
    ? 'mailto:' +
      encodeURIComponent(lead.email).replace(/%40/g, '@') +
      '?subject=' +
      encodeURIComponent('Your 8-Week Pilates Program application') +
      '&body=' +
      opener
    : '';

  var links = [];
  if (dial) links.push(['Call ' + lead.phone, 'tel:' + dial]);
  if (dial) links.push(['Text ' + lead.phone, 'sms:' + dial + '?&body=' + opener]);
  if (mailto) links.push(['Email ' + lead.email, mailto]);
  if (ctx.rowUrl) links.push(['Open the row in the sheet', ctx.rowUrl]);

  var notes = [];
  if (ctx.rescue) {
    notes.push('This application could NOT be saved to the Google Sheet. Please add it by hand, then check the Log tab.');
  }
  if (!includeAnswers) notes.push('The answers are in the Google Sheet.');

  var result = resultLine_(lead);
  var nextStep = nextStep_(lead);

  // The result and the next step come first, so they show in the inbox preview.
  var plain = ['Result: ' + result, nextStep, '', 'New 8-Week Pilates Program application', ''];
  notes.forEach(function (note) {
    plain.push(note, '');
  });
  rows.forEach(function (row) {
    plain.push(row[0] + ': ' + row[1]);
  });
  plain.push('');
  links.forEach(function (link) {
    plain.push(link[0] + ': ' + link[1]);
  });

  var statusColor = lead.status === STATUS_QUALIFIED ? '#2f6b3a' : '#8a4b2a';
  var html = [
    '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#1f1d1b;max-width:560px">',
    '<p style="margin:0 0 4px;font-size:18px;font-weight:600;color:' + statusColor + '">' + esc_(result) + '</p>',
    '<p style="margin:0 0 20px">' + esc_(nextStep) + '</p>',
    '<p style="margin:0 0 4px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#6b655e">New 8-Week Pilates Program application</p>',
    '<p style="margin:0 0 16px;font-size:22px;font-weight:600">' +
      esc_(lead.name || lead.email) +
      ' <span style="font-size:14px;font-weight:600;color:' +
      statusColor +
      '">' +
      esc_(lead.status) +
      '</span></p>'
  ];
  notes.forEach(function (note) {
    html.push('<p style="margin:0 0 16px;padding:12px;background:#fff4d1;border-radius:6px">' + esc_(note) + '</p>');
  });
  if (links.length > 0) {
    html.push('<p style="margin:0 0 20px">');
    links.forEach(function (link) {
      html.push(
        '<a href="' +
          esc_(link[1]) +
          '" style="display:inline-block;margin:0 8px 8px 0;padding:10px 14px;border:1px solid #1f1d1b;border-radius:6px;color:#1f1d1b;text-decoration:none">' +
          esc_(link[0]) +
          '</a>'
      );
    });
    html.push('</p>');
  }
  html.push('<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">');
  rows.forEach(function (row) {
    html.push(
      '<tr><td style="padding:8px 12px 8px 0;border-top:1px solid #e6e1da;vertical-align:top;color:#6b655e;width:38%">' +
        esc_(row[0]) +
        '</td><td style="padding:8px 0;border-top:1px solid #e6e1da;vertical-align:top;white-space:pre-wrap">' +
        esc_(row[1]) +
        '</td></tr>'
    );
  });
  html.push('</table></div>');

  return { subject: subject, body: plain.join('\n'), htmlBody: html.join('') };
}

function alertEmail_(lead, ctx) {
  var to = alertRecipients_();
  if (to.length === 0) return 'off';
  // A normal alert never spends the last few emails of the day. They are
  // kept for rescueByEmail_(), the backup for a row that could not be saved.
  var rescue = Boolean(ctx && ctx.rescue);
  var remaining = MailApp.getRemainingDailyQuota();
  if (remaining < to.length) {
    throw new Error('Daily email quota is used up. No ' + (rescue ? 'backup' : 'alert') + ' email sent.');
  }
  if (!rescue && remaining < to.length + RESCUE_EMAIL_RESERVE) {
    throw new Error('Daily email quota is nearly used up. The rest is kept for emergency backups. No alert email sent.');
  }
  var mail = buildEmail_(lead, ctx);
  var message = {
    to: to.join(','),
    subject: mail.subject,
    body: mail.body,
    htmlBody: mail.htmlBody,
    name: 'Move with Diana website'
  };
  if (lead.emailOk) message.replyTo = lead.email;
  MailApp.sendEmail(message);
  return 'sent';
}

/**
 * Used only when the row could not be written. true = Diana got the lead by email.
 * At most DAILY_RESCUE_LIMIT a day. After that the site is told the save
 * failed, so it falls back to its own backup email or shows "try again".
 */
function rescueByEmail_(lead) {
  try {
    if (!rescueBudgetOk_()) return false;
    var sent = alertEmail_(lead, { rowUrl: '', rescue: true }) === 'sent';
    if (sent) log_('WARN', 'rescue', 'Row could not be saved. The application was emailed instead.');
    return sent;
  } catch (err) {
    log_('ERROR', 'rescue', err);
    return false;
  }
}

/** Counts one more backup email against today's cap. Logs once a day when the cap is hit. */
function rescueBudgetOk_() {
  var ok;
  try {
    ok = dailyBudgetOk_('DAILY_RESCUE_LIMIT', DAILY_RESCUE_LIMIT, 'RESCUE_COUNTER');
  } catch (err) {
    // The counter could not be read. Better one email too many than a lost lead.
    return true;
  }
  if (ok) return true;
  try {
    var props = PropertiesService.getScriptProperties();
    var today = today_();
    if (props.getProperty('RESCUE_LIMIT_WARNED') === today) return false;
    props.setProperty('RESCUE_LIMIT_WARNED', today);
  } catch (err) {
    /* log it anyway */
  }
  log_(
    'WARN',
    'rescue',
    'Daily limit for backup emails reached. Rows still cannot be saved: check the sheet and the lines above.'
  );
  return false;
}

/* ----------------------------- ntfy (free push) ----------------------------- */

/**
 * ntfy always gets the minimal line. On the public ntfy server the topic name
 * is the only lock on the door, so no health detail, no phone number and no
 * link to the sheet (the row link is in the alert email instead).
 */
function alertNtfy_(lead, ctx) {
  var topic = prop_('NTFY_TOPIC');
  if (!topic) return 'off';
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(topic)) {
    throw new Error('NTFY_TOPIC may only use letters, numbers, dashes and underscores (64 at most).');
  }
  var server = (prop_('NTFY_SERVER') || 'https://ntfy.sh').replace(/\/+$/, '');
  var priority = parseInt(prop_('NTFY_PRIORITY'), 10);
  if (!(priority >= 1 && priority <= 5)) priority = 4;
  var headers = { Title: 'New 8-Week Pilates Program application', Priority: String(priority), Tags: 'bell' };
  if (prop_('NTFY_TOKEN')) headers.Authorization = 'Bearer ' + prop_('NTFY_TOKEN');
  post_(server + '/' + topic, {
    contentType: 'text/plain; charset=utf-8',
    payload: alertText_(lead, 'minimal'),
    headers: headers
  });
  return 'sent';
}

/* ------------------------------- Twilio SMS ------------------------------- */

function alertTwilio_(lead) {
  var accountSid = prop_('TWILIO_ACCOUNT_SID');
  var apiKey = prop_('TWILIO_API_KEY');
  var secret = apiKey ? prop_('TWILIO_API_SECRET') : prop_('TWILIO_AUTH_TOKEN');
  var from = prop_('TWILIO_FROM');
  var service = prop_('TWILIO_MESSAGING_SERVICE_SID');
  var to = listProp_('ALERT_SMS_TO').concat(listProp_('ALERT_PHONE'));

  if (!accountSid && !apiKey && !from && !service) return 'off';
  var missing = [];
  if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
  if (!secret) missing.push(apiKey ? 'TWILIO_API_SECRET' : 'TWILIO_AUTH_TOKEN');
  if (!from && !service) missing.push('TWILIO_FROM');
  if (to.length === 0) missing.push('ALERT_SMS_TO');
  if (missing.length > 0) throw new Error('Twilio is only partly set up. Missing: ' + missing.join(', '));

  var auth = Utilities.base64Encode((apiKey || accountSid) + ':' + secret);
  var url = 'https://api.twilio.com/2010-04-01/Accounts/' + encodeURIComponent(accountSid) + '/Messages.json';
  var body = alertText_(lead, textDetail_());
  var errors = [];

  for (var i = 0; i < to.length; i++) {
    try {
      var fields = { To: to[i], Body: body };
      if (service) fields.MessagingServiceSid = service;
      else fields.From = from;
      post_(url, { headers: { Authorization: 'Basic ' + auth }, payload: fields });
    } catch (err) {
      errors.push(errorText_(err));
    }
  }
  if (errors.length > 0) throw new Error(errors.join(' | '));
  return 'sent';
}

/* -------------------------------- Telegram -------------------------------- */

function alertTelegram_(lead, ctx) {
  var token = prop_('TELEGRAM_TOKEN');
  var chatId = prop_('TELEGRAM_CHAT_ID');
  if (!token && !chatId) return 'off';
  if (!token || !chatId) throw new Error('Telegram needs both TELEGRAM_TOKEN and TELEGRAM_CHAT_ID.');
  var text = alertText_(lead, textDetail_());
  if (ctx.rowUrl) text += '\n' + ctx.rowUrl;
  var response = post_('https://api.telegram.org/bot' + token + '/sendMessage', {
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: text, disable_web_page_preview: true })
  });
  var parsed = null;
  try {
    parsed = JSON.parse(response.getContentText());
  } catch (err) {
    parsed = null;
  }
  if (!parsed || parsed.ok !== true) throw new Error('Telegram did not confirm the message.');
  return 'sent';
}

/* -------------------------------- Pushover -------------------------------- */

function alertPushover_(lead, ctx) {
  var token = prop_('PUSHOVER_TOKEN');
  var user = prop_('PUSHOVER_USER');
  if (!token && !user) return 'off';
  if (!token || !user) throw new Error('Pushover needs both PUSHOVER_TOKEN and PUSHOVER_USER.');
  var priority = parseInt(prop_('PUSHOVER_PRIORITY'), 10);
  if (!(priority >= -2 && priority <= 2)) priority = 1;
  var fields = {
    token: token,
    user: user,
    title: 'New 8-Week Pilates Program application',
    message: alertText_(lead, textDetail_()),
    priority: String(priority)
  };
  if (priority === 2) {
    fields.retry = '60';
    fields.expire = '3600';
  }
  if (ctx.rowUrl) {
    fields.url = ctx.rowUrl;
    fields.url_title = 'Open the sheet';
  }
  post_('https://api.pushover.net/1/messages.json', { payload: fields });
  return 'sent';
}

/* ------------------- Webhook (GoHighLevel, Zapier, Make) ------------------- */

/**
 * Flat JSON, one key per value, so it maps cleanly in GoHighLevel, Zapier or
 * Make. Contact details, status and where the lead came from are always sent.
 * The health answers are added only when the Script Property
 * ALERT_WEBHOOK_INCLUDE_ANSWERS is "true".
 */
function webhookBody_(lead, ctx) {
  var body = {
    event: 'intake_submitted',
    first_name: lead.firstName,
    name: lead.name,
    email: lead.email,
    phone: lead.phoneE164 || lead.phone,
    status: lead.status,
    needs_review: lead.needsReview ? 'Y' : 'N',
    source: lead.source,
    utm_source: lead.utmSource,
    utm_medium: lead.utmMedium,
    utm_campaign: lead.utmCampaign,
    utm_content: lead.utmContent,
    ref: lead.ref,
    lead_id: lead.leadId,
    submitted_at: new Date().toISOString(),
    sheet_row_url: ctx.rowUrl || '',
    summary: alertText_(lead, 'minimal')
  };
  if (isOn_(prop_('ALERT_WEBHOOK_INCLUDE_ANSWERS'))) {
    body.pain_today = lead.painToday;
    body.main_goal = lead.goal;
    body.areas = lead.areas;
    body.surgery_6mo = lead.surgery6mo;
    body.serious_condition = lead.seriousDiagnosis;
    body.pregnant = lead.pregnant;
    body.postpartum = lead.postpartum;
    body.current_injury = lead.currentInjury;
    body.other_flags = lead.otherFlags;
    body.cleared = lead.cleared;
    body.details = lead.conditionDetails;
  }
  return body;
}

function alertWebhook_(lead, ctx) {
  var urls = [];
  [prop_('ALERT_WEBHOOK_URL'), prop_('GHL_WEBHOOK_URL')].forEach(function (url) {
    if (url && urls.indexOf(url) === -1) urls.push(url);
  });
  if (urls.length === 0) return 'off';
  var payload = JSON.stringify(webhookBody_(lead, ctx));
  var errors = [];
  for (var i = 0; i < urls.length; i++) {
    try {
      if (!/^https:\/\//i.test(urls[i])) throw new Error('A webhook URL must start with https://');
      post_(urls[i], { contentType: 'application/json', payload: payload });
    } catch (err) {
      errors.push(errorText_(err));
    }
  }
  if (errors.length > 0) throw new Error(errors.join(' | '));
  return 'sent';
}

/* ================================== Logging ================================== */

function errorText_(err) {
  if (err === null || err === undefined) return 'Unknown error';
  return String(err && err.message ? err.message : err);
}

/** Remove any token, key, phone number or secret URL from a log line. */
function redact_(text) {
  var out = String(text);
  try {
    var all = PropertiesService.getScriptProperties().getProperties();
    Object.keys(all).forEach(function (key) {
      if (!/TOKEN|SECRET|KEY|SID|URL|TOPIC|USER|CHAT|PHONE|SMS|FROM/i.test(key)) return;
      String(all[key])
        .split(/[,;\s]+/)
        .forEach(function (value) {
          if (value.length >= 6) out = out.split(value).join('[hidden]');
        });
    });
  } catch (err) {
    /* keep the text as it is */
  }
  return out;
}

function getLogSheet_(ss) {
  var sheet = ss.getSheetByName(LOG_SHEET);
  if (sheet) return sheet;
  sheet = ss.insertSheet(LOG_SHEET, ss.getSheets().length);
  sheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Level', 'Where', 'Message']]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

/**
 * Write one line to the Log tab. Never throws. Log lines carry row numbers,
 * channel names and error text only: no names, no contact details, no answers.
 */
function log_(level, where, message) {
  var text = redact_(errorText_(message)).slice(0, 500);
  try {
    console.log('[' + level + '] ' + where + ': ' + text);
  } catch (err) {
    /* ignore */
  }
  try {
    var sheet = getLogSheet_(SpreadsheetApp.getActiveSpreadsheet());
    sheet.appendRow([new Date(), level, where, safeCell_(text)]);
    var extra = sheet.getLastRow() - 1 - LOG_MAX_ROWS;
    if (extra >= 50) sheet.deleteRows(2, extra);
  } catch (err) {
    /* the log must never break a submission */
  }
}

/* ========================= Run these from the editor ========================= */

/**
 * First-time setup. Safe to run again at any time.
 * Creates the Leads and Log tabs, the header row, the Y/N dropdowns and the
 * Status colours, then prints which alert channels are switched on.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getLeadsSheet_(ss);
  var map = ensureHeaders_(sheet);
  formatLeadsSheet_(sheet, map);
  getLogSheet_(ss);
  var report = configReport_();
  Logger.log(report);
  return report;
}

function formatLeadsSheet_(sheet, map) {
  var lastCol = sheet.getLastColumn();
  sheet.getRange(1, 1, 1, lastCol).setFontWeight('bold');
  sheet.setFrozenRows(1);

  var bodyRows = Math.max(sheet.getMaxRows() - 1, 1);
  var columnRange = function (header) {
    var col = columnOf_(map, header);
    return col ? sheet.getRange(2, col, bodyRows, 1) : null;
  };

  // Dropdowns. "Allow invalid" stays on so a hand-typed value shows a small
  // warning instead of being refused, and the script can never be blocked.
  var yesNo = SpreadsheetApp.newDataValidation().requireValueInList(['Y', 'N'], true).setAllowInvalid(true).build();
  [
    'Needs review (Y/N)',
    'Paid? (Y/N)',
    'Testimonial (Y/N)',
    'Surgery last 6 months (Y/N)',
    'Serious condition (Y/N)',
    'Pregnant (Y/N)',
    'Recently postpartum (Y/N)',
    'Current injury (Y/N)',
    'Consent (Y/N)'
  ].forEach(function (header) {
    var range = columnRange(header);
    if (range) range.setDataValidation(yesNo);
  });

  var clearedRange = columnRange('Cleared');
  if (clearedRange) {
    clearedRange.setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(CLEARED_VALUES.concat([CLEARED_UNKNOWN]), true)
        .setAllowInvalid(true)
        .build()
    );
  }

  var statusRange = columnRange('Status');
  if (statusRange) {
    statusRange.setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList([STATUS_QUALIFIED, STATUS_NOT_CLEARED], true)
        .setAllowInvalid(true)
        .build()
    );
  }

  var sessionsRange = columnRange('Sessions used (0-8)');
  if (sessionsRange) {
    sessionsRange.setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireNumberBetween(0, 8)
        .setAllowInvalid(true)
        .setHelpText('Sessions used so far, 0 to 8.')
        .build()
    );
  }

  // Light colours for Status and for "Needs review = Y". Rules this function
  // added on an earlier run are replaced, anything else is kept.
  var reviewRange = columnRange('Needs review (Y/N)');
  var ours = {};
  if (statusRange) ours[statusRange.getA1Notation()] = true;
  if (reviewRange) ours[reviewRange.getA1Notation()] = true;

  var rules = sheet.getConditionalFormatRules().filter(function (rule) {
    var ranges = rule.getRanges();
    return !(ranges.length === 1 && ours[ranges[0].getA1Notation()]);
  });
  var colour = function (range, text, background, font) {
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo(text)
        .setBackground(background)
        .setFontColor(font)
        .setRanges([range])
        .build()
    );
  };
  if (statusRange) {
    colour(statusRange, STATUS_QUALIFIED, '#e3f1e5', '#1e4d2b');
    colour(statusRange, STATUS_NOT_CLEARED, '#fbe9e2', '#7a3b1e');
  }
  if (reviewRange) colour(reviewRange, 'Y', '#fff4d1', '#6b5200');
  sheet.setConditionalFormatRules(rules);

  COLUMNS.forEach(function (column) {
    var col = columnOf_(map, column.header);
    if (col && column.width) sheet.setColumnWidth(col, column.width);
  });
}

/** A plain list of what is switched on. Shows no secret values. */
function configReport_() {
  var on = function (flag) {
    return flag ? 'ON' : 'off';
  };
  var emails = alertRecipients_();
  var smsTo = listProp_('ALERT_SMS_TO').concat(listProp_('ALERT_PHONE'));
  var lines = [
    'Move with Diana intake: setup finished.',
    'Leads tab: ' + leadsSheetName_(),
    'Email alert: ' + (emails.length > 0 ? 'ON, ' + emails.length + ' address(es)' : 'off (add ALERT_EMAILS)'),
    'Emails left today: ' + MailApp.getRemainingDailyQuota(),
    'ntfy push: ' + on(prop_('NTFY_TOPIC')),
    'Twilio text: ' + on(prop_('TWILIO_ACCOUNT_SID') && smsTo.length > 0),
    'Telegram: ' + on(prop_('TELEGRAM_TOKEN') && prop_('TELEGRAM_CHAT_ID')),
    'Pushover: ' + on(prop_('PUSHOVER_TOKEN') && prop_('PUSHOVER_USER')),
    'Webhook: ' + on(prop_('ALERT_WEBHOOK_URL') || prop_('GHL_WEBHOOK_URL')),
    'Text alert detail: ' + textDetail_(),
    'Next: run testSubmit, then Deploy > New deployment.'
  ];
  return lines.join('\n');
}

function samplePayload_() {
  return {
    leadId: 'test_' + new Date().getTime(),
    status: 'QUALIFIED',
    name: 'Test Lead',
    firstName: 'Test',
    email: 'test.lead@example.com',
    phone: '(561) 555-0123',
    surgery6mo: 'N',
    seriousDiagnosis: 'N',
    pregnant: 'N',
    postpartum: 'N',
    currentInjury: 'Y',
    otherFlags: '',
    cleared: 'yes',
    conditionDetails: 'Tight lower back in the mornings.',
    areas: 'back, hips, other: wrists',
    painToday: 6,
    goal: 'This is a test row. Safe to delete.',
    consent: 'yes',
    outcome: 'qualified',
    needsReview: false,
    source: 'test',
    utm_source: 'test',
    utm_medium: 'editor',
    utm_campaign: 'setup-check',
    utm_content: '',
    ref: '',
    referrer: '',
    page: '/apply',
    website: ''
  };
}

/**
 * Sends one pretend application through the real doPost, exactly as the
 * website would. Adds a "Test Lead" row and fires every alert that is set up.
 * Delete the test row afterwards.
 */
function testSubmit() {
  var output = doPost({ postData: { contents: JSON.stringify(samplePayload_()), type: 'text/plain' } });
  var text = output.getContent();
  Logger.log('testSubmit result: ' + text);
  return text;
}

/** Fires the alerts only (no row is written) and prints how each channel did. */
function testAlerts() {
  var lead = normalise_(samplePayload_());
  var rowUrl = '';
  try {
    rowUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  } catch (err) {
    rowUrl = '';
  }
  var lines = sendAlerts_(lead, { rowUrl: rowUrl, row: 0 }).map(function (item) {
    return item.channel + ': ' + item.result + (item.error ? ' (' + item.error + ')' : '');
  });
  var report = lines.join('\n');
  Logger.log(report);
  return report;
}
