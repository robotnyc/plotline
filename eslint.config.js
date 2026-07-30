import globals from "globals";
import htmlPlugin from "eslint-plugin-html";

export default [
  // 1. Lint configuration for JavaScript files (Google Apps Script environment)
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        ...globals.es2020,
        // Google Apps Script built-in service globals
        console: "readonly",
        DocumentApp: "readonly",
        DriveApp: "readonly",
        PropertiesService: "readonly",
        Drive: "readonly",
        UrlFetchApp: "readonly",
        ScriptApp: "readonly",
        Logger: "readonly",
        SpreadsheetApp: "readonly",
        Session: "readonly",
        HtmlService: "readonly",
        XmlService: "readonly",
        Utilities: "readonly",
        CacheService: "readonly",
        GmailApp: "readonly",
        CalendarApp: "readonly",
        ContactsApp: "readonly",
        Maps: "readonly",
        SlidesApp: "readonly",
        FormApp: "readonly",
        // Project functions across files
        fetchUrlWithBackoff: "readonly",
        getDocumentWordCount: "readonly",
        getWordCountGoalFromProperties: "readonly",
        setWordCountGoalInProperties: "readonly",
        getHeadingWordCountsFromDoc: "readonly",
        fetchRevisions: "readonly",
        migrateRevisionLegacyCachedWordCounts: "readonly",
        getCachedRevisionWordCounts: "readonly",
        getDocumentRevisionWordCounts: "readonly",
        fetchRevisionText: "readonly",
        fetchWordCountForRevision: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      // Apps Script files use global scope: ignore unused top-level function declarations
      "no-unused-vars": ["warn", { "vars": "local", "args": "none" }],
      "no-restricted-properties": [
        "error",
        {
          "object": "console",
          "property": "debug",
          "message": "Use console.log, console.warn, or console.error instead of console.debug."
        }
      ],
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-cond-assign": "error",
      "no-constant-condition": "error",
      "no-debugger": "error",
      "no-extra-semi": "error",
      "no-inner-declarations": "error",
      "no-invalid-regexp": "error",
      "no-sparse-arrays": "error",
      "use-isnan": "error",
      "valid-typeof": "error",
    },
  },
  // 2. Lint configuration for HTML files (Browser environment with inline scripts)
  {
    files: ["src/**/*.html"],
    plugins: {
      html: htmlPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2020,
        google: "readonly",
        gapi: "readonly",
        Chart: "readonly",
      },
    },
    rules: {
      "no-undef": "error",
      // Disable unused vars in HTML as functions are called from inline HTML attributes
      "no-unused-vars": "off",
      "no-restricted-properties": [
        "error",
        {
          "object": "console",
          "property": "debug",
          "message": "Use console.log, console.warn, or console.error instead of console.debug."
        }
      ],
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-cond-assign": "error",
      "no-debugger": "error",
      "use-isnan": "error",
      "valid-typeof": "error",
    },
  },
];
