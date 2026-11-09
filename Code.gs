/**
 * ============================================================
 *  KHT ATTENDANCE — St. Maria Goretti Chapter
 *  Knights of the Holy Temple
 *
 *  This is the "server" half of the attendance website.
 *  It runs inside Google (not on anyone's phone) and is the
 *  ONLY part that can read or write the Google Sheet.
 *
 *  The web page (Index.html) can only ask this file for
 *  Knights' FIRST and LAST names. Emails, phone numbers and
 *  parent info never leave the spreadsheet.
 * ============================================================
 */


/* ------------------------------------------------------------
 * 1. SETTINGS — the things you might change each school year
 * ------------------------------------------------------------ */
const CONFIG = {
  // The tab the Knights' names are read from.
  // Each new school year, change this to the new roster tab's name.
  ROSTER_SHEET: 'Roster 2026-2027',

  // Which row has the column headings ("Knight's First Name", etc.).
  // In the KHT template, row 1 is the title and row 2 is the headings.
  ROSTER_HEADER_ROW: 2,

  // New tabs this website creates and uses.
  CHECKINS_SHEET: 'Check-ins',
  LEADERBOARD_SHEET: 'Leaderboard',

  // Where you type in the year's meetings, Masses and service events.
  SCHEDULE_SHEET: 'Schedule',

  // Your earlier tracker's tab (imported once in Step 5).
  OLD_LOG_SHEET: 'Activity Log',

  // Points for each kind of event.
  EVENT_POINTS: {
    'Meeting': 1,
    'Mass': 3,
    'Service': 2
  },

  // The month the chapter year starts (6 = June). The leaderboard's
  // "This year" view counts points from the 1st of this month.
  SEASON_START_MONTH: 6,

  // Chapter name shown at the top of the page.
  CHAPTER_NAME: 'St. Maria Goretti Chapter'
};

// Column headings for the Check-ins tab (one row per Knight per event).
const CHECKIN_HEADERS = [
  'Date', 'Event Type', 'Event Name',
  'Knight First Name', 'Knight Last Name',
  'Points', 'Recorded By', 'Timestamp'
];


/* ------------------------------------------------------------
 * 2. SPREADSHEET MENU — adds a "KHT Attendance" menu to the
 *    Google Sheet so you can run setup without touching code.
 * ------------------------------------------------------------ */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('KHT Attendance')
    .addItem('1. Set up tabs', 'menuSetupTabs')
    .addItem('2. Set or change passcode', 'menuSetPasscode')
    .addItem('3. Import old Activity Log (one time)', 'menuImportActivityLog')
    .addToUi();
}

/**
 * Makes sure a function is being run from the spreadsheet menu
 * (by you), and NOT from the public website. If someone tries to
 * call it from the website, getUi() fails and nothing happens.
 */
function requireSheetUi_() {
  return SpreadsheetApp.getUi();
}

/** Menu item 1: creates the Check-ins and Leaderboard tabs if missing. */
function menuSetupTabs() {
  const ui = requireSheetUi_();
  ensureTabs_();
  ui.alert('✅ Done! The "' + CONFIG.CHECKINS_SHEET + '", "' +
           CONFIG.LEADERBOARD_SHEET + '" and "' + CONFIG.SCHEDULE_SHEET + '" tabs are ready.');
}

/**
 * Creates the Check-ins and Leaderboard tabs if they don't exist yet.
 * Safe to run any number of times. Returns the Check-ins tab.
 */
