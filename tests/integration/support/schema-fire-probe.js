// Temporary diagnostic for the edit-cluster renderer crash (PR #5327).
// Counts how often the app posts 'sendingOpenapi' to the resource-schema worker,
// the heavy full-OpenAPI recompute we suspect re-fires in a runaway loop.
//
// The runaway fires while Cypress is idle (no commands, no test boundaries) and
// ends by crashing the renderer, so an in-page array would vanish on the reload.
// We keep a crash-surviving tally in localStorage (disk-backed, same origin) and
// drain it at the next test boundary, which runs once the suite recovers from the
// crash. Test-only: wraps the AUT's Worker.postMessage, never touches product code.
// Remove once the loop is confirmed and fixed.

const LS_KEY = 'schemaFireProbe';

Cypress.on('window:before:load', (win) => {
  const proto = win.Worker && win.Worker.prototype;
  if (!proto || proto.__schemaProbe) return;
  proto.__schemaProbe = true;

  const origPost = proto.postMessage;
  proto.postMessage = function (data) {
    if (Array.isArray(data) && data[0] === 'sendingOpenapi') {
      try {
        const now = Date.now();
        const rec = JSON.parse(win.localStorage.getItem(LS_KEY) || 'null') || {
          count: 0,
          first: now,
          samples: [],
        };
        rec.count += 1;
        rec.last = now;
        rec.cluster = data[2];
        rec.samples.push(now);
        if (rec.samples.length > 20) rec.samples.shift();
        win.localStorage.setItem(LS_KEY, JSON.stringify(rec));
      } catch (e) {
        // ignore probe bookkeeping failures
      }
    }
    return origPost.apply(this, arguments);
  };
});

function drainSchemaFire(phase) {
  cy.window({ log: false }).then((win) => {
    let rec = null;
    try {
      rec = JSON.parse(win.localStorage.getItem(LS_KEY) || 'null');
    } catch (e) {
      rec = null;
    }
    if (!rec || !rec.count) return;
    const spanSec = (rec.last - rec.first) / 1000;
    cy.task(
      'appendSchemaFire',
      {
        phase,
        spec: Cypress.spec && Cypress.spec.name,
        test: Cypress.currentTest && Cypress.currentTest.title,
        fires: rec.count,
        spanSec: Number(spanSec.toFixed(1)),
        ratePerSec:
          spanSec > 0 ? Number((rec.count / spanSec).toFixed(1)) : null,
        cluster: rec.cluster,
      },
      { log: false },
    );
    // start fresh so the next window's tally reflects only its own fires
    try {
      win.localStorage.removeItem(LS_KEY);
    } catch (e) {
      // ignore
    }
  });
}

beforeEach(() => drainSchemaFire('beforeEach'));
afterEach(() => drainSchemaFire('afterEach'));
