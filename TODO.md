# Plotline Project Roadmap & TODO List

This document outlines suggested improvements, bug fixes, and feature implementations for the Plotline Google Docs Editor Add-on. 

---

## 1. Critical Bug Fixes & Stability

### 🛑 Fix Properties Size Limit (9KB Limit) & Refactor Cache Handling
* **Problem:** In [Data.js](file:///home/lucasrangit/projects/plotline/src/Data.js#L153-L243), the revisions cache is serialized as a single JSON object under the key `ALL_REVISIONS_CACHE` inside the `PropertiesService` Document Properties. Apps Script imposes a strict **9KB (9000 bytes)** limit on any single property value. For documents with many revisions, this string will exceed 9KB, resulting in a fatal `Argument too large` error and preventing the add-on from loading.
* **Refactoring & Migration Plan:**
  We will unify the cache by standardizing on individual keys: `REV_WC_<revisionId>`.
  1. **New Cache Format:** Save each entry as a compact comma-separated string `modifiedTime,wordCount` (e.g., `2026-07-08T08:08:48.000Z,12345`).
  2. **Backward Compatibility / Legacy Support:** If a key `REV_WC_<revisionId>` contains only a number (the legacy format), dynamically pair it with the revision's `modifiedTime` from the Drive API list, and write it back to update the cache.
  3. **Cleanup:** Delete the obsolete `ALL_REVISIONS_CACHE` key entirely to reclaim space.

* **Simplified `fetchRevisionWordCounts()` Execution Flow:**
  1. **Load Cache Once:** Fetch all document properties in a single batch call:
     ```javascript
     const cachedProperties = PropertiesService.getDocumentProperties().getProperties();
     ```
  2. **Filter Revisions First (Day Resolution):** Before doing any cache checking or fetching, group the raw revisions list by local timezone day, keeping only the *latest* revision for each day.
  3. **Check and Populate:** Iterate through the filtered list of daily revisions:
     * Check the `cachedProperties` object for `REV_WC_<revisionId>` once.
     * **If present:** Parse the value. If it is in the legacy format (only word count), reconstruct the date using the current revision, and update the store with the new format `date,wordCount`.
     * **If absent:** Call `fetchWordCountForRevision(docId, revId)` to retrieve the plain text, calculate the word count, and write the new `modifiedTime,wordCount` format to the property store.


### 🔑 Align OAuth Scopes
* **Problem:** In [submission.md](file:///home/lucasrangit/projects/plotline/submission.md#L9-L13), the documentation mentions `https://www.googleapis.com/auth/drive.readonly` as one of the required scopes. However, the manifest in [appsscript.json](file:///home/lucasrangit/projects/plotline/src/appsscript.json#L14-L19) requests `https://www.googleapis.com/auth/drive.file`.
* **Why it matters:** Google Workspace Marketplace verification requires scopes to match exactly across the GCP Consent Screen, Workspace Marketplace SDK configuration, and `appsscript.json`. Furthermore, `drive.readonly` is a restricted scope requiring full security review, whereas `drive.file` is a sensitive scope and much easier to get approved.
* **Solution:** Align all files and settings to use `https://www.googleapis.com/auth/drive.file`. Google Picker (used in `PickerModal.html`) correctly grants access to the current file under the `drive.file` scope, meaning `drive.readonly` is not required.

---

## 2. Visual & UX Enhancements (Aesthetics)

### 🎨 Modern Sidebar Redesign
* **Problem:** The current UI uses Google's legacy [add-ons1.css](https://ssl.gstatic.com/docs/script/css/add-ons1.css) stylesheet, resulting in a dated look that does not match modern design systems.
* **Solution:** Remove the legacy Google stylesheet and design a custom, high-fidelity UI matching Material Design 3 guidelines:
  * **Typography:** Load and use modern fonts such as *Inter* or *Outfit* via Google Fonts.
  * **Color Palette:** Implement a cohesive, premium color theme using CSS custom properties (variables) for dark and light modes.
  * **Layout:** Use rounded card containers (`border-radius: 12px`), glassmorphism effects, and subtle shadow overlays (`box-shadow`) to structure sections (Outline, Timeline, Trends).

### 📈 Elegant Interactive Charts
* **Problem:** The timeline chart in [Sidebar.html](file:///home/lucasrangit/projects/plotline/src/Sidebar.html#L309-L375) is currently a basic line chart with sharp angles and standard styling.
* **Solution:** Polish the Chart.js visual settings:
  * **Curve Styling:** Set `tension: 0.4` for smooth bezier curves instead of rigid straight lines.
  * **Fading Gradients:** Configure a linear background gradient under the curve that fades from semi-transparent blue to transparent.
  * **Custom Tooltips:** Build clean, modern CSS-styled HTML tooltips that display when hovering over nodes.
  * **Incremental View Toggle:** Provide a toggle between the cumulative word count line chart and an incremental daily word count bar chart (showing exactly how many words were written each day).

### 🔥 Gamification & Streaks
* **Feature:** Add features to build habits and keep writers motivated.
  * **Streaks Counter:** Track how many consecutive days the user has written (increased document word count). Display a streak badge (e.g., "🔥 5-day writing streak") in the sidebar.
  * **Activity Heatmap:** Display a GitHub-style calendar contribution grid visualizing the word count written each day (deeper colors indicating higher counts).

### 🎉 Goal Completion Rewards
* **Feature:** Add celebratory micro-animations when a user meets their word count target.
  * **Implementation:** Integrate a lightweight client-side library (like `canvas-confetti`) to trigger a confetti explosion inside the sidebar once the goal progress bar hits 100%.

---

## 3. Algorithmic & Analytics Improvements

### 🌐 Local Timezone Handling
* **Problem:** In [Data.js](file:///home/lucasrangit/projects/plotline/src/Data.js#L189), the server-side code limits revisions to one per day using `new Date(rev.modifiedTime).toDateString()`. This uses the server/script timezone (set to `Europe/Berlin` in `appsscript.json`). For a user writing in another timezone (e.g., Eastern Time), their writing sessions will be grouped into the wrong calendar days.
* **Solution:** Pass the user's browser timezone offset or timezone identifier (e.g., `Intl.DateTimeFormat().resolvedOptions().timeZone`) from the client to the server during the `fetchRevisionWordCounts` call, and adjust date boundary evaluations accordingly.

### ⏱️ Rolling Window Trends
* **Problem:** The average daily, weekly, and monthly writing trends are calculated by dividing the total net words written by the total days since the *first* document revision. If a document is weeks or months old but has long periods of inactivity, the average drops to near zero, causing the Goal ETA projection to become completely incorrect.
* **Solution:** Calculate the average writing pace based on a rolling window of active days (e.g., last 7 days or last 14 days) or count only the days on which the word count actually increased.

### ✍️ Heading Title Word Counts
* **Problem:** In [getHeadingWordCounts()](file:///home/lucasrangit/projects/plotline/src/Data.js#L41-L104), paragraph headings (e.g., `Heading 1: Chapter 1`) are excluded from the word counts of their respective sections, and only the normal body paragraphs are counted. This leads to a minor mismatch between the sum of the sections and the actual total document word count.
* **Solution:** Provide a toggle switch in the sidebar to include or exclude heading text in the individual chapter counts, or clearly state the exclusion in the UI.

---

## 4. New Features

### 🗂️ Limit Extension to First/Main Tab & Add Warning
* **Background:** Google Docs recently introduced document Tabs. To prevent notes, research, and deleted words in other tabs from counting toward writing goals, the extension should by design only operate on the main/first tab.
* **Implementation Tasks:**
  * **Restrict to First Tab:** Ensure all operations (word count tracking, outline generation, history tracking) explicitly target only the first/main tab (e.g. using `getTabs()[0]`).
  * **Active Tab Warning:** If the user switches to a different tab, display a clear warning/info message in the sidebar stating that the extension only runs on the main/first tab.
  * **Explain Design Choice in UI:** Add a note in the sidebar UI explaining that only the first tab is tracked, clarifying that this is by design to let authors keep notes, references, and deleted text in separate tabs without affecting their goal progress.

### 🎯 Manual Section Goals
* **Problem:** Currently, setting a main document goal divides the target word count evenly among all heading titles. This does not account for chapters of varying length or complexity.
* **Solution:** Allow users to set custom, individual word count targets for specific chapters/sections directly in the sidebar, overriding the automatic even division.

### 📊 Advanced Writing Statistics
* **Feature:** Provide deeper insights into writing quality and speed.
  * **Metrics:** Display Character counts (with and without spaces), Paragraph counts, Sentence counts, and estimated Reading/Speaking times.
  * **Readability Scores:** Implement basic formula checks (like Flesch-Kincaid Grade Level or Reading Ease) using script utilities.

### 📥 Export Capabilities
* **Feature:** Let users export their writing timeline progress as a CSV file, Google Sheet, or compile a formatted summary report directly into a new document.
