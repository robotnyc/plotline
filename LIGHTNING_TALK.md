# Lightning Talk: Inside Plotline

**Duration:** ~5 Minutes

---

## 0:00 - Introduction (1 minute)

**Presenter:**
"Hi everyone. Today I'm going to give you a quick look under the hood of **Plotline**, a Google Docs Add-on.

For those who haven't used it, Plotline tracks your writing productivity. It sits right inside Google Docs in a sidebar and gives you visualizations of your word count progress over time. You can set goals, track your average daily words, and see when you'll likely hit your target.

The interesting part, from a development perspective, is how this is built purely using Google Apps Script running on Google's servers. Let's dive into the architecture."

---

## 1:00 - Architecture and API Integration (1.5 minutes)

**Presenter:**
"Plotline is divided into two main environments: the frontend HTML/JS that renders the Sidebar, and the backend Apps Script code that hooks into the Document and Drive APIs.

To get a historical word count timeline, we need to inspect past revisions of a document. We use the Google Drive `Revisions.list` API to get the revision timestamps. However, the Revisions API doesn't just hand us the plain text. Instead, it provides `exportLinks`.

Our backend code makes a separate HTTP request using `UrlFetchApp` to download the `text/plain` export of each revision. We parse the downloaded snapshot to count the words at that exact moment in time."

---

## 2:30 - Exponential Backoff (1 minute)

**Presenter:**
"When you have a document with dozens or hundreds of revisions, fetching export links sequentially can trigger Google's rate limits—specifically HTTP 429 'Too Many Requests'.

To handle this gracefully, we implemented a custom wrapper for `UrlFetchApp`. If it detects a 429 or a 5xx error, it doesn't crash the sidebar. Instead, it applies an **exponential backoff algorithm**. It pauses execution—multiplying the wait time on each subsequent attempt—and adds a little random 'jitter' so concurrent requests don't retry at the exact same millisecond. This ensures the add-on recovers automatically from transient load issues."

---

## 3:30 - Caching Strategy (1 minute)

**Presenter:**
"Of course, re-fetching old revisions over and over would be incredibly slow. So, we heavily utilize `PropertiesService.getDocumentProperties()`.

Once a revision's word count is calculated, it's permanently stored as a key-value pair tied directly to that document (e.g., `REV_WC_12345` -> `Date,WordCount`). The next time the user opens the sidebar or refreshes, Plotline pulls everything from the cache instantly, and only queries the Drive API for *new* revisions that happened since the last check. It dramatically speeds up the UI."

---

## 4:30 - UI Implementation & Wrap Up (30 seconds)

**Presenter:**
"Finally, the UI itself. We use `HtmlService` to serve the sidebar, and client-side JavaScript talks to our backend functions using `google.script.run`. Because Apps Script calls are asynchronous, we use success and failure handlers to update the DOM—like rendering our Chart.js timeline or showing error messages—without freezing the Docs interface.

And that's Plotline! A serverless add-on turning raw revision data into actionable insights for writers. Thanks!"
