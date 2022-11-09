/// <reference types="cypress" />
import 'cypress-file-upload';

const AP_NAME =
  'test-ap-' +
  Math.random()
    .toString()
    .substr(2, 8);
const ACTION = 'AUDIT';
const METHODS = 'GET';
const PATHS = '/user/profile/*';
const KEY = 'request.auth.claims[iss]';
const VALUES = 'https://test-value.com';

context('Test Authorization Policies', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtension(
      'SIDECARS',
      'examples/resources/istio/authorization-policies.yaml',
    );

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Authorization Policy', () => {
    cy.navigateTo('Istio', 'Authorization Policies');

    cy.getIframeBody()
      .contains('Create Authorization Policy')
      .click();

    // Action
    cy.getIframeBody()
      .find('[aria-label="Combobox input"]:visible', { log: false })
      .type(ACTION);

    // Name
    cy.getIframeBody()
      .find('[arialabel="AuthorizationPolicy name"]:visible', { log: false })
      .type(AP_NAME);

    // Rules
    cy.getIframeBody()
      .find('[aria-label="expand Rules"]:visible', { log: false })
      .contains('Add')
      .click();

    // When
    cy.getIframeBody()
      .find('[aria-label="expand When"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.rules.0.when.0.key"]:visible')
      .type(KEY);

    cy.getIframeBody()
      .find('[aria-label="expand Values"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.rules.0.when.0.values.0"]:visible')
      .type(VALUES);

    // To
    cy.getIframeBody()
      .find('[aria-label="expand To"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Methods"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.rules.0.to.0.operation.methods.0"]:visible')
      .type(METHODS);

    cy.getIframeBody()
      .find('[aria-label="expand Paths"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.rules.0.to.0.operation.paths.0"]:visible')
      .type(PATHS);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.getIframeBody()
      .contains(AP_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains(ACTION)
      .should('be.visible');

    cy.getIframeBody()
      .contains('Rule #1 to when')
      .click();

    cy.getIframeBody()
      .contains('To #1 methods paths')
      .click();

    cy.getIframeBody()
      .contains(KEY)
      .should('be.visible');

    cy.getIframeBody()
      .contains(VALUES)
      .should('be.visible');

    cy.getIframeBody()
      .contains('Operation')
      .should('be.visible');

    cy.getIframeBody()
      .contains(METHODS)
      .should('be.visible');

    cy.getIframeBody()
      .contains(PATHS)
      .should('be.visible');

    cy.getIframeBody()
      .contains('Matches all Pods in the Namespace')
      .should('be.visible');
  });

  it('Edit and check changes', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible', { log: false })
      .filterWithNoValue()
      .type('selector');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type('selector-value');

    cy.getIframeBody()
      .contains('selector=selector-value')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Matches all Pods in the Namespace')
      .should('not.be.visible');
  });

  it('Inspect list', () => {
    cy.inspectList('Authorization Policies', 'test-ap');
  });
});
