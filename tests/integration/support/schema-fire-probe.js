// Temporary diagnostic for the edit-cluster renderer crash (PR #5327).
// Counts how often the app posts 'sendingOpenapi' to the resource-schema worker,
// which is the heavy full-OpenAPI recompute we suspect re-fires in a runaway loop.
// Test-only: wraps the AUT's Worker.postMessage, never touches product code.
// Remove once the loop is confirmed and fixed.
Cypress.on('window:before:load', (win) => {
  const proto = win.Worker && win.Worker.prototype;
  if (!proto || proto.__schemaProbe) return;
  proto.__schemaProbe = true;
  win.__schemaFireLog = [];

  const origPost = proto.postMessage;
  proto.postMessage = function (data) {
    if (Array.isArray(data) && data[0] === 'sendingOpenapi') {
      (win.__schemaFireLog || (win.__schemaFireLog = [])).push({
        t: Date.now(),
        cluster: data[2],
      });
    }
    return origPost.apply(this, arguments);
  };
});

function drainSchemaFire(phase) {
  cy.window({ log: false }).then((win) => {
    const log = win.__schemaFireLog || [];
    if (!log.length) return;
    const first = log[0].t;
    const last = log[log.length - 1].t;
    const spanSec = (last - first) / 1000;
    cy.task(
      'appendSchemaFire',
      {
        phase,
        spec: Cypress.spec && Cypress.spec.name,
        test: Cypress.currentTest && Cypress.currentTest.title,
        fires: log.length,
        spanSec: Number(spanSec.toFixed(1)),
        ratePerSec:
          spanSec > 0 ? Number((log.length / spanSec).toFixed(1)) : null,
        cluster: log[log.length - 1].cluster,
      },
      { log: false },
    );
  });
}

beforeEach(() => drainSchemaFire('beforeEach'));
afterEach(() => drainSchemaFire('afterEach'));
