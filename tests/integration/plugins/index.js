const fs = require('fs');

// Continuum fetches this catalog from the browser during every spec's setUp. On CI that
// call is often slow enough to time out, so we fetch it once here and replay it per spec.
const BESTPRACTICES_URL = 'https://sap.levelaccess.net/api/cont/bestpractices';
const FETCH_TIMEOUT_MS = 20000;
let bestPracticeCatalogPromise = null;

async function fetchBestPracticeCatalog() {
  const attempt = async () => {
    const res = await fetch(BESTPRACTICES_URL, {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };
  try {
    return await attempt();
  } catch (first) {
    try {
      return await attempt(); // try again, the first call sometimes just fails
    } catch (second) {
      console.log(
        `[a11y] Failed to prefetch best-practice catalog (${second}); ` +
          `Continuum will run in degraded (unfiltered) mode for this run.`,
      );
      return null;
    }
  }
}

module.exports = (on, config) => {
  let namespaceName = process.env.NAMESPACE_NAME || null;
  // generate random namespace name if it wasn't provided as env
  const random = Math.floor(Math.random() * 9999) + 1000;
  const randomName = `a-busola-test-${random}`;
  if (!namespaceName) {
    namespaceName = randomName;
  }
  const dynamicSharedStore = {
    cancelTests: false,
  };

  const date = new Date();
  const todaysDate =
    date.getMonth() +
    1 +
    '/' +
    date.getDate() +
    '-' +
    (date.getUTCHours() + 1) +
    ':' +
    date.getUTCMinutes();
  const reportName = `AMP_REPORT_${todaysDate}`;

  config.env.NAMESPACE_NAME = namespaceName;
  config.env.STORAGE_CLASS_NAME = randomName;
  config.env.APP_NAME = randomName;
  config.env.ACC_AMP_TOKEN = process.env.ACC_AMP_TOKEN;
  config.env.IS_PR = process.env.IS_PR;
  config.env.AMP_REPORT_NAME = reportName;

  on('task', {
    removeFile(filePath) {
      fs.unlinkSync(filePath);
      return null;
    },
    listDownloads(downloadsDirectory) {
      return fs.readdirSync(downloadsDirectory);
    },
    // invoke setter cy.task('dynamicSharedStore', { name: 'cancelTests', value: true })
    // invoke getter cy.task('dynamicSharedStore', { name: 'cancelTests' })
    dynamicSharedStore(property) {
      if (property.value !== undefined) {
        return (dynamicSharedStore[property.name] = property.value);
      } else {
        return dynamicSharedStore[property.name];
      }
    },
    // fetch only once and reuse the promise for the other specs; null if it failed
    getBestPracticeCatalog() {
      if (!bestPracticeCatalogPromise) {
        bestPracticeCatalogPromise = fetchBestPracticeCatalog();
      }
      return bestPracticeCatalogPromise;
    },
  });
  return config;
};