function ensureTabs_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- Check-ins tab ---
  let checkins = ss.getSheetByName(CONFIG.CHECKINS_SHEET);
  if (!checkins) {
    checkins = ss.insertSheet(CONFIG.CHECKINS_SHEET);
    checkins.getRange(1, 1, 1, CHECKIN_HEADERS.length)
      .setValues([CHECKIN_HEADERS])
      .setFontWeight('bold')
      .setBackground('#7a0f12')
      .setFontColor('#f3d27a');
    checkins.setFrozenRows(1);
    checkins.getRange('A:A').setNumberFormat('yyyy-mm-dd');
    checkins.getRange('H:H').setNumberFormat('yyyy-mm-dd h:mm am/pm');
  }

  // --- Leaderboard tab (all formulas — updates itself) ---
  let board = ss.getSheetByName(CONFIG.LEADERBOARD_SHEET);
  if (!board) {
    board = ss.insertSheet(CONFIG.LEADERBOARD_SHEET);
    board.getRange('A1').setFormula(
      "=QUERY('" + CONFIG.CHECKINS_SHEET + "'!A:H," +
      "\"select D, E, sum(F), count(F) where D is not null " +
      "group by D, E order by sum(F) desc " +
      "label D 'First Name', E 'Last Name', sum(F) 'Total Points', count(F) 'Events Attended'\", 1)"
    );
    board.getRange('A1:D1').setFontWeight('bold');
    board.setFrozenRows(1);
  }

  // --- Schedule tab (you fill this in with the year's events) ---
  let schedule = ss.getSheetByName(CONFIG.SCHEDULE_SHEET);
  if (!schedule) {
    schedule = ss.insertSheet(CONFIG.SCHEDULE_SHEET);
    schedule.getRange(1, 1, 1, 3)
      .setValues([['Date', 'Event Type', 'Event Name']])
      .setFontWeight('bold')
      .setBackground('#7a0f12')
      .setFontColor('#f3d27a');
    schedule.setFrozenRows(1);
    schedule.setColumnWidth(1, 120);
    schedule.setColumnWidth(2, 120);
    schedule.setColumnWidth(3, 260);
    // Date column: only real dates, shown like 2026-11-09 (a calendar pops up on double-click).
    schedule.getRange('A2:A').setNumberFormat('yyyy-mm-dd')
      .setDataValidation(SpreadsheetApp.newDataValidation()
        .requireDate().setAllowInvalid(false)
        .setHelpText('Type a date like 2026-11-09, or double-click for a calendar.').build());
    // Event Type column: a dropdown of Meeting / Mass / Service.
    schedule.getRange('B2:B').setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInList(Object.keys(CONFIG.EVENT_POINTS), true).setAllowInvalid(false).build());
    schedule.getRange('A1').setNote(
      'Add one row per event: the date, pick the type, and give it a name ' +
      '(e.g. "November Meeting" or "All Saints Day Mass"). ' +
      'The attendance site shows these as one-tap choices. Order doesn\'t matter.');
  }

  return checkins;
}

/** Menu item 2: asks you for the chapter passcode and stores it privately. */
function menuSetPasscode() {
  const ui = requireSheetUi_();
  const answer = ui.prompt(
    'Chapter passcode',
    'Type the passcode leaders will use to unlock the attendance site ' +
    '(at least 4 characters). Changing it locks every device that was unlocked before.',
    ui.ButtonSet.OK_CANCEL
  );
  if (answer.getSelectedButton() !== ui.Button.OK) return;

  const code = answer.getResponseText().trim();
  if (code.length < 4) {
    ui.alert('That passcode is too short. Please use at least 4 characters.');
    return;
  }
  // Script Properties are private settings only you (the owner) can see.
  // The passcode is NOT stored in this code file or in the spreadsheet.
  PropertiesService.getScriptProperties().setProperties({
    PASSCODE: code,
    SECRET: Utilities.getUuid() // used to make unlock "keys" for devices
  });
  ui.alert('✅ Passcode saved.');
}


/**
 * Menu item 3: copies your earlier tracker's "Activity Log" rows
 * (one row per event, names separated by commas) into Check-ins
 * (one row per Knight). Safe to run again: anything already in
 * Check-ins for the same date + type + Knight is skipped.
 */
