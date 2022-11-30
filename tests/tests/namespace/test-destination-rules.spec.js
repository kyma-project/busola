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
    cy.mockExtension(
      'DESTINATION RULES',
      'examples/resources/istio/destination-rules.yaml',
    );

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Destination Rule', () => {
    cy.navigateTo('Istio', 'Destination Rules');

    cy.getIframeBody()
      .contains('Create Destination Rule')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="DestinationRule name"]:visible', { log: false })
      .type(DR_NAME);

    cy.getIframeBody()
      .find('[data-testid="spec.host"]:visible')
      .type(HOST);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', DR_NAME)
      .should('be.visible');
  });

  it('Check Destination Rule details', () => {
    cy.getIframeBody()
      .contains(HOST)
      .should('be.visible');

    cy.getIframeBody()
      .contains('Subsets')
      .should('not.exist');

    cy.getIframeBody()
      .contains('Workload Selector')
      .should('not.exist');
  });

  it('Edit Destination Rule', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="DestinationRule name"]:visible', { log: false })
      .should('have.attr', 'readonly');

    // selector
    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible', { log: false })
      .filterWithNoValue()
      .type('selector');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type('selector-value');

    // traffic policy
    cy.getIframeBody()
      .find('[aria-label="expand Traffic Policy"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Load Balancer"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[aria-label="Combobox input"]:visible', { log: false })
      .type(BALANCER);

    cy.getIframeBody()
      .find('[aria-label="Combobox input"]', {
        log: false,
      })
      .eq(1)
      .type(SIMPLE);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();

    // changed details
    cy.getIframeBody().contains(SELECTOR);
    cy.getIframeBody().contains(SIMPLE);
  });

  it('Check the Destination Rule list', () => {
    cy.inspectList('Destination Rules', DR_NAME);
  });
});
