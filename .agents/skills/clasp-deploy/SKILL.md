---
name: clasp-deploy
description: Deploy local updates to the Google Apps Script project using clasp.
---

# Deploying Google Apps Script via clasp

This skill provides the instructions and commands for deploying changes from the local workspace to the Google Apps Script environment.

## Commands

### 1. Push Code to Apps Script
To push the current codebase to Google Apps Script, run:
```bash
npx @google/clasp push
```

### 2. Push and Watch for Changes
For active development sessions, run clasp in watch mode to automatically push changes as files are edited:
```bash
npx @google/clasp push --watch
```

## Guidelines
- Avoid manual modifications to `.clasp.json` unless explicitly asked.
- Before pushing changes, ensure that any changes in `src/appsscript.json` (such as scopes or resources) are syntactically valid.
- The workspace defaults recommend using watch mode during active programming sessions.
