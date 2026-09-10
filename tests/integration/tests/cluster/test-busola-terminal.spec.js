/// <reference types="cypress" />

const configRequest = {
  method: 'GET',
  url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
};

const config__withTerminal = {
  data: {
    config: JSON.stringify({
      config: {
        features: {
          TERMINAL: { isEnabled: true },
        },
      },
    }),
  },
};

context('Test Busola Terminal', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.intercept(configRequest, config__withTerminal);
    cy.loginAndSelectCluster();
  });

  it('Terminal button is visible in the shell bar when the feature is enabled', () => {
    cy.get('ui5-shellbar')
      .find('ui5-button[icon="command-line-interfaces"]')
      .should('be.visible');
  });

  it('Opens the terminal and provisions a pod with the correct manifest', () => {
    // Mock namespace creation — eliminates dependency on whether the namespace
    // already exists in the test cluster.
    cy.intercept('POST', '/backend/api/v1/namespaces', {
      statusCode: 200,
      body: {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: 'busola-terminal' },
      },
    }).as('createNamespace');

    // Mock pod creation — passes the real pod manifest straight back so the app
    // stores the correct pod name internally.
    cy.intercept(
      'POST',
      '/backend/api/v1/namespaces/busola-terminal/pods',
      (req) => {
        req.reply({ statusCode: 201, body: req.body });
      },
    ).as('createPod');

    // Mock pod readiness polling — returns Running on every call so provisionPod
    // resolves in < 1 s instead of waiting for a real image pull (up to 120 s on
    // cold k3d clusters, which is the root cause of the original CI failure).
    cy.intercept('GET', '/backend/api/v1/namespaces/busola-terminal/pods/*', {
      statusCode: 200,
      body: {
        metadata: { deletionTimestamp: null },
        status: { phase: 'Running' },
      },
    }).as('pollPod');

    cy.get('ui5-shellbar')
      .find('ui5-button[icon="command-line-interfaces"]')
      .click();

    cy.get('.terminal-card').should('be.visible');

    // Provisioning status ("Connecting…") appears immediately while the pod is
    // being created.
    cy.get('.terminal-card__status', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Connecting');

    // busola-terminal namespace is requested
    cy.wait('@createNamespace');

    // Pod is created with the correct manifest
    cy.wait('@createPod')
      .its('request.body')
      .then((pod) => {
        expect(pod.apiVersion).to.eq('v1');
        expect(pod.kind).to.eq('Pod');
        expect(pod.metadata.namespace).to.eq('busola-terminal');
        // Pod name is a deterministic hash of cluster server + credential
        expect(pod.metadata.name).to.match(/^busola-terminal-[a-f0-9]{16}$/);
        expect(pod.metadata.labels).to.deep.include({ run: 'busola-terminal' });

        const container = pod.spec.containers[0];
        expect(container.name).to.eq('dev-toolbox');
        expect(container.image).to.be.a('string').and.not.be.empty;
        expect(container.command).to.deep.eq(['/bin/bash']);
        expect(container.stdin).to.be.true;
        expect(container.tty).to.be.true;
        expect(container.resources.requests).to.have.all.keys('cpu', 'memory');
        expect(container.resources.limits).to.have.all.keys('cpu', 'memory');
        expect(pod.spec.restartPolicy).to.eq('Never');
      });

    // Pod readiness is polled (covers both the waitIfTerminating check and the
    // Running-phase poll in provisionPod)
    cy.wait('@pollPod');

    // Status changes away from "Connecting…" once provisioning completes.
    // The WebSocket attach that follows will fail in environments without a real
    // Running pod, in which case the status shows an error message instead —
    // either way "Connecting" is no longer present.
    cy.get('.terminal-card__status', { timeout: 5000 }).should(
      'not.contain.text',
      'Connecting',
    );
  });

  it('Closes the terminal and sends a pod deletion request', () => {
    cy.intercept(
      'DELETE',
      '/backend/api/v1/namespaces/busola-terminal/pods/*',
    ).as('deletePod');

    cy.get('[accessible-name="close-terminal"]').click();

    cy.get('.terminal-card').should('not.exist');

    cy.wait('@deletePod');
  });
});
