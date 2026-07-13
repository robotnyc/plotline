# Plotline Google Docs Editor Add-on

## Summary

Track your writing productivity in Google Docs™ with visualizations. See your word count progress over time with interactive charts to understand habits, set goals, and stay motivated.

## Description

Support your writing process with Plotline, a free Google Docs™ add-on for tracking and visualizing your word count progress. Built to help writers, students, and professionals meet their goals, this tool provides powerful insights into your writing habits directly within your document.

This add-on runs securely on Google's own Apps Script servers, ensuring your documents remain safe and private.

## Features

1. **Granular Word Counting:** View your word count for the entire document or break it down by section and chapter. By design, only the first Document Tab is counted, allowing you to freely store notes, drafts, and edits in separate tabs without skewing your primary statistics.
2. **Goal Tracking:** Set an optional word count goal to stay motivated and monitor your progress. Your target is automatically and evenly distributed across your document's chapters and sections to help you stay on track.
3. **Interactive Progress Timelines:** Visualize your writing journey with dynamic, interactive charts that illustrate how your word count evolves over time.
4. **Writing Trends:** Monitor your average writing speed and get an estimated completion time for your word count goal, helping you plan your writing sessions effectively.

## Usage

1. Install the "Plotline" add-on from the Google Workspace Marketplace.
2. Open a Google Doc and activate the add-on from the "Extensions" menu.
3. The sidebar will instantly display your writing statistics.
4. Take control of your writing and hit your targets with Plotline.

## Development

The repository is structured as an [Apps Script](https://developers.google.com/apps-script) project. You can manage it with [clasp](https://github.com/google/clasp) or directly from the Apps Script editor:

1. Install [clasp](https://github.com/google/clasp#installation) and authenticate (`clasp login`).
2. Run `clasp create --type docs --title "Plotline"` or clone an existing script if configured.
3. Push the local files with `clasp push`, then open the script in the online editor (`clasp open`).
4. Use `onOpen` to add the menu and `showSidebar` to preview the sidebar UI.
5. Real API implementations live in `Data.gs`.
6. Use `clasp push --watch --force` when making changes to automatically push local changes (including those to the manifest).
7. Use `npm run lint` to check for linting errors.

## Limitations

1. The add-on is not able to fetch the word count for the very first revision of a document.
2. The add-on is only able to fetch the word count by section for the current document. Past revisions are only able to fetch the total word count.
3. Revision history is not reliable. For example, after 3 months Google Drive can merge previous revisions. Unless they are named.