function menuImportActivityLog() {
  const ui = requireSheetUi_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const log = ss.getSheetByName(CONFIG.OLD_LOG_SHEET);
  if (!log || log.getLastRow() < 2) {
    ui.alert('There is no "' + CONFIG.OLD_LOG_SHEET + '" tab with data to import.');
    return;
  }
  const go = ui.alert('Import old attendance',
    'This copies every row of "' + CONFIG.OLD_LOG_SHEET + '" into "' + CONFIG.CHECKINS_SHEET +
    '". Your Activity Log tab is not changed. Continue?', ui.ButtonSet.YES_NO);
  if (go !== ui.Button.YES) return;

  const result = importActivityLog_(log.getRange(2, 1, log.getLastRow() - 1, 6).getDisplayValues());

  let text = '✅ Imported ' + result.added + ' check-ins.\n' +
             'Skipped ' + result.duplicates + ' that were already recorded.\n';
  if (result.badRows) {
    text += 'Skipped ' + result.badRows + ' row(s) with no usable date or event type (for example, notes).\n';
  }
  if (result.notOnRoster.length) {
    text += '\nThese names are not on "' + CONFIG.ROSTER_SHEET + '", so they were imported exactly as written. ' +
            'If any are misspellings, fix them in the "' + CONFIG.CHECKINS_SHEET + '" tab ' +
            '(Edit → Find and replace works well):\n• ' + result.notOnRoster.join('\n• ');
  }
  ui.alert('Import finished', text, ui.ButtonSet.OK);
}

/** Capitalizes each word: "beck anthony" → "Beck Anthony". */
function titleCase_(s) {
  return s.toLowerCase().replace(/(^|[\s\-'])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
}

/**
 * Does the actual import. "rows" are Activity Log rows:
 *   [Recorded At, Event Date, Event Type, Points Each, Count, Members Present]
 * Returns { added, duplicates, badRows, notOnRoster: [...] }.
 */
function importActivityLog_(rows) {
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();

  // Roster names, so "james sumski" is saved with the roster's spelling.
  const roster = {};
  readRoster_().forEach(function (k) {
    roster[(k.first + ' ' + k.last).toLowerCase().replace(/\s+/g, ' ')] = k;
  });
  const types = {};
  Object.keys(CONFIG.EVENT_POINTS).forEach(function (t) { types[t.toLowerCase()] = t; });

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = ensureTabs_();
    const already = {};
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 5).getDisplayValues().forEach(function (r) {
        already[r[0] + '|' + String(r[1]).toLowerCase() + '|' + nameKey_(r[3], r[4])] = true;
      });
    }

    const out = [], notOnRoster = {};
    let duplicates = 0, badRows = 0;
    rows.forEach(function (r) {
      if (!String(r[5] || '').trim()) return; // empty row

      // Date: "2026-06-28", or something like "6/28/2026".
      let date = String(r[1]).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const d = new Date(date);
        date = (date && !isNaN(d)) ? Utilities.formatDate(d, tz, 'yyyy-MM-dd') : '';
      }
      const type = types[String(r[2]).trim().toLowerCase()];
      if (!date || !type) { badRows++; return; }
      const points = CONFIG.EVENT_POINTS[type];
      const recordedAt = new Date(r[0]);
      const stamp = isNaN(recordedAt) ? new Date() : recordedAt;

      String(r[5]).split(',').forEach(function (raw) {
        const name = raw.trim().replace(/\s+/g, ' ');
        if (!name) return;
        const lower = name.toLowerCase();
        let first, last;
        // 1) exact roster match, 2) roster match with the two names swapped
        const words = lower.split(' ');
        const swapped = words.length === 2 ? words[1] + ' ' + words[0] : '';
        const match = roster[lower] || (swapped && roster[swapped]);
        if (match) {
          first = match.first; last = match.last;
        } else {
          // Not on the roster: first word = first name, the rest = last name.
          const parts = titleCase_(name).split(' ');
          first = parts.shift();
          last = parts.join(' ');
          notOnRoster[first + ' ' + last] = true;
        }
        const id = date + '|' + type.toLowerCase() + '|' + nameKey_(first, last);
        if (already[id]) { duplicates++; return; }
        already[id] = true;
        out.push([date, type, '', safeText_(first, 60), safeText_(last, 60), points,
                  'Imported from ' + CONFIG.OLD_LOG_SHEET, stamp]);
      });
    });

    if (out.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, out.length, CHECKIN_HEADERS.length).setValues(out);
      SpreadsheetApp.flush();
    }
    return { added: out.length, duplicates: duplicates, badRows: badRows,
             notOnRoster: Object.keys(notOnRoster).sort() };
  } finally {
    lock.releaseLock();
  }
}


/* ------------------------------------------------------------
 * 3. ACCESS CONTROL — the passcode and device "keys"
 *
 *    When a leader types the right passcode on a device, that
 *    device gets a key and stays unlocked. Every request from
 *    the website must include a valid key, or it is refused.
 * ------------------------------------------------------------ */

