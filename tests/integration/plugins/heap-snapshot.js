//
// Node-side CDP heap-snapshot capture for the edit-cluster OOM loop probe.
//
// WHY NODE-SIDE: HeapProfiler.takeHeapSnapshot streams the snapshot as a series of
// `HeapProfiler.addHeapSnapshotChunk` *events*, not as a command response. Cypress's
// in-spec `remote:debugger:protocol` automation is request/response only and cannot
// subscribe to CDP events, so the snapshot has to be pulled from the plugins (Node)
// process over an independent CDP WebSocket. Node 24's built-in global `WebSocket`
// means no extra npm dependency.
//
// PORT DISCOVERY without fighting Cypress: Cypress owns its own CDP connection to the
// Chrome it launches, but Chrome allows multiple CDP clients per target. Cypress passes
// `--remote-debugging-port=<port>` right in the Chrome launch args (verified empirically
// on Cypress 15 — it uses a TCP port, not `--remote-debugging-pipe`, and does NOT pass
// `--user-data-dir`). So `before:browser:launch` reads the port straight from the args
// and hands it here. `<user-data-dir>/DevToolsActivePort` is kept only as a fallback.
//
// The result is gzipped (.heapsnapshot.gz) because a snapshot of ~500MB JS heap +
// ~200k DOM wrappers is large but compresses ~10x. Gunzip before loading into Chrome
// DevTools (Memory > Load) or heapsnapshot viewers.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Read the DevTools port Chrome wrote for this run's profile dir. First line is the
// port; second line is the browser-level ws path (we don't need it — we enumerate
// page targets via the HTTP /json/list endpoint instead).
function readDevToolsPort(userDataDir) {
  if (!userDataDir) return null;
  try {
    const first = fs
      .readFileSync(path.join(userDataDir, 'DevToolsActivePort'), 'utf8')
      .split('\n')[0]
      .trim();
    return first ? Number(first) : null;
  } catch {
    return null;
  }
}

// Enumerate targets and pick the page most likely to hold the AUT's heap. With site
// isolation disabled (Cypress sets chromeWebSecurity:false), the AUT iframe shares the
// renderer isolate with the runner, so a snapshot of any page target in that process
// includes the AUT's detached DOM. We still prefer the :3001 AUT url when it surfaces
// as its own target. Returns { chosen, all } — `all` is logged for diagnosis.
async function pickPageTarget(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const targets = await res.json();
  const pages = targets.filter(
    (t) => t.type === 'page' && t.webSocketDebuggerUrl,
  );
  const chosen =
    pages.find((t) => /:3001/.test(t.url)) ||
    pages.find((t) => /localhost|__cypress/.test(t.url)) ||
    pages[0];
  return { chosen, all: targets.map((t) => ({ type: t.type, url: t.url })) };
}

// Capture one heap snapshot to <outDir>/<name>.gz. Never throws — resolves with an
// {ok, ...} result object the caller logs, so a capture failure never fails the run.
// `port` (from Cypress's --remote-debugging-port arg) is preferred; `userDataDir` is a
// fallback that reads the DevToolsActivePort file.
async function captureHeapSnapshot({
  port: portArg,
  userDataDir,
  name,
  outDir,
  timeoutMs = 180000,
}) {
  const port = portArg || readDevToolsPort(userDataDir);
  if (!port) return { ok: false, reason: 'no CDP port', portArg, userDataDir };

  let targetInfo;
  try {
    targetInfo = await pickPageTarget(port);
  } catch (e) {
    return { ok: false, reason: `json/list failed: ${e}`, port };
  }
  const target = targetInfo.chosen;
  if (!target) {
    return { ok: false, reason: 'no page target', port, all: targetInfo.all };
  }

  return await new Promise((resolve) => {
    let ws;
    let done = false;
    const chunks = [];
    const TAKE_ID = 2;

    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        ws && ws.close();
      } catch {
        /* ignore */
      }
      resolve({ target: target.url, targets: targetInfo.all, port, ...result });
    };

    const timer = setTimeout(
      () => finish({ ok: false, reason: 'timeout', chunks: chunks.length }),
      timeoutMs,
    );

    try {
      ws = new WebSocket(target.webSocketDebuggerUrl);
    } catch (e) {
      return finish({ ok: false, reason: `ws construct: ${e}` });
    }

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'HeapProfiler.enable' }));
      ws.send(
        JSON.stringify({
          id: TAKE_ID,
          method: 'HeapProfiler.takeHeapSnapshot',
          params: { reportProgress: false, captureNumericValue: false },
        }),
      );
    });

    ws.addEventListener('message', (ev) => {
      let msg;
      try {
        msg = JSON.parse(typeof ev.data === 'string' ? ev.data : '');
      } catch {
        return;
      }
      if (msg.method === 'HeapProfiler.addHeapSnapshotChunk') {
        chunks.push(msg.params.chunk);
      } else if (msg.id === TAKE_ID) {
        // CDP delivers every addHeapSnapshotChunk event before this response.
        if (msg.error) {
          return finish({ ok: false, reason: `CDP: ${msg.error.message}` });
        }
        try {
          fs.mkdirSync(outDir, { recursive: true });
          const buf = Buffer.from(chunks.join(''), 'utf8');
          const gz = zlib.gzipSync(buf);
          fs.writeFileSync(path.join(outDir, `${name}.gz`), gz);
          finish({ ok: true, bytes: buf.length, gzBytes: gz.length });
        } catch (e) {
          finish({ ok: false, reason: `write: ${e}` });
        }
      }
    });

    ws.addEventListener('error', () =>
      finish({ ok: false, reason: 'ws error', chunks: chunks.length }),
    );
  });
}

module.exports = { captureHeapSnapshot, readDevToolsPort, pickPageTarget };
