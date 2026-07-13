* The documentation recommends using `clasp push --watch` to deploy changes so there's no need to mention that after each prompt response.
* Since Google Apps Script uses the V8 engine, which supports ES2017 features, use modern JavaScript like arrow functions, `Object.values`, etc. where appropriate.
* Don't swallow exceptions such as auth errors or permission errors, instead rethrow them so the frontend can handle them.
* For end-to-end testing and verification of changes, use the custom `browser-test` skill to execute browser-based checks against the document defined in `TESTS.md`.
* To capture and monitor execution logs during testing, use the `clasp-logs` skill to spawn a background `clasp tail-logs --watch` process and inspect output.

