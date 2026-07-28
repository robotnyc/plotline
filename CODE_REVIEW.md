# Code Review: Plotline Google Docs Add-on

## Summary
The codebase is logically organized into frontend (`Sidebar.html`, `PickerModal.html`) and backend components (`Code.js`, `Data.js`, `Library.js`). The separation of Google Docs context vs standard Apps Script logic is solid. However, following the `AGENTS.md` guidelines and general best practices, the following architectural and stylistic improvements would elevate the project.

## 1. Modern JavaScript & V8 Engine Support

Google Apps Script now runs on the V8 engine, which supports ES2017 syntax. Several files use older syntax that can be modernized for readability and performance.

### Suggestions:
- **`var` vs `let`/`const`:** In frontend scripts (e.g., `Sidebar.html` and `PickerModal.html`), variables are extensively declared using `var` (e.g., `var html`, `var appData`). Use `let` and `const` for proper block-scoping.
- **Loops:** You rely heavily on C-style `for` loops (e.g., `for (let i = 0; i < paragraphs.length; i++)` in `Data.js`). Utilize `for...of` loops, or higher-order array methods like `.map()`, `.filter()`, and `.reduce()` for cleaner iteration.
- **Object Iteration:** In `Data.js` (`migrateRevisionLegacyCachedWordCounts`, `getRevisionCachedWordCounts`), loops are driven by `Object.keys()`. You can streamline these blocks using `Object.entries()` or modern iteration directly on Maps if you refactor the caching logic.

## 2. Magic Strings and Centralized Constants

Strings used for property keys, DOM IDs, and error messages are hardcoded across multiple functions, which increases the likelihood of typos and complicates future refactors.

### Suggestions:
- Extract property keys (e.g., `'WORD_COUNT_GOAL'`, `'SIMULATE_FILE_NOT_FOUND'`) into a central `Constants` object at the top of your scripts.
- Extract common error string matchers in `showError()` (`Sidebar.html`) to well-named constant arrays or objects.
- Centralize cache keys and prefixes (e.g., `"REV_WC_"`, `"ALL_REVISIONS_CACHE"`) into the same module/scope to prevent drift.

## 3. Frontend Architecture (Separation of Concerns)

The HTML files (`Sidebar.html`, `PickerModal.html`) contain a dense mixture of HTML markup, inline CSS styles, and client-side JavaScript logic.

### Suggestions:
- **Componentization:** Move styles into a separate `Stylesheet.html` and scripts into a `JavaScript.html` file. You can then include these dynamically in your main HTML files using `HtmlService.createTemplateFromFile()` and `<?!= include('Stylesheet'); ?>` scriptlets.
- **Inline Event Handlers:** Remove inline HTML event handlers (e.g., `onload="onLoad()"`, `onclick="refreshOutline()"`) in favor of standard event listeners attached within your client-side JavaScript block (e.g., `document.getElementById('refreshBtn').addEventListener('click', refreshOutline)`).
- **DOM Manipulations:** The frequent string concatenation to build HTML nodes (e.g., `var html = '<div class="outline-item"...`) is verbose and prone to XSS risks (though you have an `escapeHtml` function, manual concatenation is still brittle). Consider using standard DOM methods (`document.createElement`) or a lightweight UI templating system to generate complex dynamic lists.

## 4. General Best Practices

- **Configuration:** Configuration options in `PickerModal.html` refer directly to `GOOGLE_CLOUD_API_KEY` and `GOOGLE_CLOUD_PROJECT_NUMBER`. Ensure proper fallback defaults and validation in your backend configuration getters.
- **Error Handling:** The backoff retry wrapper in `Library.js` is great, but ensure you properly handle non-fatal transient Drive API errors explicitly before resorting to random backoffs. Wait explicitly on `429` retry-after headers if they are provided.

---
*Overall, the integration logic is sound and the backend is well-structured for Apps Script execution.*
