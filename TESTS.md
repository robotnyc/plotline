# E2E Test Cases for Plotline Add-on

This file lists the validation test cases and expected behaviors for the Plotline Google Docs add-on. Use these test cases during end-to-end testing to verify that changes to `src/Code.js`, `src/Data.js`, or `src/Sidebar.html` do not break existing functionality.

---

## Test Case 1: Sidebar Loading and Outline Word Counts

### Description
Verify that the sidebar loads correctly, establishes communication with the Apps Script server, and renders the document word count outline and progress bars.

### Prerequisites
- Deploy the latest changes using `npx @google/clasp push`.
- Open the test document in a browser:
  `https://docs.google.com/document/d/1zYtFTu3Qc9NahnPMaZNb8gNDVzgVKNN5ynFWVYN-sJw/edit?addon_dry_run=AAnXSK8a672gs9vaudfYBkFy1WS-D5cYAL0JQwb4x9jw6dLcTX6QfGTIzP3nIwhWmGzIjjzJ2eJKZU-2nxzX_ha2GYhsDhRn5DDKopvgpbURhnQg4ELoLjZgPxruwt9650G7eoZQ2G4e&tab=t.0`

### Steps
1. Open the document and sign in if prompted.
2. Click **Extensions** > **Plotline** > **Open sidebar**.
3. Verify the sidebar opens on the right.
4. Verify that the **Word Count** section loads.

### Expected Results
- **Total Word Count**: 442 words (Goal: 1000).
- **Outline & Individual target counts**:
  - **REPORT TITLE**: 416 / 1000 words
  - **Empty Section**: 0 / 167 words
  - **Introduction**: 377 / 167 words
  - **Lorem ipsum**: 310 / 167 words
  - **Dolor sit amet**: 69 / 84 words
  - **Consectetuer**: 82 / 84 words
  - **Chapter 2**: 12 / 167 words
  - **Chapter 3**: 8 / 167 words
  - **Chapter 4**: 9 / 167 words
  - **Chapter 5**: 10 / 167 words

---

## Test Case 2: Timeline Chart Rendering

### Description
Verify that the revision history is fetched, processed, and successfully plotted on the Chart.js timeline.

### Steps
1. After the sidebar loads, locate the **Timeline** section.
2. If access is not granted, click **Grant Access** to run the Google Picker OAuth flow, then click **Refresh**.
3. Verify that a line chart is rendered in the canvas.

### Expected Results
- A Chart.js line chart is visible.
- Labels on the x-axis contain dates (e.g., `Mar 10`, `Mar 11`, `Apr 20`, `Apr 23`, `Jun 6`).
- Hovering over a data point displays the word count at that revision.

---

## Test Case 3: Trends Section Calculation

### Description
Verify that average daily/weekly/monthly writing speeds are calculated and the Goal ETA is displayed.

### Steps
1. Scroll down to the **Trends** section in the sidebar.
2. Verify the list of average counts.

### Expected Results
- Average words per day, week, and month are calculated based on the revision history data.
- **Goal ETA** is calculated if a goal is set, showing the estimated remaining days (e.g., `X days` or `Reached!`).
