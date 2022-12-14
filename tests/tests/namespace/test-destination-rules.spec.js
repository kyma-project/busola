/// <reference types="cypress" />
import 'cypress-file-upload';

const DR_NAME =
  'test-dr-' +
  Math.random()
    .toString()
    .substr(2, 8);
const HOST = 'ratings.prod.svc.cluster.local';
const SELECTOR = 'selector=selector-value';
const BALANCER = 'simple';
const SIMPLE = 'LEAST_CONN';

context('Test Destination Rules', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions(['examples/resources/istio/destination-rules.yaml']);

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Destination Rule', () => {
    cy.navigateTo('Istio', 'Destination Rules');

    cy.contains('Create Destination Rule').click();

    cy.get('[ariaLabel="DestinationRule name"]:visible', { log: false }).type(
      DR_NAME,
    );

    cy.get('[data-testid="spec.host"]:visible').type(HOST);

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.contains('h3', DR_NAME).should('be.visible');
  });

  it('Check Destination Rule details', () => {
    cy.contains(HOST).should('be.visible');

    cy.contains('Subsets').should('not.exist');

    cy.contains('Workload Selector').should('not.exist');
  });

  it('Edit Destination Rule', () => {
    cy.contains('Edit').click();

    cy.get('[ariaLabel="DestinationRule name"]:visible', { log: false }).should(
      'have.attr',
      'readonly',
    );

    // selector
    cy.get('[placeholder="Enter key"]:visible', { log: false })
      .filterWithNoValue()
      .type('selector');

    cy.get('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type('selector-value');

    // traffic policy
    // could be uncomment after resolving: https://github.com/kyma-project/busola/issues/2088
    // cy
    //   .get('[aria-label="expand Traffic Policy"]:visible', { log: false })
    //   .click();

    // cy
    //   .get('[aria-label="expand Load Balancer"]:visible', { log: false })
    //   .click();

    // cy
    //   .get('[aria-label="Combobox input"]:visible', { log: false })
    //   .type(BALANCER);

    // cy
    //   .get('[aria-label="Combobox input"]', {
    //     log: false,
    //   })
    //   .eq(1)
    //   .type(SIMPLE);

    cy.get('[role=dialog]')
      .contains('button', 'Update')
      .click();

    // changed details
    cy.contains(SELECTOR);
    // After resolving: https://github.com/kyma-project/busola/issues/2088 we need to add checking loadBalancer value
  });

  it('Check the Destination Rule list', () => {
    cy.inspectList('Destination Rules', DR_NAME);
  });
});
