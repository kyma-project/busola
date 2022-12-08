/// <reference types="cypress" />
import 'cypress-file-upload';

function openSearchWithSlashShortcut() {
  cy.get('body').type('/');
}

const random = Math.floor(Math.random() * 9999) + 1000;
const FUNCTION_NAME = 'test-function';
const API_RULE_NAME = 'test-api-rule';
const API_RULE_SUBDOMAIN = API_RULE_NAME + '-' + random;
const API_RULE_PATH = '/test-path';
const API_RULE_DEFAULT_PATH = '/.*';

context('Test API Rules in the Function details view', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions([
      'examples/resources/serverless/functions.yaml',
      'examples/resources/gateway/apirules.yaml',
    ]);

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Go to details of the simple Function', () => {
    cy.navigateTo('Workloads', 'Functions');

    cy.contains('a', FUNCTION_NAME)
      .filter(':visible', { log: false })
      .first()
      .click({ force: true });

    cy.get('[role="status"]').contains('span', /running/i, {
      timeout: 60 * 300,
    });
  });

  it('Create an API Rule for the Function', () => {
    cy.getLeftNav()
      .contains('Discovery and Network')
      .click();

    cy.getLeftNav()
      .contains('API Rules')
      .click();

    cy.contains('Create API Rule').click();

    // Name
    cy.get('[ariaLabel="APIRule name"]:visible', { log: false }).type(
      API_RULE_NAME,
    );

    // Service
    cy.get('[aria-label="Choose Service"]:visible', { log: false })
      .first()
      .type(FUNCTION_NAME);

    cy.get('[aria-label="Choose Service"]:visible', { log: false })
      .first()
      .next()
      .find('[aria-label="Combobox input arrow"]:visible', { log: false })
      .click();

    cy.get('[data-testid="spec.service.port"]:visible', { log: false })
      .clear()
      .type(80);

    // Host
    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type('*');

    cy.get('span', { log: false })
      .contains(/^\*$/i)
      .first()
      .click();

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type('{home}{rightArrow}{backspace}');

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type(API_RULE_SUBDOMAIN);

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .next()
      .find('[aria-label="Combobox input arrow"]:visible', { log: false })
      .click();

    // Rules
    // > Access Strategies

    cy.get('[data-testid="spec.rules.0.accessStrategies.0.handler"]:visible')
      .clear()
      .type('oauth2_introspection');

    cy.get('[data-testid="spec.rules.0.accessStrategies.0.handler"]:visible', {
      log: false,
    })
      .find('span')
      .find('[aria-label="Combobox input arrow"]:visible', { log: false })
      .click();

    cy.get('[data-testid="select-dropdown"]:visible').click();

    cy.get('[role="list"]')
      .contains('required_scope')
      .click();

    cy.get('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type('read');

    // > Methods

    cy.get('[data-testid="spec.rules.0.methods.1"]:visible').type('POST');

    cy.get('[data-testid="spec.rules.0.methods.1"]:visible', {
      log: false,
    })
      .find('span')
      .find('[aria-label="Combobox input arrow"]:visible', { log: false })
      .click();

    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Check the API Rule details', () => {
    cy.contains(API_RULE_NAME).click();

    cy.contains(API_RULE_DEFAULT_PATH).should('exist');

    cy.contains('Rules #1', { timeout: 10000 }).click();

    cy.contains('oauth2_introspection').should('exist');

    cy.contains(API_RULE_PATH).should('not.exist');

    cy.contains('allow').should('not.exist');
  });

  it('Edit the API Rule', () => {
    cy.contains('Edit').click();

    cy.contains(API_RULE_NAME);

    // Rules
    cy.get('[aria-label="expand Rules"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.get('[aria-label="expand Rule"]:visible', { log: false })
      .first()
      .click();

    // > Access Strategies
    cy.get('[aria-label="expand Access Strategies"]:visible', { log: false })
      .first()
      .scrollIntoView();

    cy.get('[data-testid="select-dropdown"]:visible')
      .scrollIntoView()
      .click();

    cy.get('[role="list"]')
      .contains('required_scope')
      .click();

    cy.get('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type('write');

    // > Methods

    cy.get('[data-testid="spec.rules.1.methods.0"]:visible')
      .clear()
      .type('POST');

    cy.get('[data-testid="spec.rules.1.path"]:visible')
      .clear()
      .type(API_RULE_PATH);

    cy.get('[role=dialog]')
      .contains('button', 'Update')
      .click();
  });

  it('Check the edited API Rule details', () => {
    cy.contains(API_RULE_NAME).click();

    cy.contains(API_RULE_DEFAULT_PATH).should('exist');

    cy.contains('Rules #1', { timeout: 10000 }).click();

    cy.contains('Rules #2', { timeout: 10000 }).click();

    cy.contains(API_RULE_PATH).should('exist');

    cy.contains('allow').should('exist');
  });

  it('Inspect list using slash shortcut', () => {
    cy.getLeftNav()
      .contains('API Rules')
      .click();

    openSearchWithSlashShortcut();

    cy.get('[role="search"] [aria-label="open-search"]').type(API_RULE_NAME);

    cy.contains(API_RULE_NAME).should('be.visible');
  });
});
