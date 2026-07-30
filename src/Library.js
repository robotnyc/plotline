/**
 * Wrapper for UrlFetchApp.fetch with exponential backoff for HTTP 429 and transient errors.
 *
 * @param {string} url
 * @param {Object} options
 * @param {number} maxRetries - Maximum number of retry attempts.
 * @param {Object} urlFetchApp - UrlFetchApp service.
 * @param {Object} utilities - Utilities service.
 * @returns {GoogleAppsScript.URL_Fetch.HTTPResponse}
 */
function fetchUrlWithBackoff(url, options, maxRetries, urlFetchApp, utilities) {
  let attempt = 0;
  const fetchOptions = Object.assign({}, options, { muteHttpExceptions: true });
  while (true) {
    const resp = urlFetchApp.fetch(url, fetchOptions);
    const code = resp.getResponseCode();
    if (code === 200) {
      return resp;
    }
    if ((code === 429 || code >= 500) && attempt < maxRetries) {
      attempt++;
      const backoffMs = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
      console.warn(`fetchUrlWithBackoff: Received HTTP ${code}. Retrying attempt ${attempt}/${maxRetries} after ${backoffMs}ms...`);
      utilities.sleep(backoffMs);
      continue;
    }
    return resp;
  }
}
