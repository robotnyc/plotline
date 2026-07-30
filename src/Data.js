/**
 * Google Docs/Drive API wrappers.
 */

const DEBUG_LOGGING = false;
const REV_WC_KEY_PREFIX = "REV_WC_";

/**
 * Get the current word count of a document.
 * @param {GoogleAppsScript.Document.Document} doc - Document object.
 * @returns {number} The word count.
 */
function getDocumentWordCount(doc) {
  const text = doc.getBody().getText();
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Retrieves the user-set word count goal.
 * @param {GoogleAppsScript.Properties.PropertiesService} propertiesService - PropertiesService instance.
 * @returns {number|null} The word count goal, or null if not set.
 */
function getWordCountGoalFromProperties(propertiesService) {
  const goal = propertiesService.getDocumentProperties().getProperty('WORD_COUNT_GOAL');
  return goal ? parseInt(goal, 10) : null;
}

/**
 * Saves the user-set word count goal.
 * @param {GoogleAppsScript.Properties.PropertiesService} propertiesService - PropertiesService instance.
 * @param {number|string} goal - The word count goal.
 */
function setWordCountGoalInProperties(propertiesService, goal) {
  const props = propertiesService.getDocumentProperties();
  if (goal) {
    props.setProperty('WORD_COUNT_GOAL', goal.toString());
  } else {
    props.deleteProperty('WORD_COUNT_GOAL');
  }
}

/**
 * Get the word counts heading.
 * @param {GoogleAppsScript.Document.Document} doc - Document object.
 * @returns {Object} Root heading word counts structure.
 */
function getHeadingWordCountsFromDoc(doc) {
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
 * @param {string} docId - The ID of the document to retrieve revisions for.
 * @param {Object} drive - Drive API service instance.
 * @param {GoogleAppsScript.Properties.PropertiesService} propertiesService - PropertiesService instance.
 * @return {Array<Object>} List of revision objects with id, modifiedTime, and exportLinks.
 */
function fetchRevisions(docId, drive, propertiesService) {
  let allRevisions = [];
  let pageToken = null;
  do {
    try {
      const response = drive.Revisions.list(docId, {
        fields: "revisions(id,modifiedTime,exportLinks),nextPageToken",
        pageToken: pageToken,
      });
      // SIMULATE_FILE_NOT_FOUND is used to test the file not found error case. Google API's do not support revoking access to a file.
      // We check this after the API call to ensure any basic OAuth permission/scope exceptions are thrown first.
      if (propertiesService.getScriptProperties().getProperty('SIMULATE_FILE_NOT_FOUND') === 'true') {
        console.log("fetchRevisions: Simulating file not found error.");
        throw new Error(`API call to drive.revisions.list failed with error: File not found: ${docId}`);
      }
      if (!response.revisions || response.revisions.length === 0) {
        console.warn("Drive API Revisions: 0");
        break;
      }
      if (DEBUG_LOGGING) {
        for (let i = 0; i < response.revisions.length; i++) {
          const revision = response.revisions[i];
          console.log(`Revision ${revision.id} Date: ${new Date(revision.modifiedTime).toLocaleString()}`);
        }
      }
      allRevisions = allRevisions.concat(response.revisions);
      pageToken = response.nextPageToken;
    } catch (err) {
      console.error("fetchRevisions: %s", err.message);
      throw err;
    }
  } while (pageToken);

  console.log(`Drive API Revisions: ${allRevisions.length}`);
  return allRevisions;
}

/**
 * Migrates legacy cache formats to the individual key format.
 * @param {GoogleAppsScript.Properties.PropertiesService} propertiesService - PropertiesService instance.
 */
function migrateRevisionLegacyCachedWordCounts(propertiesService) {
  const documentProperties = propertiesService.getDocumentProperties();
  const propertiesMap = documentProperties.getProperties();

  // Remove individual REV_WC_ keys that do not contain a comma delimited date and word count.
  const keys = Object.keys(propertiesMap);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.indexOf(REV_WC_KEY_PREFIX) === 0) {
      const revId = key.substring(7);
      const val = propertiesMap[key];
      if (!val || val.indexOf(',') === -1) {
        try {
          documentProperties.deleteProperty(key);
          console.log(`Deleted legacy individual cache for revision ${revId}`);
        } catch (e) {
          console.error(`Failed to delete legacy individual cache for revision ${revId}: ${e.message}`);
        }
      }
    }
  }

  // Migrate ALL_REVISIONS_CACHE
  if (propertiesMap['ALL_REVISIONS_CACHE']) {
    let legacyCache = {};
    try {
      legacyCache = JSON.parse(propertiesMap['ALL_REVISIONS_CACHE']);
      let propertiesToSet = {};
      const ids = Object.keys(legacyCache);
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const entry = legacyCache[id];
        if (entry && entry.date && entry.wordCount !== undefined) {
          propertiesToSet[`${REV_WC_KEY_PREFIX}${id}`] = `${entry.date},${entry.wordCount}`;
        }
      }
      if (Object.keys(propertiesToSet).length > 0) {
        documentProperties.setProperties(propertiesToSet);
      }
    } catch (e) {
      console.error(`Failed to migrate legacy ALL_REVISIONS_CACHE: ${e.message}`);
    }

    // Delete after migration
    try {
      documentProperties.deleteProperty('ALL_REVISIONS_CACHE');
      console.log("Deleted ALL_REVISIONS_CACHE key.");
    } catch (e) {
      console.error(`Failed to delete ALL_REVISIONS_CACHE: ${e.message}`);
    }
  }
}

