/// <reference types="cypress" />
import 'cypress-file-upload';

function openSearchWithSlashShortcut() {
  cy.get('body').type('/');
}

const FUNCTION_NAME = 'test-function';
const API_RULE_NAME = 'test-api-rule';
const API_RULE_HOST = API_RULE_NAME + '-host';
const API_RULE_PATH = '/test-path';
const API_RULE_DEFAULT_PATH = '/.*';

let initialApiRule;

context('Test API Rules in the Function details view', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtension('API RULES', 'examples/resources/gateway/apirules.yaml');
    cy.mockExtension(
      'FUNCTIONS',
      'examples/resources/serverless/functions.yaml',
    );

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Go to details of the simple Function', () => {
    cy.navigateTo('Workloads', 'Functions');

    cy.getIframeBody()
      .contains('a', FUNCTION_NAME)
      .filter(':visible', { log: false })
      .first()
      .click({ force: true });

    cy.getIframeBody()
      .find('[role="status"]')
      .contains('span', /running/i, { timeout: 60 * 3000 });
  });

  it('Create an API Rule for the Function', () => {
    cy.getIframeBody()
      .contains('Configuration')
      .click();

    cy.getIframeBody()
      .contains('Create API Rule')
      .click();

    // Name
    cy.getIframeBody()
      .find('[ariaLabel="APIRule name"]:visible', { log: false })
      .type(API_RULE_NAME);

    // Service
    cy.getIframeBody()
      .find('[aria-label="expand Service"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[aria-label="Choose Service"]:visible', { log: false })
      .first()
      .type(FUNCTION_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter the port number"]:visible', { log: false })
      .clear()
      .type(80);

    // Host
    cy.getIframeBody()
      .find('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type(API_RULE_HOST);

    // Rules
    cy.getIframeBody()
      .find('[aria-label="expand Rules"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Access Strategies"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.rules.0.accessStrategies.0.handler"]:visible')
      .type('allow');

    cy.getIframeBody()
      .find('[aria-label="expand Methods"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.rules.0.methods.0"]:visible')
      .type('POST');

    // cy.getIframeBody()
    //   .contains('Allow')
    //   .filter(':visible', { log: false })
    //   .click();

    // cy.getIframeBody()
    //   .contains('OAuth2')
    //   .click();

    // cy.getIframeBody()
    //   .find('[placeholder="Required scope"]:visible', { log: false })
    //   .type('read');

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Check the API Rule details', () => {
    cy.getIframeBody()
      .contains(API_RULE_NAME)
      .click();

    cy.getIframeBody()
      .contains(API_RULE_DEFAULT_PATH)
      .should('exist');

    cy.getIframeBody()
      .contains('OAuth2')
      .should('exist');

    cy.getIframeBody()
      .contains(API_RULE_PATH)
      .should('not.exist');

    cy.getIframeBody()
      .contains('Allow')
      .should('not.exist');
  });

  it('Edit the API Rule', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody().contains(API_RULE_NAME);

    cy.getIframeBody()
      .contains('Add Rule')
      .click();

    cy.getIframeBody()
      .contains('Rule 2')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter the path"]:visible', { log: false })
      .type(API_RULE_PATH);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();
  });

  it('Check the edited API Rule details', () => {
    cy.getIframeBody()
      .contains(API_RULE_NAME)
      .click();

    cy.getIframeBody()
      .contains(API_RULE_DEFAULT_PATH)
      .should('exist');

    cy.getIframeBody()
      .contains('OAuth2')
      .should('exist');

    cy.getIframeBody()
      .contains(API_RULE_PATH)
      .should('exist');

    cy.getIframeBody()
      .contains('Allow')
      .should('exist');
  });

  it('Inspect list using slash shortcut', () => {
    cy.navigateTo('Discovery and Network', 'API Rules');

    openSearchWithSlashShortcut();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="open-search"]')
      .type(API_RULE_NAME);

    cy.getIframeBody()
      .contains(API_RULE_NAME)
      .should('be.visible');
  });
});
