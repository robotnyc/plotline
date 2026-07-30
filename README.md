# Plotline Google Docs™ Editor Add-on

## Summary

Track your writing productivity in Google Docs™ with visualizations. See your word count progress over time with interactive charts to understand habits, set goals, and stay motivated.

## Description

Support your writing process with Plotline, a free Google Docs™ add-on for tracking and visualizing your word count progress. Built to help writers, students, and professionals meet their goals, this tool provides powerful insights into your writing habits directly within your document.

This add-on runs securely on Google's own Apps Script servers, ensuring your documents remain safe and private.

## Features

1. **Granular Word Counting:** View your word count for the entire document or break it down by section and chapter. By design, only the first Document Tab is counted, allowing you to freely store notes, drafts, and edits in separate tabs without skewing your primary statistics.
2. **Goal Tracking:** Set an optional word count goal to stay motivated and monitor your progress. Your target is automatically and evenly distributed across your document's chapters and sections to help you stay on track. Where you have not met your goal is in gray and where you have exceeded your goal is in green.
3. **Interactive Progress Timelines:** Visualize your writing journey with dynamic, interactive charts that illustrate how your word count evolves over time.
4. **Writing Trends:** Monitor your average writing speed and get an estimated completion time for your word count goal, helping you plan your writing sessions effectively.

## Getting Started

<a href="https://workspace.google.com/marketplace/app/plotline/717313169577?pann=b" target="_blank" aria-label="Get it from the Google Workspace Marketplace">
  <img alt="Google Workspace Marketplace badge" alt-text="Get it from the Google Workspace Marketplace" src="https://workspace.google.com/static/img/marketplace/en/gwmBadge.svg?" style="height: 68px">
</a>

Open a document in Google Docs™ and select Extensions > Plotline > Open sidebar to start tracking your word count. The sidebar will instantly display your writing statistics unless additional permissions are needed. Set your word count goal if you have one. Refresh the Timeline chart and Trends to start tracking your writing progress. Refresh the Timeline often if you want a more granular word count history, as Google Docs™ may merge or drop past revisions. If you continue to have permission issues, you have to sign out of all other Google accounts before authorizing this add-on. Guest mode also works, but Incognito mode does not work because it blocks cookies.

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
3. Revision history is not reliable. For example, after 3 months Google Drive can merge previous revisions unless they are named.

## License

[MIT](LICENSE)
