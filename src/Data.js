/**
 * Google Docs/Drive API wrappers.
 */

/**
 * Get the current word count of the active document.
 * @returns {number} The word count.
 */
function getCurrentWordCount() {
  const doc = DocumentApp.getActiveDocument();
  const text = doc.getBody().getText();
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Retrieves the user-set word count goal.
 * @returns {number|null} The word count goal, or null if not set.
 */
function getWordCountGoal() {
  const documentProperties = PropertiesService.getDocumentProperties();
  const goal = documentProperties.getProperty('WORD_COUNT_GOAL');
  return goal ? parseInt(goal, 10) : null;
}

/**
 * Saves the user-set word count goal.
 * @param {number|string} goal - The word count goal.
 */
function setWordCountGoal(goal) {
  const documentProperties = PropertiesService.getDocumentProperties();
  if (goal) {
    documentProperties.setProperty('WORD_COUNT_GOAL', goal.toString());
  } else {
    documentProperties.deleteProperty('WORD_COUNT_GOAL');
  }
}

/**
 * Get the word counts heading.
 */
function getHeadingWordCounts() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const paragraphs = body.getParagraphs();

  const root = { title: "Document", wordCount: 0, subheadings: [], level: 0 };
  const stack = [root];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const text = p.getText().trim();
    if (!text) continue;

    const count = text.split(/\s+/).length;
    const headingEnum = p.getHeading();

    if (headingEnum === DocumentApp.ParagraphHeading.SUBTITLE) {
      continue;
    }

    let level = null;
    switch (headingEnum) {
      case DocumentApp.ParagraphHeading.TITLE: level = 1; break;
      case DocumentApp.ParagraphHeading.HEADING1: level = 2; break;
      case DocumentApp.ParagraphHeading.HEADING2: level = 3; break;
      case DocumentApp.ParagraphHeading.HEADING3: level = 4; break;
      case DocumentApp.ParagraphHeading.HEADING4: level = 5; break;
      case DocumentApp.ParagraphHeading.HEADING5: level = 6; break;
      case DocumentApp.ParagraphHeading.HEADING6: level = 7; break;
    }

    if (level !== null) {
      // Create node without counting the heading's own words
      const node = { title: text, wordCount: 0, subheadings: [], level: level };

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].subheadings.push(node);
      }

      stack.push(node);
    } else {
      // Normal paragraph (only add to ancestors, don't count heading text)
      for (let j = 0; j < stack.length; j++) {
        stack[j].wordCount += count;
      }
    }
  }

  function cleanUp(node) {
    delete node.level;
    if (node.subheadings && node.subheadings.length === 0) {
      delete node.subheadings;
    } else if (node.subheadings) {
      node.subheadings.forEach(cleanUp);
    }
  }
  cleanUp(root);

  return root;
}

/**
 * Retrieves revision metadata for a document via Drive.
 * @param {string} fileId - The ID of the file to retrieve revisions for.
 * @return {Array<Object>}
 */
function fetchRevisions(fileId) {
  // SIMULATE_FILE_NOT_FOUND is used to test the file not found error case. Google API's do not support revoking access to a file.
  if (PropertiesService.getScriptProperties().getProperty('SIMULATE_FILE_NOT_FOUND') === 'true') {
    console.log("fetchRevisions: Simulating file not found error.");
    throw new Error("API call to drive.revisions.list failed with error: File not found: " + fileId);
  }
  let allRevisions = [];
  let pageToken = null;
  do {
    try {
      const response = Drive.Revisions.list(fileId, {
        fields: "revisions(id,modifiedTime,exportLinks),nextPageToken",
        pageToken: pageToken,
      });
      if (!response.revisions || response.revisions.length === 0) {
        console.warn("fetchRevisions: no revisions returned on this page.");
        break;
      }
      for (let i = 0; i < response.revisions.length; i++) {
        // NB: update fields above if more fields are added
        const revision = response.revisions[i];
        const date = new Date(revision.modifiedTime);
        const id = revision.id;
        console.log(
          "Revision %s Date: %s",
          id,
          date.toLocaleString()
        );
      }
      allRevisions = allRevisions.concat(response.revisions);
      pageToken = response.nextPageToken;
    } catch (err) {
      console.error("fetchRevisions: %s", err.message);
      throw err;
    }
  } while (pageToken);

  console.log("fetchRevisions: found %d revisions.", allRevisions.length);
  return allRevisions;
}

