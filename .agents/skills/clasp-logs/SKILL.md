---
name: clasp-logs
description: Spawn clasp tail-logs --watch in the background to capture and examine Apps Script logs during E2E testing or debugging.
---

# Capturing Apps Script Logs via clasp

This skill explains how to start a background log watcher using clasp to capture and inspect real-time server-side execution logs during manual or automated testing.

## First-Time Setup
Before running automated log tailing commands, you must perform the following setup manually once:

1. **Associate the GCP project**:
   ```bash
   npx @google/clasp setup-logs
   ```
2. **Configure logging and cache the project ID**:
   Run the tail-logs command manually once to answer any prompts and store the project ID:
   ```bash
   npx @google/clasp tail-logs --project .clasp.json
   ```
   If prompted, provide the GCP Project ID found in `.clasp.json` (e.g., `717313169577`).

## Logger Command
To tail and watch log entries:
```bash
npx @google/clasp tail-logs --project .clasp.json --watch
```

## Step-by-Step Procedure for Agents

1. **Start Log Watcher in Background**:
   Before performing browser-based tests, start the log watcher asynchronously:
   - Propose a `run_command` call with:
     - `CommandLine`: `npx @google/clasp tail-logs --project .clasp.json --watch`
     - `WaitMsBeforeAsync`: `1000` (sends the command to the background immediately after initiating)
   - Store the returned `CommandId` in memory.
   - **CRITICAL - Handle GCP Project Prompt**: Check the command status immediately after launching. If the output shows that it is prompting for a GCP project ID (e.g., containing `? What is your GCP projectId?`), terminate the background command using `send_command_input` with `Terminate: true`. Then, ask the user to run `npx @google/clasp tail-logs --project .clasp.json` manually once in their terminal to input their GCP Project ID, and pause until they confirm it is done.

2. **Run E2E Tests / Perform Actions**:
   Launch the browser subagent or ask the user to perform manual actions in the Google Doc document to trigger the add-on's server-side logic.

3. **Fetch and Examine Logs**:
   Read the log buffer captured in the background:
   - Propose a `command_status` call with the `CommandId` and a suitable `OutputCharacterCount` (e.g., `5000`).
   - Search the output for standard Apps Script log prefixes (e.g., `DEBUG`, `INFO`, `ERROR`) and inspect any thrown exceptions or return values.

4. **Clean Up**:
   Once validation is complete, terminate the background command to avoid resource leaks:
   - Propose a `send_command_input` call with the `CommandId` and `Terminate: true`.
