* The documentation recommends using `clasp push --watch` to deploy changes so there's no need to mention that after each prompt response.
* Since Google Apps Script uses the V8 engine, which supports ES2017 features, use modern JavaScript like arrow functions, `Object.values`, etc. where appropriate.
* Don't swallow exceptions such as auth errors or permission errors, instead rethrow them so the frontend can handle them.
