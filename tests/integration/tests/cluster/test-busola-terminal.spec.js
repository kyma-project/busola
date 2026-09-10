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

  it('Opens the terminal and waits for it to connect', () => {
    cy.get('ui5-shellbar')
      .find('ui5-button[icon="command-line-interfaces"]')
      .click();

    cy.get('.terminal-card').should('be.visible');

    // Wait for provisioning status to appear (pod is being created)
    cy.get('.terminal-card__status', { timeout: 10000 }).should('be.visible');

    // Wait for provisioning to finish — pod is ready and WebSocket is connected
    cy.get('.terminal-card__status', { timeout: 120000 }).should('not.exist');
  });

  it('Types a command and verifies the terminal responds', () => {
    cy.get('.xterm-helper-textarea').type('ls{enter}', { force: true });

    cy.wait(3000);

    // Verify terminal is still in a valid state (no error or reconnecting status)
    cy.get('.terminal-card').should('be.visible');
    cy.get('.terminal-card__status').should('not.exist');
  });

  it('Closes the terminal and verifies the pod deletion request is sent', () => {
    cy.intercept(
      'DELETE',
      '/backend/api/v1/namespaces/busola-terminal/pods/*',
    ).as('deletePod');

    cy.get('[accessible-name="close-terminal"]').click();

    cy.get('.terminal-card').should('not.exist');

    cy.wait('@deletePod');
  });

  it('Verifies the terminal pod is removed from the namespace', () => {
    cy.goToNamespaceDetails('busola-terminal');

    cy.navigateTo('Workloads', 'Pods');

    // Wait for any remaining terminal pod to be fully deleted (may be in Terminating state)
    cy.get('ui5-table', { timeout: 30000 }).should(
      'not.contain.text',
      'busola-terminal-',
    );
  });
});
