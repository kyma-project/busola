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

context('Test Terminal Banner', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.intercept(configRequest, config__withTerminal);
    cy.loginAndSelectCluster();
  });

  it('Terminal banner is rendered on the cluster overview page', () => {
    cy.goToClusterOverview();

    cy.get('.banner-carousel').then(($carousel) => {
      const terminalBannerIndex = $carousel
        .children()
        .toArray()
        .findIndex((banner) =>
          banner.querySelector('ui5-card[accessible-name="Try the terminal"]'),
        );

      expect(terminalBannerIndex).to.be.greaterThan(-1);
      $carousel[0].navigateTo(terminalBannerIndex);
    });

    cy.get('ui5-card[accessible-name="Try the terminal"]').should('be.visible');
  });

  it('"Open Terminal" button opens the terminal panel', () => {
    cy.goToClusterOverview();

    cy.contains('ui5-button', 'Open Terminal').click();

    cy.get('.terminal-card').should('be.visible');
  });
});

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
    // pod stays Pending until we flip this, so "Connecting…" is guaranteed to show
    let podReady = false;

    // Scoped to busola-terminal so unrelated namespace POSTs pass through to the
    // real cluster unaffected.
    cy.intercept('POST', '/backend/api/v1/namespaces', (req) => {
      if (req.body?.metadata?.name === 'busola-terminal') {
        req.reply({
          statusCode: 200,
          body: {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: { name: 'busola-terminal' },
          },
        });
      }
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

    // returns Pending until podReady flips, avoids waiting for a real image pull (up to 120s)
    cy.intercept(
      'GET',
      '/backend/api/v1/namespaces/busola-terminal/pods/*',
      (req) => {
        req.reply({
          statusCode: 200,
          body: {
            metadata: { deletionTimestamp: null },
            status: { phase: podReady ? 'Running' : 'Pending' },
          },
        });
      },
    );

    cy.stubTerminalWebSocket('/ws/api/v1/namespaces/busola-terminal/pods/');

    cy.get('ui5-shellbar')
      .find('ui5-button[icon="command-line-interfaces"]')
      .click();

    cy.get('.terminal-card').should('be.visible');

    // busola-terminal namespace is requested
    cy.wait('@createNamespace');

    // Pod is created with the correct manifest
    cy.wait('@createPod')
      .its('request.body')
      .then((pod) => {
        expect(pod.apiVersion).to.eq('v1');
        expect(pod.kind).to.eq('Pod');
        expect(pod.metadata.namespace).to.eq('busola-terminal');
        // Pod name is a SHA-256 hash of cluster server + credential, first 16 hex chars.
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

    // pod is being created
    cy.get('.terminal-card__status').should(
      'contain.text',
      'Creating Terminal...',
    );

    // flip to Running, the next poll resolves and the WebSocket connects
    cy.then(() => {
      podReady = true;
    });

    // wait for the connected banner, then check the status is gone
    cy.get('.xterm-rows', { timeout: 15000 }).should(
      'contain.text',
      'Connected to terminal',
    );
    cy.get('.terminal-card__status').should('not.exist');
  });

  it('Accepts keyboard input and displays output from the remote shell', () => {
    cy.sendTerminalEnter();

    cy.get('.xterm-rows', { timeout: 5000 }).should(
      'contain.text',
      'bin  etc  usr',
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