/**
 * Retrieves the cached revision word counts from document properties.
 * @param {GoogleAppsScript.Properties.PropertiesService} propertiesService - PropertiesService instance.
 * @returns {Object} Map {"revision id" -> {"id", "date", "wordCount"}}
 */
function getCachedRevisionWordCounts(propertiesService) {
  migrateRevisionLegacyCachedWordCounts(propertiesService);

  const documentProperties = propertiesService.getDocumentProperties();
  const propertiesMap = documentProperties.getProperties();
  const revisionMap = {};
  const keys = Object.keys(propertiesMap);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.indexOf(REV_WC_KEY_PREFIX) === 0) {
      const revId = key.substring(REV_WC_KEY_PREFIX.length);
      const val = propertiesMap[key];
      if (val) {
        const parts = val.split(',');
        if (parts.length === 2) {
          revisionMap[revId] = {
            id: revId,
            date: parts[0],
            wordCount: parseInt(parts[1], 10)
          };
        } else {
          console.info(`Found invalid cache entry for revision ${revId}: ${val}`);
          try {
            documentProperties.deleteProperty(key);
          } catch (e) {
            console.error(`Failed to delete invalid cache entry for revision ${revId}: ${e.message}`);
          }
        }
      }
    }
  }

  console.log(`Cached Revisions: ${Object.keys(revisionMap).length}`);
  return revisionMap;
}

/**
 * Retrieves the word counts for the document revisions.
 * @param {boolean} onlyCached - If true, skip calling the Drive API and only return cached revision data.
 * @param {string} docId - File ID of the document.
 * @param {GoogleAppsScript.Properties.PropertiesService} propertiesService - PropertiesService instance.
 * @param {Object} drive - Google Drive service instance.
 * @param {Object} scriptApp - ScriptApp service instance.
 * @param {Object} utilities - Utilities service instance.
 * @param {Object} urlFetchApp - UrlFetchApp service instance.
 * @returns {Array<Object>} List of revision objects sorted by date, each containing:
 *   - id: The revision ID.
 *   - date: The ISO-8601 modified time string.
 *   - wordCount: The word count at that revision.
 */
