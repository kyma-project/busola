const fs = require('fs');
const http = require('http');
const path = require('path');
const { captureHeapSnapshot } = require('./heap-snapshot');

// ---------------------------------------------------------------------------
// edit-cluster OOM loop diagnostic probe (see support/loop-probe.js).
// All of this is inert unless CYPRESS_LOOP_PROBE=1 is set for the run.
// Everything is written under cypress/loop-probe/ so the existing always()
// artifact upload of tests/integration/cypress/ carries it out of CI.
// ---------------------------------------------------------------------------
const LOOP_PROBE_ON = !!process.env.CYPRESS_LOOP_PROBE;
const PROBE_DIR = path.resolve(__dirname, '..', 'cypress', 'loop-probe');
// Chrome's CDP debugging port, captured in before:browser:launch from the
// --remote-debugging-port launch arg; the heap-snapshot task connects to it to pull a
// full snapshot over an independent WebSocket (see plugins/heap-snapshot.js).
let probeChromeDebugPort = null;

function appendLine(file, line) {
  fs.appendFileSync(path.join(PROBE_DIR, file), line + '\n');
}

// A tiny HTTP sink that receives navigator.sendBeacon() snapshots from the page
// and appends them to disk immediately — the one channel that survives both the
// main-thread peg and a hard renderer crash.
function startProbeSink() {
  fs.mkdirSync(PROBE_DIR, { recursive: true });
  const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(204).end();
      return;
    }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        appendLine('inpage.jsonl', Buffer.concat(chunks).toString('utf8'));
      } catch (e) {
        /* ignore sink write errors */
      }
      // permissive CORS so the beacon is never blocked; response is ignored anyway
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*' }).end();
    });
  });
  // listen() is async — the ephemeral port isn't assigned until the 'listening'
  // event fires, so resolve the sink URL from inside the callback (reading
  // server.address() synchronously after listen() returns null and throws).
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve(`http://127.0.0.1:${port}/probe`);
    });
  });
}

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

module.exports = async (on, config) => {
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

  if (LOOP_PROBE_ON) {
    // hand the page the sink URL so the in-page probe can beacon snapshots to disk
    config.env.LOOP_PROBE = '1';
    config.env.LOOP_PROBE_SINK = await startProbeSink();

    // Capture Chrome's CDP debugging port so the heap-snapshot task can connect to it
    // (see plugins/heap-snapshot.js). Cypress+Chrome always pass --remote-debugging-port
    // with a real TCP port (verified on Cypress 15); it does NOT pass --user-data-dir.
    on('before:browser:launch', (browser, launchOptions) => {
      const arg = (launchOptions.args || []).find((a) =>
        a.startsWith('--remote-debugging-port='),
      );
      if (arg) probeChromeDebugPort = Number(arg.split('=')[1]);
      return launchOptions;
    });
  }

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
    // --- loop-probe disk sinks (driven from the probe spec) ---
    // Append a JSONL line (CDP metric samples, live-hold snapshots, marks).
    probeAppend({ file, line }) {
      fs.mkdirSync(PROBE_DIR, { recursive: true });
      appendLine(file, line);
      return null;
    },
    // Write a CPU/heap profile checkpoint returned by CDP Profiler/HeapProfiler.
    probeWriteProfile({ name, data }) {
      fs.mkdirSync(PROBE_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(PROBE_DIR, name),
        typeof data === 'string' ? data : JSON.stringify(data),
      );
      return null;
    },
    // Capture a full heap snapshot over an independent CDP WebSocket (see
    // plugins/heap-snapshot.js) — this is the one artifact that reveals RETAINER
    // chains for the detached DOM, which the sampling .heapprofile cannot. Written
    // gzipped to cypress/loop-probe/<name>.gz. Never throws; returns an {ok,...}
    // result the spec logs. Call it with an extended per-command timeout, e.g.
    // cy.task('probeHeapSnapshot', { name }, { timeout: 180000 }).
    async probeHeapSnapshot({ name }) {
      const snapName = name || `heap-${Date.now()}.heapsnapshot`;
      let result;
      try {
        result = await captureHeapSnapshot({
          port: probeChromeDebugPort,
          name: snapName,
          outDir: PROBE_DIR,
          timeoutMs: 170000,
        });
      } catch (e) {
        result = { ok: false, reason: String(e) };
      }
      try {
        fs.mkdirSync(PROBE_DIR, { recursive: true });
        appendLine(
          'heapsnapshot-log.jsonl',
          JSON.stringify({ ts: Date.now(), name: snapName, ...result }),
        );
      } catch {
        /* ignore log write errors */
      }
      return result;
    },
  });
  return config;
};
