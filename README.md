# KHT Attendance — St. Maria Goretti Chapter

An attendance website for Knights of the Holy Temple meetings, Masses, and service events.
It saves to the chapter Google Sheet. Free, no servers, no paid services.

*Worship God · Love the Brotherhood · Serve the Church*

## What's in this folder

| File | What it is |
|---|---|
| `Code.gs` | The "server" half. It runs inside Google and is the only part that touches the spreadsheet. |
| `Index.html` | The web page people see and tap. |
| `README.md` | These instructions. |

This folder is the **backup copy**. The live code is pasted into the spreadsheet's Apps Script editor.
After any change, paste the updated file into Apps Script **and** commit it here.

---

## Step 1 — Put the code into your Google Sheet

### A. Open the script editor
1. Open the chapter spreadsheet (**2025-2026 attendance + roster**).
2. In the top menu click **Extensions → Apps Script**. A new tab opens.

> ⚠️ **If there's already code there** (from your earlier tracker), back it up first:
> click inside the code, press **Cmd+A** then **Cmd+C**. In VS Code, create a new file named
> `old-tracker-backup.txt` in this folder and paste it there with **Cmd+V**. Save it.
> If the editor lists other files (besides `Code.gs`), do the same for each one, then delete
> them in Apps Script (click **⋮** next to the file name → **Delete**).
> The old tracker will stop working, which is expected. Its history gets imported in Step 5.

### B. Paste `Code.gs`
1. In Apps Script, click **Code.gs** on the left.
2. Click in the code area, press **Cmd+A**, then **Delete**.
3. In VS Code, open `Code.gs`, press **Cmd+A**, then **Cmd+C**.
4. Back in Apps Script, press **Cmd+V**.

### C. Add the web page file
1. In Apps Script, click the **+** next to **Files** and choose **HTML**.
2. Name it exactly **`Index`** (capital I, no `.html`, Google adds that). Press Enter.
3. Delete the starter code in it (**Cmd+A**, **Delete**).
4. In VS Code, copy all of `Index.html` and paste it in.
5. Press **Cmd+S** to save. The little orange dot by the file names should disappear.

### D. Set the time zone
1. Click the **⚙️ gear (Project Settings)** on the far left.
2. Under **Time zone**, choose your local time zone.

### E. Create the tabs and passcode
1. Go back to the spreadsheet tab and **reload the page**. After a few seconds a new
   **KHT Attendance** menu appears at the top (to the right of **Help**).
2. Click **KHT Attendance → 1. Set up tabs**.
3. Google will ask for permission the first time. This is normal for your own scripts:
   - Click **Continue** and choose your Google account.
   - If you see **"Google hasn't verified this app"**, click **Advanced**, then
     **Go to (your project name) (unsafe)**. It's "unsafe" only because Google hasn't reviewed
     a script you wrote yourself.
   - Click **Allow** (or **Select all** then **Continue**).
4. Click **KHT Attendance → 1. Set up tabs** again. You should see **"✅ Done!"** and two new
   tabs: **Check-ins** and **Leaderboard**.
5. Click **KHT Attendance → 2. Set or change passcode**, type a chapter passcode, and click **OK**.
   Don't use a password you use anywhere else.

### F. Test it
1. In Apps Script, click **Deploy → Test deployments** (top right).
2. Copy the **Web app** URL (ends in `/dev`) and open it in a new tab.
3. ✅ You should see the dark red and gold page with the motto and a **Leader unlock** box.
4. Type a **wrong** passcode → you should see a red "not right" message.
5. Type the **right** passcode → you should see a green "Unlocked!" message and the menu buttons
   (greyed out for now; they get turned on in later steps).
6. Reload the page → it should go straight to the menu (it remembers this device).
7. Tap **Lock this device** → it should go back to the unlock box.

> The `/dev` test link only works for you while you're signed in. The real link for the
> meeting computer comes in Step 5.