function fetchRevisionWordCounts(onlyCached = false) {
  const documentProperties = PropertiesService.getDocumentProperties();

  const CACHE_KEY = 'ALL_REVISIONS_CACHE';
  let cachedDataStr = documentProperties.getProperty(CACHE_KEY);
  let allRevisionsCache = {};
  if (cachedDataStr) {
    try {
      allRevisionsCache = JSON.parse(cachedDataStr);
    } catch (e) {
      console.error("Failed to parse ALL_REVISIONS_CACHE: " + e.message);
    }
  }

  if (onlyCached) {
    let revisionWordCounts = Object.values(allRevisionsCache);
    revisionWordCounts.sort((a, b) => new Date(a.date) - new Date(b.date));
    return revisionWordCounts;
  }

  const docId = DocumentApp.getActiveDocument().getId();
  const revisions = fetchRevisions(docId);
  const cachedProperties = documentProperties.getProperties();

  let cacheUpdated = false;

  for (let i = 0; i < revisions.length; i++) {
    const rev = revisions[i];

    if (allRevisionsCache[rev.id] !== undefined) {
      console.log("Revision %s found in cache with word count %d", rev.id, allRevisionsCache[rev.id].wordCount);
      continue;
    }

    // check if we already have a revision for this day
    // TODO update to use the latest revision of the day
    const revDateString = new Date(rev.modifiedTime).toDateString();
    let dateAlreadyCached = false;
    const cachedCacheValues = Object.keys(allRevisionsCache).map(k => allRevisionsCache[k]);
    for (let j = 0; j < cachedCacheValues.length; j++) {
      if (new Date(cachedCacheValues[j].date).toDateString() === revDateString) {
        dateAlreadyCached = true;
        break;
      }
    }
    if (dateAlreadyCached) {
      console.log("Skipping revision %s because date %s is already cached.", rev.id, revDateString);
      continue;
    }

    let wc;
    const oldCacheKey = 'REV_WC_' + rev.id;
    if (cachedProperties[oldCacheKey] !== undefined) {
      wc = parseInt(cachedProperties[oldCacheKey], 10);
      console.log("Revision %s found in legacy cache with word count %d", rev.id, wc);
    } else {
      try {
        wc = fetchWordCountForRevision(docId, rev.id);
      } catch (e) {
        console.error('Failed to get word count for revision %s: %s', rev.id, e.message);
        throw e;
      }

      if (wc === null) {
        console.warn('No text available for revision %s', rev.id);
        continue;
      }
      console.log("Revision %s has word count %d", rev.id, wc);
    }

    allRevisionsCache[rev.id] = {
      id: rev.id,
      date: rev.modifiedTime,
      wordCount: wc
    };
    cacheUpdated = true;
  }

  if (cacheUpdated) {
    try {
      documentProperties.setProperty(CACHE_KEY, JSON.stringify(allRevisionsCache));
    } catch (e) {
      console.error("Failed to save ALL_REVISIONS_CACHE: " + e.message);
    }
  }

  let revisionWordCounts = Object.values(allRevisionsCache);
  revisionWordCounts.sort((a, b) => new Date(a.date) - new Date(b.date));

  return revisionWordCounts;
}

/**
 * Compute session groups out of a revision list.
 * @param {Array<Object>} revisions
 * @return {Array<Object>}
 */
function groupRevisionsByHour(revisions) {
  // TODO: implement grouping by 60-minute windows
  return [];
}


/**
 * Retrieve the plain‑text body of a specific revision.  Google Drive
 * revisions for Google Docs don't include the document text directly;
 * instead the revision resource contains `exportLinks` which point at
 * endpoints that will render that revision in a given MIME type.  We
 * fetch the `text/plain` export and return it so callers can compute a
 * word count or diff the string.
 *
 * @param {string} fileId  Drive file ID for the doc
 * @param {string} revisionId  ID of the revision (from `fetchRevisions`)
 * @returns {string} plain‑text snapshot of the document at that revision
 */
function fetchRevisionText(fileId, revisionId) {
  const rev = Drive.Revisions.get(fileId, revisionId, {
    fields: 'exportLinks',
  });

  // not every revision has an export link; the very first revision is
  // sometimes just the "conversion" or creation marker and can't be
  // exported.  Return null instead of throwing so callers can decide what
  // to do (e.g. skip the revision).
  if (!rev.exportLinks || !rev.exportLinks['text/plain']) {
    console.warn(
      'fetchRevisionText: no text/plain link for revision %s, maybe binary placeholder',
      revisionId
    );
    return null;
  }

  // text/plain MIME type is used because it does not contain images. However this breaks the ability to calculate word count by heading.
  const url = rev.exportLinks['text/plain'];
  const token = ScriptApp.getOAuthToken();

  const resp = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token,
    },
    muteHttpExceptions: true,
  });

  if (resp.getResponseCode() !== 200) {
    const html = resp.getContentText();
    const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (match && match[1]) {
      const plainText = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      console.error("fetchRevisionText: Failed to fetch URL %s revision %s content: %s", url, revisionId, plainText);
    }
    throw new Error('HTTP response code: ' + resp.getResponseCode());
  }

  return resp.getContentText();
}


/**
 * Get word count for file revision by ID.
 *
 * @param {string} fileId
 * @param {string} revisionId
 * @returns {number} word count, or null if text is not available
 */
function fetchWordCountForRevision(fileId, revisionId) {
  const txt = fetchRevisionText(fileId, revisionId);
  return txt ? txt.trim().split(/\s+/).filter(Boolean).length : null;
}
