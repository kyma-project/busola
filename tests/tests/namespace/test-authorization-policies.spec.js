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
    cy.mockExtensions(['examples/resources/istio/authorization-policies.yaml']);

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Authorization Policy', () => {
    cy.navigateTo('Istio', 'Authorization Policies');

    cy.contains('Create Authorization Policy').click();

    // Action
    cy.get('[aria-label="Combobox input"]:visible', { log: false }).type(
      ACTION,
    );

    // Name
    cy.get('[arialabel="AuthorizationPolicy name"]:visible', {
      log: false,
    }).type(AP_NAME);

    // Rules
    cy.get('[aria-label="expand Rules"]:visible', { log: false })
      .contains('Add')
      .click();

    // When
    cy.get('[aria-label="expand When"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.get('[data-testid="spec.rules.0.when.0.key"]:visible').type(KEY);

    cy.get('[aria-label="expand Values"]:visible', { log: false }).click();

    cy.get('[data-testid="spec.rules.0.when.0.values.0"]:visible').type(VALUES);

    // To
    cy.get('[aria-label="expand To"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.get('[aria-label="expand Methods"]:visible', { log: false }).click();

    cy.get(
      '[data-testid="spec.rules.0.to.0.operation.methods.0"]:visible',
    ).type(METHODS);

    cy.get('[aria-label="expand Paths"]:visible', { log: false }).click();

    cy.get('[data-testid="spec.rules.0.to.0.operation.paths.0"]:visible').type(
      PATHS,
    );

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.contains(AP_NAME).should('be.visible');

    cy.contains(ACTION).should('be.visible');

    cy.contains('Matches all Pods in the Namespace').should('be.visible');

    // cy.wait(500); // TODO check on CI

    cy.contains('Rule #1 to when', { timeout: 10000 }).click();

    cy.contains('To #1 methods paths', { timeout: 10000 }).click();

    cy.contains(PATHS).should('be.visible');

    cy.contains(KEY).should('be.visible');

    cy.contains(VALUES).should('be.visible');

    cy.contains('Operation').should('be.visible');

    cy.contains(METHODS).should('be.visible');
  });

  it('Edit and check changes', () => {
    cy.contains('Edit').click();

    cy.get('[placeholder="Enter key"]:visible', { log: false })
      .filterWithNoValue()
      .type('sel');

    cy.get('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type('selector-value');

    cy.get('[role="dialog"]')
      .contains('button', 'Update')
      .click();

    cy.contains('sel=selector-value').should('be.visible');

    cy.contains('Matches all Pods in the Namespace').should('not.exist');
  });

  it('Inspect list', () => {
    cy.inspectList('Authorization Policies', 'test-ap');
  });
});
