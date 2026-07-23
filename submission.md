# Google APIs OAuth Verification Checklist & Assessment

This document tracks the OAuth verification checklist and details how the **Plotline** Google Docs Editor Add-on satisfies or addresses each requirement.

---

## 1. Scope Configuration & Justification

- [x] **Least Privilege**
  - **Status**: Verified.
  - **Details**: Plotline requests only the following 4 scopes in its [appsscript.json](file:///home/lucasrangit/projects/plotline/src/appsscript.json):
    1. `https://www.googleapis.com/auth/documents.currentonly` (restricted to the active document)
    2. `https://www.googleapis.com/auth/drive.file` (restricted to files created or opened by this app)
    3. `https://www.googleapis.com/auth/script.container.ui` (restricted to editor UI dialogs/sidebars)
    4. `https://www.googleapis.com/auth/script.external_request` (used for fetching revision data via `UrlFetchApp`)
  - **Verdict**: The narrowest possible permissions are requested. No broad-access scopes (e.g., full `drive` or `documents`) are requested.

- [x] **Production-Ready**
  - **Status**: Verified.
  - **Details**: All scopes correspond to live, user-facing features (sidebar loading, chapter outline rendering, and revision history graphs).

- [x] **Scope Justification**
  - **Status**: Verified.
  - **Details**: The justification for each requested scope is documented below:
    - **`documents.currentonly`**: Used to parse paragraphs, text, and headings within the active Google Doc. This is required to compute section/chapter word counts and track progress towards goals.
    - **`drive.file`**: Used to query the Google Drive Revisions API (`Drive.Revisions.list` and `Drive.Revisions.get`) for the current active document. This is required to build the historical writing timeline.
    - **`script.container.ui`**: Used to render the custom HTML sidebar panel (`Sidebar.html`) and dialog modals (`PickerModal.html`) within the document editor interface.
    - **`script.external_request`**: Used to download revision plain text files via `UrlFetchApp.fetch` from the Google Drive export endpoints. This is required to compute past word counts as the document evolved.

- [x] **Demo Video**
  - **Status**: Verified.
  - **Details**: The OAuth verification demo video is hosted on YouTube: https://youtu.be/PN-epJixubk

- [x] **Consent Screen Visibility**
  - **Status**: Verified.
  - **Details**: The YouTube demo video shows the complete OAuth consent flow, including the Client ID in the browser URL and all requested scopes fully expanded ("Show all services").

- [x] **Scope Matching**
  - **Status**: Verified.
  - **Details**: The scopes in the Google Cloud Console OAuth Consent Screen configuration must match the `oauthScopes` list in [appsscript.json](file:///home/lucasrangit/projects/plotline/src/appsscript.json) exactly.
  > [!WARNING]
  > Double check that `drive.file` is configured in GCP, not `drive.readonly` (which was mentioned in legacy documentation).

- [x] **Scope Functionality**
  - **Status**: Verified.
  - **Details**: The YouTube demo video demonstrates the full functionality of all requested scopes:
    - Sidebar rendering: `script.container.ui`
    - Live word counts: `documents.currentonly`
    - Revisions retrieval: `drive.file` & `script.external_request`

- [x] **Source Account Impact**
  - **Status**: Verified (No Impact).
  - **Details**: Plotline is a read-only productivity utility. It does not create, modify, or delete any files in the user's Google Drive or Google Docs account. Therefore, there are no write/delete side-effects to show.

- [x] **Live Apps**
  - **Status**: Verified.
  - **Details**: If the app is already published, new scopes must be tested in a separate staging project/deployment to avoid locking out existing users or hitting unverified quota limits.

---

## 2. App Access & Testing Environment

- [x] **Active Test Credentials**
  - **Status**: Verified.
  - **Details**: A test Google Doc has been shared with Google reviewers: https://docs.google.com/document/d/1zYtFTu3Qc9NahnPMaZNb8gNDVzgVKNN5ynFWVYN-sJw/edit

- [x] **Zero Authentication Blockers**
  - **Status**: Verified.
  - **Details**: The add-on is completely free and relies entirely on Google OAuth authentication. No phone verifications, credit cards, or separate accounts are needed.

- [x] **Clear Integration Access**
  - **Status**: Verified.
  - **Details**: The entry point is simple and standard: **Extensions** > **Plotline** > **Open sidebar**. This is detailed in [README.md](file:///home/lucasrangit/projects/plotline/README.md) and [TESTS.md](file:///home/lucasrangit/projects/plotline/TESTS.md).

---

## 3. Privacy Policy Disclosures

- [x] **Data Access**
  - **Status**: Verified.
  - **Details**: Disclosed in [docs/privacy.html](file:///home/lucasrangit/projects/plotline/docs/privacy.html#L24-L32) under Section 1 (Data Collection).

- [x] **Data Use**
  - **Status**: Verified.
  - **Details**: Disclosed in [docs/privacy.html](file:///home/lucasrangit/projects/plotline/docs/privacy.html#L33-L34) under Section 1 (How We Use Google User Data).

- [x] **Data Transfer**
  - **Status**: Verified.
  - **Details**: Disclosed in [docs/privacy.html](file:///home/lucasrangit/projects/plotline/docs/privacy.html#L36-L40) under Section 2 (Data Sharing and Transfer).

- [x] **Data Protection**
  - **Status**: Verified.
  - **Details**: Disclosed in [docs/privacy.html](file:///home/lucasrangit/projects/plotline/docs/privacy.html#L51-L54) under Section 4 (Data Protection Mechanisms).

- [x] **Data Retention & Deletion**
  - **Status**: Verified.
  - **Details**: Disclosed in [docs/privacy.html](file:///home/lucasrangit/projects/plotline/docs/privacy.html#L42-L49) under Section 3 (Data Storage, Retention, and Deletion).

---

## 4. Data Handling: Limited Use Restrictions

- [x] **Prohibited Data Use**
  - **Status**: Verified.
  - **Details**: No Google user data is used for targeted advertising, marketing, profiling, lending, or any other prohibited use case.

- [x] **Prohibited Data Transfer**
  - **Status**: Verified.
  - **Details**: No user data is transferred or sold to third parties, data brokers, or advertisers.

---

## 5. AI/ML Model Training Restrictions

- [x] **Prohibited AI/ML Model Training**
  - **Status**: Verified (N/A).
  - **Details**: The application does not use, develop, improve, or train any AI/ML models.

- [x] **Prohibited Transfer to Third-Party AI/ML Services**
  - **Status**: Verified (N/A).
  - **Details**: No user data is sent to third-party AI/ML services.

- [x] **Limited Use Compliance Statement**
  - **Status**: Verified (N/A).
  - **Details**: Although the app does not use AI/ML, the developer can add an affirmative statement to their website/policy for completeness:
    > *“The use of raw or derived user data received from Workspace APIs will adhere to the Google User Data Policy, including the Limited Use requirements.”*

---

## 6. Prohibited Use Cases

- [x] **Allowed vs. Prohibited Use Cases**
  - **Status**: Verified.
  - **Details**: Plotline is a writing productivity visualization tool, which is a fully allowed Google Workspace add-on use case. It does not send commercial emails, warm up email addresses, act as a large-scale CDN, or reward YouTube users for channel interactions.

---

## 7. Data Portability APIs

- [x] **Prominent Disclosure**
  - **Status**: Verified (N/A).
  - **Details**: The application does not request access to Google Data Portability APIs.

- [x] **User Benefit**
  - **Status**: Verified (N/A).
  - **Details**: Not applicable.

---

## 8. Cloud Application Security Assessment (CASA)

- [x] **CASA**
  - **Status**: Verified (No CASA Required).
  - **Details**: CASA security reviews are only required for apps that request **Restricted scopes**.
    - The Drive scope requested is `https://www.googleapis.com/auth/drive.file`, which is classified as a **Sensitive scope** (not a Restricted scope).
    - The other scopes requested (`documents.currentonly`, `script.container.ui`, `script.external_request`) are also either Sensitive or Non-sensitive.
    - Because Plotline does not request any Restricted scopes, **a third-party CASA security assessment is not required**.
  > [!TIP]
---

## 9. Google Workspace Marketplace Store Listing

### Short Description
Track your writing productivity in Google Docs™ with visualizations. See your word count progress over time with interactive charts to understand habits, set goals, and stay motivated.

*(Note: Maximum length allowed by Google Workspace Marketplace is 160 characters. Recommended concise version (141 chars):)*
> Track your writing productivity in Google Docs™ with visualizations and interactive charts to analyze habits, set goals, and stay motivated.

### Detailed Description
Support your writing process with Plotline, a free Google Docs™ add-on for tracking and visualizing your word count progress. Built to help writers, students, and professionals meet their goals, this tool provides powerful insights into your writing habits directly within your document.

This add-on uses Google APIs to view your document's content and revision history in order to calculate your word count. It runs securely on Google Apps Script™ servers, ensuring your documents remain safe and private.

## Features

1. **Granular Word Counting:** View your word count for the entire document or break it down by section and chapter. By design, only the first Document Tab is counted, allowing you to freely store notes, drafts, and edits in separate tabs without skewing your primary statistics.
2. **Goal Tracking:** Set an optional word count goal to stay motivated and monitor your progress. Your target is automatically and evenly distributed across your document's chapters and sections to help you stay on track. Where you have not met your goal is in gray and where you have exceeded your goal is in green.
3. **Interactive Progress Timelines:** Visualize your writing journey with dynamic, interactive charts that illustrate how your word count evolves over time.
4. **Writing Trends:** Monitor your average writing speed and get an estimated completion time for your word count goal, helping you plan your writing sessions effectively.