/** Builds the key that goes with the current passcode. */
function makeKey_() {
  const props = PropertiesService.getScriptProperties();
  const code = props.getProperty('PASSCODE');
  const secret = props.getProperty('SECRET');
  if (!code || !secret) return null;
  const bytes = Utilities.computeHmacSha256Signature(code, secret);
  return Utilities.base64EncodeWebSafe(bytes);
}

/** Stops the request if the key is missing or wrong. */
function requireKey_(key) {
  const good = makeKey_();
  if (!good) throw new Error('The passcode has not been set up yet. Ask your leader to run "Set or change passcode" from the spreadsheet menu.');
  if (key !== good) throw new Error('LOCKED');
}

/**
 * Called by the web page when someone types the passcode.
 * After 10 wrong tries, it waits 10 minutes before allowing more.
 */
function apiUnlock(passcode) {
  const cache = CacheService.getScriptCache();
  const tries = Number(cache.get('badTries') || 0);
  if (tries >= 10) {
    throw new Error('Too many wrong tries. Please wait 10 minutes and try again.');
  }
  const code = PropertiesService.getScriptProperties().getProperty('PASSCODE');
  if (!code) {
    throw new Error('The passcode has not been set up yet. Run "Set or change passcode" from the spreadsheet menu.');
  }
  if (String(passcode || '').trim() !== code) {
    cache.put('badTries', String(tries + 1), 600);
    throw new Error('That passcode is not right. Please try again.');
  }
  return { key: makeKey_() };
}

/**
 * Lets the page check whether its saved key still works, and
 * tells it the event types, points, and today's date.
 */
function apiCheckKey(key) {
  requireKey_(key);
  return {
    ok: true,
    chapter: CONFIG.CHAPTER_NAME,
    eventPoints: CONFIG.EVENT_POINTS,
    today: todayString_()
  };
}

/** Today's date like "2026-11-09", in the spreadsheet's time zone. */
function todayString_() {
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  return Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
}


/* ------------------------------------------------------------
 * 3b. SCHEDULE — the meetings/Masses you typed into the
 *     Schedule tab, offered as one-tap choices on the site.
 * ------------------------------------------------------------ */

/**
 * Returns [{ date: '2026-11-09', type: 'Meeting', name: 'November Meeting' }, ...]
 * sorted by date. Rows missing a date or a valid type are ignored.
 */
function apiGetSchedule(key) {
  requireKey_(key);
  ensureTabs_(); // creates the Schedule tab if it's missing
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SCHEDULE_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const tz = ss.getSpreadsheetTimeZone();
  // Match types without caring about capitals ("mass" → "Mass").
  const types = {};
  Object.keys(CONFIG.EVENT_POINTS).forEach(function (t) { types[t.toLowerCase()] = t; });

  const events = [];
  sheet.getRange(2, 1, lastRow - 1, 3).getValues().forEach(function (row) {
    let date = row[0];
    if (date instanceof Date) {
      date = Utilities.formatDate(date, tz, 'yyyy-MM-dd');
    } else {
      date = String(date).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return; // not a usable date
    }
    const type = types[String(row[1]).trim().toLowerCase()];
    if (!type) return;
    const name = String(row[2]).trim() || type;
    events.push({ date: date, type: type, name: name.slice(0, 100) });
  });
  events.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  return events;
}


/* ------------------------------------------------------------
 * 4. ROSTER — reads ONLY first and last names from the roster
 * ------------------------------------------------------------ */

/** A simple "same person" label: "john|smith" (ignores capitals and spaces). */
function nameKey_(first, last) {
  return String(first).trim().toLowerCase() + '|' + String(last).trim().toLowerCase();
}

/**
 * Reads the roster tab and returns a list like
 * [{ first: 'John', last: 'Smith' }, ...] sorted by last name.
 * It finds the name columns by their headings, so moving
 * columns around won't break it.
 */
