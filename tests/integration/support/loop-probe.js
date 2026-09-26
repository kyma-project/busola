/// <reference types="cypress" />
//
// In-page diagnostic probe for the edit-cluster renderer OOM loop.
//
// WHY THIS EXISTS
// ---------------
// On CI (~1/25 runs, never locally) the AUT renderer enters a runaway loop while
// the edit-cluster flow is on screen: CPU pegged >1 core, RSS ratcheting ~450MB/min
// until Chrome kills the renderer at its ~3.8GB cap. This probe captures intel about
// WHAT is looping, from *inside* the page, from the moment the page loads.
//
// HARD CONSTRAINT: during the loop the main thread is pegged, so wall-clock timers
// (setInterval) are starved and cannot be relied on to flush. Therefore we flush on a
// COMMIT-COUNT cadence (inside the React commit hook, which keeps firing because commits
// ARE the main-thread work) and via navigator.sendBeacon (dispatched on the browser's
// network thread, not the pegged main thread). A hard crash loses in-page state, so every
// snapshot is beaconed to a Node HTTP sink that appends it to disk immediately.
//
// This entire file is a NO-OP unless Cypress.env('LOOP_PROBE') is set, so normal PR runs
// are completely unaffected.

const PROBE_ON = !!Cypress.env('LOOP_PROBE');
const SINK_URL = Cypress.env('LOOP_PROBE_SINK'); // e.g. http://localhost:<port>/probe

// Tunables (kept modest so the probe itself never becomes the leak).
const MAX_UNIQUE_STACKS = 200; // cap distinct call-site keys we retain per category
const MAX_URL_KEYS = 200;
const MAX_CONSOLE_KEYS = 200;
const FLUSH_EVERY_COMMITS = 400; // beacon a snapshot at least this often (by commit count)
const FLUSH_EVERY_SCHEDULES = 3000; // ...or this many scheduled callbacks, whichever first
const FIBER_WALK_CAP = 4000; // bound the per-commit fiber DFS
const WALK_EVERY_COMMITS = 50; // only attribute components every Nth commit (cost control)
const PERFORMED_WORK = 0b1; // React fiber flag set on fibers that did work this commit

