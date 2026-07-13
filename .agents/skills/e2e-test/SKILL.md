---
name: browser-test
description: Run end-to-end browser tests for the Plotline add-on to validate UI and logic changes.
---

# End-to-End Testing with Browser Subagent

Use this skill when you need to verify that the Plotline Google Docs add-on loads and functions correctly after making changes to the codebase.

## Prerequisites

A test Document where the Apps Script has been installed and enabled in.

## Procedure

1. **Deploy Code Changes**: Before testing, ensure all changes are deployed via clasp:
   ```bash
   npx @google/clasp push
   ```

2. **Monitor Server-Side Logs**: Start the log watcher in the background to catch any execution errors:
   - If the `clasp-logs` skill is available, use it to spawn the watcher command (`npx @google/clasp tail-logs --watch`) in the background. Keep the command ID.

3. **Launch Browser Subagent**: Start a browser subagent session. Set `Task` to navigate to the test URL and instruct it to:
   - **CRITICAL**: Never navigate to or open the Apps Script project editor UI (`script.google.com`).
   - Wait up to 3 minutes (180,000ms) for the user to manually complete Google login if a login screen is presented.
   - If an OAuth consent screen (asking to grant scopes/permissions to the app) is shown, fail immediately and report that the account does not have scopes pre-granted.
   - Wait for the editor to load by waiting for the `div.kix-appvieweditor` or `#docs-chrome` selector to be visible.
   - Locate and click the **Extensions** menu item in the Google Docs top menubar.
   - Find and click the **Plotline** menu item.
   - Click the **Open sidebar** submenu item.
   - Wait for the sidebar iframe to appear.
   - Switch context to the sidebar iframe. If the sidebar displays "Grant permission then click Refresh", "Grant Access", or any authorization error/prompt, fail the test immediately and report the missing authorization.
   - Check that the `#outline-container` element has loaded the heading word counts successfully.
   - Take a full-page screenshot of the editor and sidebar.

4. **Verify Output and Logs**:
   - Refer to [TESTS.md](file:///home/lucasrangit/projects/plotline/TESTS.md) to crosscheck the rendered UI and counts.
   - Inspect the logs collected by the background watcher using the `clasp-logs` skill instructions. Verify that no `ERROR` records or exceptions were logged during the session.
   - Terminate the background log watcher after validation.

## Safety Guidelines

- **Browser Navigation Restrictions**: The browser subagent must NEVER open or navigate to the Apps Script project editor UI (`script.google.com`) in the browser. It should never be needed.
- **clasp CLI Verification**: Use the `clasp` CLI for pushing code and monitoring logs. Any command using the `clasp` CLI must set `SafeToAutoRun` to `false` so that it is explicitly checked and approved by the user.