function readRoster_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.ROSTER_SHEET);
  if (!sheet) {
    throw new Error('Can\'t find the roster tab named "' + CONFIG.ROSTER_SHEET +
                    '". Check the ROSTER_SHEET setting at the top of Code.gs.');
  }
  const values = sheet.getDataRange().getDisplayValues();
  const headers = (values[CONFIG.ROSTER_HEADER_ROW - 1] || [])
    .map(function (h) { return String(h).toLowerCase(); });

  // Find "Knight's First Name" / "Knight's Last Name" (not the parent column).
  const firstCol = headers.findIndex(function (h) {
    return h.indexOf('first name') !== -1 && h.indexOf('parent') === -1;
  });
  const lastCol = headers.findIndex(function (h) {
    return h.indexOf('last name') !== -1 && h.indexOf('parent') === -1 && h.indexOf('first') === -1;
  });
  if (firstCol === -1 || lastCol === -1) {
    throw new Error('Can\'t find the "First Name" and "Last Name" columns in row ' +
                    CONFIG.ROSTER_HEADER_ROW + ' of "' + CONFIG.ROSTER_SHEET + '".');
  }

  const seen = {};
  const knights = [];
  for (let r = CONFIG.ROSTER_HEADER_ROW; r < values.length; r++) {
    const first = String(values[r][firstCol]).trim();
    const last = String(values[r][lastCol]).trim();
    if (!first && !last) continue;           // skip blank rows
    const k = nameKey_(first, last);
    if (seen[k]) continue;                    // skip accidental duplicates
    seen[k] = true;
    knights.push({ first: first, last: last });
  }
  knights.sort(function (a, b) {
    return (a.last + ' ' + a.first).localeCompare(b.last + ' ' + b.first);
  });
  return knights;
}

/** Called by the page to get the list of Knights (names only). */
function apiGetRoster(key) {
  requireKey_(key);
  return readRoster_();
}


/* ------------------------------------------------------------
 * 5. SAVING ATTENDANCE — writes to the Check-ins tab
 * ------------------------------------------------------------ */

/** Stops spreadsheet "formulas" being typed in as names (a safety step). */
function safeText_(text, maxLength) {
  let t = String(text || '').trim().slice(0, maxLength);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

/**
 * Saves everyone marked present, all at once.
 *   ev = { date: '2026-11-09', type: 'Meeting', name: 'optional',
 *          recordedBy: 'optional', knights: [{first, last}, ...] }
 * If a Knight is already recorded for the same date AND event type,
 * they are skipped (never counted twice).
 * Returns { added: [...names], skipped: [...names], points: 1 }.
 */
function saveCheckins_(ev) {
  // --- Check the details make sense ---
  const type = String(ev.type || '');
  const points = CONFIG.EVENT_POINTS[type];
  if (points === undefined) throw new Error('Please pick an event type.');
  const date = String(ev.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Please pick a valid date.');
  const knights = Array.isArray(ev.knights) ? ev.knights : [];
  if (knights.length === 0) throw new Error('No Knights are marked present yet.');

  const eventName = safeText_(ev.name, 100);
  const recordedBy = safeText_(ev.recordedBy, 60) || 'Leader';

  // Only accept names that are really on the roster.
  const roster = {};
  readRoster_().forEach(function (k) { roster[nameKey_(k.first, k.last)] = k; });

  // Only one save at a time, so two devices can't create duplicates.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = ensureTabs_();

    // Everyone already recorded, as "date|type|first|last".
    const already = {};
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 5).getDisplayValues().forEach(function (row) {
        already[row[0] + '|' + String(row[1]).toLowerCase() + '|' + nameKey_(row[3], row[4])] = true;
      });
    }

    const now = new Date();
    const rows = [], added = [], skipped = [];
    knights.forEach(function (k) {
      const person = roster[nameKey_(k.first, k.last)];
      if (!person) return; // not on the roster — ignore
      const fullName = person.first + ' ' + person.last;
      const id = date + '|' + type.toLowerCase() + '|' + nameKey_(person.first, person.last);
      if (already[id]) { skipped.push(fullName); return; }
      already[id] = true;
      rows.push([date, type, eventName, safeText_(person.first, 60), safeText_(person.last, 60),
                 points, recordedBy, now]);
      added.push(fullName);
    });

    if (rows.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, CHECKIN_HEADERS.length).setValues(rows);
      SpreadsheetApp.flush();
    }
    return { added: added, skipped: skipped, points: points };
  } finally {
    lock.releaseLock();
  }
}