function install(win) {
  if (!PROBE_ON || win.__loopProbe) return;

  const state = {
    startedAt: Date.now(),
    // unique per AUT window — the probe's counters reset on every page load, so
    // every beacon/snapshot is stamped with this so the analyzer can group by
    // window and isolate the one that actually crashed.
    windowId: Math.random().toString(36).slice(2, 10),
    // React commit accounting
    commits: 0,
    lastCommitTs: Date.now(),
    maxCommitsPerSec: 0,
    commitWindowStart: Date.now(),
    commitWindowCount: 0,
    componentHist: Object.create(null), // displayName -> times seen as "performed work"
    // async scheduling accounting
    sched: {
      setTimeout: 0,
      setInterval: 0,
      queueMicrotask: 0,
      promise: 0,
      rAF: 0,
      resizeObserver: 0,
      mutationObserver: 0,
      abortController: 0,
    },
    stackHist: Object.create(null), // "category|topframes" -> count (who schedules work)
    stackKeys: 0,
    urlHist: Object.create(null), // normalized fetch/XHR url -> count
    urlKeys: 0,
    fetches: 0,
    xhrs: 0,
    consoleHist: Object.create(null), // error/warn signature -> count
    consoleKeys: 0,
    schedulesSinceFlush: 0,
    lastFlushCommits: 0,
  };
  win.__loopProbe = { state };

  // ---- helpers -----------------------------------------------------------

  const bump = (obj, key, capField, cap) => {
    if (obj[key] === undefined) {
      if (state[capField] >= cap) return; // stop retaining new keys once capped
      obj[key] = 0;
      state[capField]++;
    }
    obj[key]++;
  };

  // Grab a compact call-site signature (skip our own patch frame). We keep a deep
  // slice: for observers created inside UI5's connectedCallback the nearest frames
  // are all UI5-internal, so the app-side caller only appears further up the stack.
  const callsite = (category) => {
    let frames = '';
    try {
      const stack = new Error().stack || '';
      frames = stack
        .split('\n')
        .slice(3, 22) // skip Error + our wrapper frames; keep deep enough for app frames
        .map((l) => l.trim())
        .join(' <- ');
    } catch (e) {
      frames = 'n/a';
    }
    bump(
      state.stackHist,
      category + '|' + frames,
      'stackKeys',
      MAX_UNIQUE_STACKS,
    );
  };

  const normalizeUrl = (u) => {
    try {
      const url = new win.URL(u, win.location.href);
      // collapse resourceVersion / watch / rv-ish query noise and numeric ids
      let p = url.pathname.replace(/\/[0-9a-f-]{8,}(?=\/|$)/gi, '/:id');
      return url.origin + p + (url.search ? '?…' : '');
    } catch (e) {
      return String(u).slice(0, 200);
    }
  };

  const flush = (reason) => {
    if (!SINK_URL) return;
    try {
      const now = Date.now();
      const payload = {
        kind: 'snapshot',
        reason,
        ts: now,
        windowId: state.windowId,
        sinceStartMs: now - state.startedAt,
        url: win.location?.href,
        // edit-modal / edit-form markers so we can prove the edit-cluster tie
        editFormOpen: !!win.document?.querySelector(
          '.edit-form, [data-testid="cluster-name"], ui5-dialog[open]',
        ),
        domNodes: win.document?.getElementsByTagName('*').length,
        commits: state.commits,
        maxCommitsPerSec: state.maxCommitsPerSec,
        sched: { ...state.sched },
        fetches: state.fetches,
        xhrs: state.xhrs,
        topStacks: topN(state.stackHist, 15),
        topUrls: topN(state.urlHist, 15),
        topComponents: topN(state.componentHist, 20),
        console: topN(state.consoleHist, 20),
        perfMemory: readMem(),
        domGrowth: domGrowth(),
      };
      const body = JSON.stringify(payload);
      // sendBeacon dispatches off the main thread and survives navigation/crash better
      // than fetch(); fall back to keepalive fetch if unavailable.
      if (win.navigator?.sendBeacon) {
        win.navigator.sendBeacon(SINK_URL, body);
      } else if (win.fetch) {
        win
          .fetch(SINK_URL, { method: 'POST', body, keepalive: true })
          .catch(() => {});
      }
      state.lastFlushCommits = state.commits;
      state.schedulesSinceFlush = 0;
    } catch (e) {
      /* never let the probe throw into the app */
    }
  };

  const topN = (hist, n) =>
    Object.keys(hist)
      .map((k) => [k, hist[k]])
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k, v]) => ({ k, v }));

  const readMem = () => {
    try {
      const m = win.performance?.memory;
      if (!m) return null;
      return {
        usedMB: Math.round(m.usedJSHeapSize / 1048576),
        totalMB: Math.round(m.totalJSHeapSize / 1048576),
        limitMB: Math.round(m.jsHeapSizeLimit / 1048576),
      };
    } catch (e) {
      return null;
    }
  };

  // A compact, reasonably-stable CSS-ish path (up to 4 ancestors) so a growing
  // container can be mapped back to the component that renders it.
  const selectorFor = (el) => {
    const part = (e) => {
      let s = e.tagName ? e.tagName.toLowerCase() : '?';
      if (e.id) s += '#' + e.id;
      else if (e.classList && e.classList.length)
        s += '.' + Array.prototype.slice.call(e.classList, 0, 2).join('.');
      return s;
    };
    const chain = [];
    let e = el;
    let depth = 0;
    while (e && e.nodeType === 1 && depth < 4) {
      chain.unshift(part(e));
      e = e.parentElement;
      depth++;
    }
    return chain.join('>');
  };

  // Structural attribution of the DOM ratchet — minification-proof, unlike JS
  // stacks: names WHICH container's child count balloons and WHICH tag proliferates.
  const domGrowth = () => {
    try {
      const doc = win.document;
      if (!doc) return null;
      const all = doc.getElementsByTagName('*');
      const N = all.length;
      const tagHist = Object.create(null);
      const containers = [];
      for (let i = 0; i < N; i++) {
        const el = all[i];
        const t = el.tagName;
        tagHist[t] = (tagHist[t] || 0) + 1;
        const c = el.childElementCount;
        if (c > 30) containers.push([el, c]);
      }
      containers.sort((a, b) => b[1] - a[1]);
      return {
        total: N,
        topTags: topN(tagHist, 20),
        topContainers: containers
          .slice(0, 15)
          .map(([el, c]) => ({ sel: selectorFor(el), childElementCount: c })),
      };
    } catch (e) {
      return null;
    }
  };

  const maybeFlush = () => {
    if (
      state.commits - state.lastFlushCommits >= FLUSH_EVERY_COMMITS ||
      state.schedulesSinceFlush >= FLUSH_EVERY_SCHEDULES
    ) {
      flush('cadence');
    }
  };

  const noteSchedule = (bucket, category) => {
    state.sched[bucket]++;
    state.schedulesSinceFlush++;
    // Only sample call-sites periodically to keep overhead bounded.
    if (state.sched[bucket] % 20 === 0) callsite(category);
    maybeFlush();
  };

  // ---- patch async scheduling primitives ---------------------------------

  const origSetTimeout = win.setTimeout;
  win.setTimeout = function (fn, delay, ...rest) {
    noteSchedule('setTimeout', 'setTimeout');
    return origSetTimeout.call(this, fn, delay, ...rest);
  };
  const origSetInterval = win.setInterval;
  win.setInterval = function (fn, delay, ...rest) {
    noteSchedule('setInterval', 'setInterval');
    return origSetInterval.call(this, fn, delay, ...rest);
  };
  if (win.queueMicrotask) {
    const origQM = win.queueMicrotask;
    win.queueMicrotask = function (fn) {
      noteSchedule('queueMicrotask', 'queueMicrotask');
      return origQM.call(this, fn);
    };
  }
  if (win.requestAnimationFrame) {
    const origRAF = win.requestAnimationFrame;
    win.requestAnimationFrame = function (fn) {
      noteSchedule('rAF', 'rAF');
      return origRAF.call(this, fn);
    };
  }

  // Promise: count construction + then-scheduling. Wrap the constructor.
  try {
    const OrigPromise = win.Promise;
    if (OrigPromise && !OrigPromise.__probed) {
      const P = function (executor) {
        noteSchedule('promise', 'Promise');
        return new OrigPromise(executor);
      };
      P.prototype = OrigPromise.prototype;
      P.resolve = OrigPromise.resolve.bind(OrigPromise);
      P.reject = OrigPromise.reject.bind(OrigPromise);
      P.all = OrigPromise.all.bind(OrigPromise);
      P.race = OrigPromise.race.bind(OrigPromise);
      P.allSettled = OrigPromise.allSettled?.bind(OrigPromise);
      P.any = OrigPromise.any?.bind(OrigPromise);
      P.__probed = true;
      // Only swap if it doesn't obviously break; keep original as fallback.
      win.Promise = P;
    }
  } catch (e) {
    /* leave Promise unpatched if the environment dislikes it */
  }

  // Observers: count instantiation (a ResizeObserver feedback loop is a prime suspect).
  if (win.ResizeObserver && !win.ResizeObserver.__probed) {
    const OrigRO = win.ResizeObserver;
    const RO = function (cb) {
      state.sched.resizeObserver++;
      callsite('ResizeObserver');
      return new OrigRO(cb);
    };
    RO.prototype = OrigRO.prototype;
    RO.__probed = true;
    win.ResizeObserver = RO;
  }
  if (win.MutationObserver && !win.MutationObserver.__probed) {
    const OrigMO = win.MutationObserver;
    const MO = function (cb) {
      state.sched.mutationObserver++;
      callsite('MutationObserver');
      return new OrigMO(cb);
    };
    MO.prototype = OrigMO.prototype;
    MO.__probed = true;
    win.MutationObserver = MO;
  }
  if (win.AbortController && !win.AbortController.__probed) {
    const OrigAC = win.AbortController;
    const AC = function () {
      state.sched.abortController++;
      return new OrigAC();
    };
    AC.prototype = OrigAC.prototype;
    AC.__probed = true;
    win.AbortController = AC;
  }

  // ---- patch network primitives ------------------------------------------

  if (win.fetch) {
    const origFetch = win.fetch;
    win.fetch = function (input, init) {
      state.fetches++;
      const u = typeof input === 'string' ? input : input?.url;
      bump(state.urlHist, normalizeUrl(u), 'urlKeys', MAX_URL_KEYS);
      state.schedulesSinceFlush++;
      maybeFlush();
      return origFetch.call(this, input, init);
    };
  }
  if (win.XMLHttpRequest) {
    const origOpen = win.XMLHttpRequest.prototype.open;
    win.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      state.xhrs++;
      bump(state.urlHist, normalizeUrl(url), 'urlKeys', MAX_URL_KEYS);
      return origOpen.call(this, method, url, ...rest);
    };
  }

  // ---- patch console.error / console.warn (catch swallowed React warnings) ----

  const signature = (args) => {
    try {
      const first = String(args[0] ?? '');
      // React warnings are templated; keep the first ~120 chars as the signature.
      return first.replace(/\s+/g, ' ').slice(0, 120);
    } catch (e) {
      return 'n/a';
    }
  };
  ['error', 'warn'].forEach((level) => {
    const orig = win.console?.[level];
    if (!orig) return;
    win.console[level] = function (...args) {
      bump(
        state.consoleHist,
        level + ': ' + signature(args),
        'consoleKeys',
        MAX_CONSOLE_KEYS,
      );
      return orig.apply(this, args);
    };
  });

  // ---- React commit hook (render-loop detector + flush pump) --------------

  const fiberName = (fiber) => {
    const t = fiber?.type;
    if (!t) return null;
    if (typeof t === 'string') return null; // host component (div/span) — skip
    return (
      t.displayName ||
      t.name ||
      t.render?.displayName ||
      t.render?.name ||
      t.type?.displayName ||
      t.type?.name ||
      'Anonymous'
    );
  };

  const walkRoot = (root) => {
    // DFS the committed fiber tree, tallying components that "performed work".
    let node = root?.current;
    if (!node) return;
    let visited = 0;
    const stack = [node.child];
    while (stack.length && visited < FIBER_WALK_CAP) {
      const cur = stack.pop();
      if (!cur) continue;
      visited++;
      if ((cur.flags & PERFORMED_WORK) === PERFORMED_WORK) {
        const name = fiberName(cur);
        if (name)
          bump(
            state.componentHist,
            name,
            // component histogram is naturally bounded by app size; reuse a shared cap
            'urlKeys',
            10000,
          );
      }
      if (cur.sibling) stack.push(cur.sibling);
      if (cur.child) stack.push(cur.child);
    }
  };

  const onCommit = (rendererID, root) => {
    try {
      const now = Date.now();
      state.commits++;
      // commits-per-second high-water mark
      if (now - state.commitWindowStart >= 1000) {
        if (state.commitWindowCount > state.maxCommitsPerSec)
          state.maxCommitsPerSec = state.commitWindowCount;
        state.commitWindowStart = now;
        state.commitWindowCount = 0;
      }
      state.commitWindowCount++;
      state.lastCommitTs = now;
      if (state.commits % WALK_EVERY_COMMITS === 0) walkRoot(root);
      maybeFlush();
    } catch (e) {
      /* never throw into React */
    }
  };

  const existing = win.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!existing) {
    let nextID = 1;
    const renderers = new Map();
    win.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      isDisabled: false,
      renderers,
      inject(internals) {
        const id = nextID++;
        renderers.set(id, internals);
        return id;
      },
      onCommitFiberRoot: onCommit,
      onPostCommitFiberRoot() {},
      onCommitFiberUnmount() {},
      checkDCE() {},
      // no-op event bus so libraries probing for these don't crash
      sub() {
        return () => {};
      },
      on() {},
      off() {},
      emit() {},
    };
  } else if (typeof existing.onCommitFiberRoot === 'function') {
    // A real hook exists (unlikely in headless CI); chain onto it.
    const prev = existing.onCommitFiberRoot.bind(existing);
    existing.onCommitFiberRoot = (id, root, ...rest) => {
      onCommit(id, root);
      return prev(id, root, ...rest);
    };
  }

  // Best-effort final flush on teardown/navigation (may be starved during a hard peg,
  // which is exactly why the commit-cadence beacons above are the primary channel).
  const finalFlush = () => flush('pagehide');
  win.addEventListener?.('pagehide', finalFlush);
  win.addEventListener?.('visibilitychange', () => {
    if (win.document?.visibilityState === 'hidden') flush('hidden');
  });

  // expose a spec-callable snapshot for the live-hold poll
  win.__loopProbe.snapshot = () => ({
    ts: Date.now(),
    windowId: state.windowId,
    sinceStartMs: Date.now() - state.startedAt,
    url: win.location?.href,
    commits: state.commits,
    maxCommitsPerSec: state.maxCommitsPerSec,
    sched: { ...state.sched },
    fetches: state.fetches,
    xhrs: state.xhrs,
    topStacks: topN(state.stackHist, 15),
    topUrls: topN(state.urlHist, 15),
    topComponents: topN(state.componentHist, 20),
    console: topN(state.consoleHist, 20),
    perfMemory: readMem(),
    domGrowth: domGrowth(),
  });
  win.__loopProbe.flush = flush;
}

if (PROBE_ON) {
  // Install before the app bundle evaluates, on every AUT window load.
  Cypress.on('window:before:load', (win) => install(win));
  // eslint-disable-next-line no-console
  console.log(
    '[loop-probe] armed (LOOP_PROBE set); sink =',
    SINK_URL || '(none)',
  );
}
