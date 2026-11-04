/// <reference types="cypress" />

import jsyaml from 'js-yaml';

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

const NAMESPACE_NAME = 'terminal-test';
const POD_NAME = 'nginx-terminal';

context('Test Busola Terminal exec into Pod', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.intercept(configRequest, config__withTerminal);
    cy.loginAndSelectCluster();

    cy.goToClusterOverview();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.loadFiles('test-terminal-exec-pod.yaml').then((resources) => {
      const input = resources.map((r) => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .find('.status-message-success')
      .should('have.length', 1);
  });

  it('Go to pod view and check if Exec button is visible', () => {
    cy.loginAndSelectCluster();

    cy.navigateTo('Namespaces');

    cy.typeInSearch(NAMESPACE_NAME);

    cy.clickListLink(NAMESPACE_NAME);

    cy.navigateTo('Workloads', 'Pods');

    cy.get('ui5-table-row', { timeout: 60000 })
      .contains(POD_NAME)
      .parents('ui5-table-row')
      .should('contain.text', 'Running');

    cy.get('ui5-table-row').contains(POD_NAME).click();
    cy.contains('ui5-button', 'Exec').should('be.visible');
  });

  it('Run exec and check if dialog has all needed inputs', () => {
    cy.contains('ui5-button', 'Exec').should('be.visible').click();

    cy.get('ui5-dialog[open]').within(() => {
      cy.contains('Command');
      cy.contains('Container');
      cy.get('ui5-input').should('have.value', 'sh');
      cy.get('ui5-select').should('exist');
      cy.contains('ui5-button', 'Cancel');
    });
  });

  it('Check if exec is properly works', () => {
    cy.stubTerminalWebSocket(
      '/ws/api/v1/namespaces/terminal-test/pods/nginx-terminal/exec',
    );

    cy.get('ui5-dialog[open]').contains('ui5-button', 'Exec').click();

    cy.get('.terminal-card').should('be.visible');

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

  it('Closes the terminal', () => {
    cy.get('[accessible-name="close-terminal"]').click();
  });
});