/** Called by the Leader check-in screen's Submit button. */
function apiSubmitAttendance(key, ev) {
  requireKey_(key);
  return saveCheckins_(ev);
}

/**
 * Called when a teen taps their own name on the self check-in screen.
 *   ev = { date, type, name }   knight = { first, last }
 * Returns { added: [...], skipped: [...], points }.
 */
function apiSelfCheckIn(key, ev, knight) {
  requireKey_(key);
  return saveCheckins_({
    date: ev.date, type: ev.type, name: ev.name,
    recordedBy: 'Self check-in',
    knights: [knight]
  });
}

/**
 * Who is already checked in for this date + event type.
 * Returns names like ["John Smith", ...] so the screens can show
 * them as "already checked in".
 */
function apiGetCheckedIn(key, date, type) {
  requireKey_(key);
  const sheet = ensureTabs_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const t = String(type).toLowerCase();
  const names = [];
  sheet.getRange(2, 1, lastRow - 1, 5).getDisplayValues().forEach(function (row) {
    if (row[0] === date && String(row[1]).toLowerCase() === t) {
      names.push(String(row[3]).trim() + ' ' + String(row[4]).trim());
    }
  });
  return names;
}


/* ------------------------------------------------------------
 * 5b. LEADERBOARD & HISTORY — totals worked out from Check-ins
 * ------------------------------------------------------------ */

/** Reads every Check-ins row as { date, type, name, first, last, points }. */
function readCheckins_() {
  const sheet = ensureTabs_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, 6).getDisplayValues()
    .filter(function (r) { return r[3] || r[4]; })
    .map(function (r) {
      return {
        date: r[0], type: r[1], name: r[2],
        first: String(r[3]).trim(), last: String(r[4]).trim(),
        points: Number(r[5]) || 0
      };
    });
}

/** The first day of the current chapter year, like "2026-06-01". */
function seasonStart_() {
  const today = todayString_();
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const startYear = month >= CONFIG.SEASON_START_MONTH ? year : year - 1;
  return startYear + '-' + ('0' + CONFIG.SEASON_START_MONTH).slice(-2) + '-01';
}

/**
 * Total points per Knight, highest first.
 *   range = 'season' (this chapter year) or 'all' (all time)
 * Everyone on the current roster is listed, even with 0 points.
 */
function apiGetLeaderboard(key, range) {
  requireKey_(key);
  const since = range === 'all' ? '' : seasonStart_();
  const totals = {};
  function entry(first, last) {
    const k = nameKey_(first, last);
    if (!totals[k]) totals[k] = { first: first, last: last, points: 0, events: 0, byType: {} };
    return totals[k];
  }
  readRoster_().forEach(function (k) { entry(k.first, k.last); });
  readCheckins_().forEach(function (c) {
    if (since && c.date < since) return;
    const t = entry(c.first, c.last);
    t.points += c.points;
    t.events += 1;
    t.byType[c.type] = (t.byType[c.type] || 0) + 1;
  });
  const list = Object.keys(totals).map(function (k) { return totals[k]; });
  list.sort(function (a, b) {
    return b.points - a.points || (a.last + a.first).localeCompare(b.last + b.first);
  });
  return { since: since, list: list };
}

/** One Knight's check-ins, newest first, with their totals. */
function apiGetHistory(key, first, last) {
  requireKey_(key);
  const k = nameKey_(first, last);
  const rows = readCheckins_().filter(function (c) { return nameKey_(c.first, c.last) === k; });
  rows.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  const since = seasonStart_();
  let all = 0, season = 0;
  rows.forEach(function (c) { all += c.points; if (c.date >= since) season += c.points; });
  return {
    first: first, last: last, since: since,
    seasonPoints: season, allPoints: all,
    rows: rows.map(function (c) { return { date: c.date, type: c.type, name: c.name, points: c.points }; })
  };
}


/* ------------------------------------------------------------
 * 6. WEB PAGE — sends the page to whoever opens the link
 * ------------------------------------------------------------ */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('KHT Attendance')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setFaviconUrl('https://fonts.gstatic.com/s/e/notoemoji/latest/2694_fe0f/72.png');
}