function getDocumentRevisionWordCounts(onlyCached, docId, propertiesService, drive, scriptApp, utilities, urlFetchApp) {
  const revisionDataMap = getCachedRevisionWordCounts(propertiesService);

  if (onlyCached) {
    const revisionDataList = Object.values(revisionDataMap);
    revisionDataList.sort((a, b) => new Date(a.date) - new Date(b.date));
    console.info("Use only cached data.");
    return revisionDataList;
  }

  const revisions = fetchRevisions(docId, drive, propertiesService);

  // 1. Merge revisions from the Drive API into revisionDataMap (supplementing missing ones)
  for (let i = 0; i < revisions.length; i++) {
    const rev = revisions[i];
    if (!revisionDataMap[rev.id]) {
      revisionDataMap[rev.id] = {
        id: rev.id,
        date: rev.modifiedTime
      };
    }
  }

  const allRevisionsList = Object.values(revisionDataMap);
  allRevisionsList.sort((a, b) => new Date(a.date) - new Date(b.date));

  // 2. Fetch word counts for any revisions that are not yet cached
  const result = [];
  const propertiesToUpdate = {};
  const documentProperties = propertiesService.getDocumentProperties();

  for (let i = 0; i < allRevisionsList.length; i++) {
    const rev = allRevisionsList[i];
    const key = `${REV_WC_KEY_PREFIX}${rev.id}`;

    if (rev.wordCount !== undefined) {
      if (DEBUG_LOGGING) {
        console.log(`Revision: ${rev.id} Date: ${new Date(rev.date).toLocaleString()} Word Count: ${rev.wordCount}`);
      }
      result.push(rev);
    } else {
      // Absent: fetch, calculate, write new format
      let wc;
      try {
        // Small pacing delay between requests to avoid burst rate limits
        utilities.sleep(100);
        wc = fetchWordCountForRevision(docId, rev.id, drive, scriptApp, urlFetchApp, utilities);
      } catch (e) {
        console.error(`Failed to get word count for revision ${rev.id}: ${e.message}`);
        if (e.message && e.message.indexOf('429') !== -1) {
          console.warn(`HTTP 429 rate limit reached for revision ${rev.id}. Saving partial progress and returning cached revisions.`);
          break;
        }
        throw e;
      }

      if (wc === null) {
        console.warn(`No text available for revision ${rev.id}`);
        try {
          documentProperties.deleteProperty(key);
        } catch (delErr) {
          console.error(`Failed to delete property for revision ${rev.id}: ${delErr.message}`);
        }
        continue;
      }

      console.log(`Fetched Revision: ${rev.id} Date: ${new Date(rev.date).toLocaleString()} Word Count: ${wc}`);
      propertiesToUpdate[key] = `${rev.date},${wc}`;

      result.push({
        id: rev.id,
        date: rev.date,
        wordCount: wc
      });
    }
  }

  if (Object.keys(propertiesToUpdate).length > 0) {
    try {
      documentProperties.setProperties(propertiesToUpdate);
    } catch (e) {
      console.error(`Failed to cache word count: ${e.message}`);
    }
  }

  return result;
}

/**
 * Retrieve the plain‑text body of a specific revision. Google Drive
 * revisions for Google Docs don't include the document text directly;
 * instead the revision resource contains `exportLinks` which point at
 * endpoints that will render that revision in a given MIME type.  We
 * fetch the `text/plain` export and return it so callers can compute a
 * word count or diff the string.
 *
 * @param {string} docId - Drive document ID.
 * @param {string} revisionId - ID of the revision.
 * @param {Object} drive - Google Drive service instance.
 * @param {Object} scriptApp - ScriptApp service instance.
 * @param {Object} urlFetchApp - UrlFetchApp service instance.
 * @param {Object} utilities - Utilities service instance.
 * @returns {string|null} plain‑text snapshot, or null if missing/unexportable.
 */
function fetchRevisionText(docId, revisionId, drive, scriptApp, urlFetchApp, utilities) {
  let rev;
  try {
    rev = drive.Revisions.get(docId, revisionId, {
      fields: 'exportLinks',
    });
  } catch (err) {
    if (err.message && /revision not found/i.test(err.message)) {
      console.warn('fetchRevisionText: Revision %s not found (likely deleted or pruned by Google Drive)', revisionId);
      return null;
    }
    throw err;
  }

  // not every revision has an export link; the very first revision is
  // sometimes just the "conversion" or creation marker and can't be
  // exported.  Return null instead of throwing so callers can decide what
  // to do (e.g. skip the revision).
  if (!rev || !rev.exportLinks || !rev.exportLinks['text/plain']) {
    console.warn(
      'fetchRevisionText: no text/plain link for revision %s, maybe binary placeholder',
      revisionId
    );
    return null;
  }

  // text/plain MIME type is used because it does not contain images. However this breaks the ability to calculate word count by heading.
  const url = rev.exportLinks['text/plain'];
  const token = scriptApp.getOAuthToken();

  const resp = fetchUrlWithBackoff(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    3,
    urlFetchApp,
    utilities
  );

  if (resp.getResponseCode() !== 200) {
    const html = resp.getContentText();
    const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (match && match[1]) {
      const plainText = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      console.error("fetchRevisionText: Failed to fetch URL %s revision %s content: %s", url, revisionId, plainText);
    }
    throw new Error(`HTTP response code: ${resp.getResponseCode()}`);
  }

  return resp.getContentText();
}

/**
 * Get word count for file revision by ID.
 * @param {string} docId
 * @param {string} revisionId
 * @param {Object} drive
 * @param {Object} scriptApp
 * @param {Object} urlFetchApp
 * @param {Object} utilities
 * @returns {number|null} word count, or null if text is not available
 */
function fetchWordCountForRevision(docId, revisionId, drive, scriptApp, urlFetchApp, utilities) {
  const txt = fetchRevisionText(docId, revisionId, drive, scriptApp, urlFetchApp, utilities);
  return txt ? txt.trim().split(/\s+/).filter(Boolean).length : null;
}