### G. Save a backup to GitHub
1. In VS Code, click the **Source Control** icon (the branching-lines icon on the left).
2. Type a message like `Step 1: foundation` in the box.
3. Click **Commit** (if it asks to stage all changes, click **Yes**), then **Sync Changes**.

---

## Step 2 — Leader check-in

### A. Update the code in Apps Script
1. Open the spreadsheet → **Extensions → Apps Script**.
2. Click **Code.gs**, press **Cmd+A**, **Delete**, then paste the new `Code.gs` from VS Code.
3. Click **Index.html**, press **Cmd+A**, **Delete**, then paste the new `Index.html` from VS Code.
4. Press **Cmd+S**.

### B. Test it
1. **Deploy → Test deployments** → open the Web app link (or reload it if it's already open).
2. Tap **🛡️ Leader check-in**.
3. Check the date shows today. Tap **Meeting**, type an event name like `TEST`, and type your name.
4. Tap **Next: take attendance**. ✅ You should see every Knight from **Roster 2026-2027**.
5. Type a few letters in the search box → the list should narrow. Try **Mark all present** and
   **Clear all**.
6. Tap **2 Knights**, then **Submit attendance** → **OK**.
   ✅ A green "Saved! 2 Knight(s) got 1 point" message appears.
7. Open the spreadsheet's **Check-ins** tab → ✅ two new rows. The **Leaderboard** tab shows them too.
8. **Duplicate test:** tap the **same 2 Knights** plus one more, and submit again.
   ✅ It should say 1 saved and list the other 2 as "already recorded… skipped".
9. **Clean up:** in the **Check-ins** tab, select the test rows (click the row numbers on the left),
   right-click → **Delete rows**.

### C. Save a backup to GitHub
Source Control → message `Step 2: leader check-in` → **Commit** → **Sync Changes**.

---

## Step 2b — The event schedule

Type the year's meetings, Masses and service events into a **Schedule** tab once. The leader
screen then shows **today's event as a big button** (picked for you automatically) and has a
dropdown of every other scheduled event, so nobody has to type event names at a meeting.

### A. Update the code
Same as before: replace **Code.gs** and **Index.html** in Apps Script with the new versions,
then press **Cmd+S**.

### B. Create the Schedule tab
1. In the spreadsheet, click **KHT Attendance → 1. Set up tabs** (it only adds what's missing).
2. Open the new **Schedule** tab and add one row per event:

   | Date | Event Type | Event Name |
   |---|---|---|
   | 2026-11-09 | Meeting | November Meeting |
   | 2026-11-01 | Mass | All Saints Day Mass |

   - **Date:** type it like `2026-11-09`, or double-click the cell for a calendar.
   - **Event Type:** click the cell and pick from the dropdown (Meeting, Mass, Service).
   - **Event Name:** anything you like. If you leave it blank, the type is used as the name.
   - Rows can be in any order. You can add, change or delete rows any time, and the site picks
     up the changes the next time someone opens Leader check-in.

### C. Test it
1. Add a test row with **today's date**. Open the test link → **Leader check-in**.
   ✅ Today's event appears as a highlighted button, and the date, type and name are already filled in.
2. Open the **Another scheduled event** dropdown → ✅ your other events are listed under
   **Upcoming** and **Past**. Picking one fills in its date, type and name.
3. You can still type an event by hand below "— or type it in yourself —" for anything unscheduled.

### D. Save a backup to GitHub
Source Control → message `Add event schedule` → **Commit** → **Sync Changes**.

---

## Step 3 — Teen self check-in

Set up the meeting computer so teens walk up, find their name, and tap it. Leaders can still
check people in from their own phones at the same time. Nobody gets counted twice.

### A. Update the code
Replace **Code.gs** and **Index.html** in Apps Script with the new versions, then press **Cmd+S**.

### B. Test it
1. Open the test link → tap **✋ Teen self check-in**.
2. The event setup screen appears (today's scheduled event is already picked) → tap
   **Start teen self check-in**.
3. ✅ You see "Tap your name to check in", a search box, and every Knight.
4. Type part of a name → tap it → ✅ "Are you …?" → **Yes, check me in** →
   ✅ "You're checked in, (name)!" The screen clears itself after 4 seconds.
5. That name now shows dimmed with **"Already checked in"** and can't be tapped again.
6. Open **Leader check-in** on your phone for the same event → ✅ that Knight shows as
   "Already checked in" there too.
7. Tap **🔒 Leader: exit self check-in** at the bottom → type a wrong passcode → ✅ refused.
   Type the right passcode → ✅ back to the menu.
8. Delete the test rows from the **Check-ins** tab.

### C. Tip for the meeting computer
Put the browser in full screen (Chrome: **View → Enter Full Screen**, or **Cmd+Ctrl+F**) so
teens only see the check-in page.

### D. Save a backup to GitHub
Source Control → message `Step 3: teen self check-in` → **Commit** → **Sync Changes**.

---

## Step 4 — Leaderboard and history

### A. Update the code
Replace **Code.gs** and **Index.html** in Apps Script with the new versions, then press **Cmd+S**.

### B. Test it
1. Make sure there are a few test check-ins (use Leader check-in with 2–3 Knights for a Meeting,
   then again for a Mass).
2. Open the test link → tap **🏆 Leaderboard**.
   ✅ Knights are sorted by points, highest first, with 🥇🥈🥉 for the top three. Ties share a place.
   Everyone on the roster appears, even with 0 points.
3. Tap **All time** / **This year** → the totals switch. "This year" counts from June 1
   (change `SEASON_START_MONTH` at the top of `Code.gs` if your chapter year starts another month).
4. Type in **Find a Knight** → the list narrows.
5. Tap a Knight → ✅ their points this year, points all time, events attended, and every event
   they attended, newest first.
6. Delete the test rows from the **Check-ins** tab.

> The **Leaderboard** tab inside the spreadsheet also shows all-time totals, for when you're
> looking at the sheet directly.

### C. Save a backup to GitHub
Source Control → message `Step 4: leaderboard and history` → **Commit** → **Sync Changes**.

---

## Step 5 — Import history, go live, add to phones

### A. Update the code
Replace **Code.gs** in Apps Script with the new version, then press **Cmd+S**.
(`Index.html` didn't change in this step.)

### B. Import your old Activity Log (one time)
1. Reload the spreadsheet. Click **KHT Attendance → 3. Import old Activity Log (one time)** → **Yes**.
2. A summary pops up:
   - how many check-ins were imported
   - how many were skipped as duplicates
   - rows that had no date (like the note "Antony beck is here…"). Those aren't imported, so add
     those Knights by hand with Leader check-in if they should get points.
   - **names that aren't on the roster.** These are usually misspellings (like "Eli Sweeny") or
     adults/alumni not on this year's roster.
3. Fix misspellings in the **Check-ins** tab: **Edit → Find and replace**, e.g. find `Sweeny`,
   replace with `Sweeney`, **Replace all**.
   ⚠️ If a fix makes two identical rows for the same date and event (the 9/27 meeting lists Eli
   both ways), delete one of them.
4. Running the import again is safe. It skips anything already there.

### C. Deploy for real (get the link)
1. In Apps Script click **Deploy → New deployment**.
2. Click the **⚙️ gear** next to "Select type" → **Web app**.
3. Fill in:
   - **Description:** `KHT Attendance`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**
4. Click **Deploy** (approve permissions again if asked) and **copy the Web app URL** (ends in `/exec`).
   That's your link. Save it somewhere safe, like a note on your phone.

> **Is "Anyone" safe?** Yes. Anyone with the link can only see the **unlock screen**. Nothing
> loads without the chapter passcode, and the site never sends emails, phone numbers or parent
> info, even after unlocking. People don't need a Google account.
>
> Google shows a small grey banner at the top: "This application was created by a Google Apps
> Script user". That's normal and can't be removed on free accounts.

### D. ⚠️ Every time you change the code later
Pasting new code into Apps Script does **not** update the live link by itself. You must also:
**Deploy → Manage deployments → ✏️ (pencil) → Version: New version → Deploy.**
Do it this way, *not* "New deployment", so the link stays the same.

### E. Set up the meeting computer
1. Open the `/exec` link in Chrome → type the passcode → **Unlock**.
2. Bookmark it (**Cmd+D**), or install it like an app: Chrome **⋮ → Cast, save and share →
   Install page as app** (or **Create shortcut**).
3. At meetings: **✋ Teen self check-in** → **Start** → go full screen with **Cmd+Ctrl+F**.

> The unlock is remembered per browser. A private/incognito window, a different browser, or
> clearing browsing data will ask for the passcode again.

### F. Add it to your phone's home screen
**iPhone (Safari):**
1. Open the `/exec` link in **Safari**.
2. Tap the **Share** button (square with an up-arrow) → scroll down → **Add to Home Screen** → **Add**.
3. Open it from the new icon and unlock with the passcode once.

**Android (Chrome):**
1. Open the link in **Chrome**.
2. Tap **⋮** (top right) → **Add to Home screen** → **Add**.
3. Open it from the icon and unlock once.

### G. Save a backup to GitHub
Source Control → message `Step 5: import and deploy` → **Commit** → **Sync Changes**.

---

## 📋 Cheat sheet: using it at a meeting

**Before the meeting (once a year):** put the year's events in the **Schedule** tab.

**Teens checking themselves in (meeting computer):**
1. Open the site → **✋ Teen self check-in**.
2. Today's event is already picked → **Start teen self check-in**.
3. Teens type their name → tap it → **Yes, check me in**. Done.
4. When finished: **🔒 Leader: exit self check-in** → passcode.

**Leader checking people in (your phone):**
1. Open the site → **🛡️ Leader check-in** → today's event is picked → **Next**.
2. Tap everyone present (anyone who self-checked-in is already greyed out).
3. **Submit attendance** → **OK** → green "Saved!" message.

**Good to know:**
- Nobody can be counted twice for the same date and event type. It's safe to tap someone again.
- If something isn't on the schedule, type the event in by hand under "or type it in yourself".
- Forgot someone after the meeting? Open Leader check-in, pick that event from the
  **Another scheduled event** dropdown, tap them, and Submit.
- A red ❌ message means nothing was saved. Your taps stay put, so just try Submit again.
- To fix a mistake, delete or edit the row in the **Check-ins** tab of the spreadsheet.
- **🏆 Leaderboard** shows points. Tap a name for their history.

---

## 🗓️ Things to change each school year

1. **New roster:** add a tab for the new year's roster (same columns as the KHT template,
   with headings in row 2). Then in `Code.gs` change
   `ROSTER_SHEET: 'Roster 2026-2027'` to the new tab's exact name.
2. **New schedule:** add the new year's meetings, Masses and service events to the **Schedule**
   tab. You can delete last year's rows or leave them.
3. **Chapter year start:** if it doesn't start in June, change `SEASON_START_MONTH`
   (6 = June, 8 = August, …).
4. **Points:** to change what events are worth, edit `EVENT_POINTS` in `Code.gs`.
   Rows already saved keep their old points.
5. **Passcode:** if officers changed, use **KHT Attendance → 2. Set or change passcode**.
   This locks every device, so unlock them again.
6. **After any change to `Code.gs`:** paste it into Apps Script, **Cmd+S**, then
   **Deploy → Manage deployments → ✏️ → New version → Deploy** (Step 5D), and commit in VS Code.
7. **Keep the Check-ins tab.** It's the full history, and "All time" on the leaderboard reads it.
