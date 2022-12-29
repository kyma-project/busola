/// <reference types="cypress" />
import 'cypress-file-upload';

const SE_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

const RESOLUTION = 'STATIC';
const LOCATION = 'MESH_EXTERNAL';
const HOST = 'test.com';
const ADDRESS = '192.192.192.192/24';
const WORKLOAD_SELECTOR_LABEL = 'test=selector-value';

context('Test Service Entries', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions(['examples/resources/istio/service-entries.yaml']);

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Service Entry', () => {
    cy.navigateTo('Istio', 'Service Entries');

    cy.contains('Create Service Entry').click();

    cy.contains('Advanced').click();

    // Name
    cy.get('[arialabel="ServiceEntry name"]:visible', { log: false }).type(
      SE_NAME,
    );

    // Hosts
    cy.get('[aria-label="expand Hosts"]:visible', { log: false }).click();

    cy.get('[data-testid="spec.hosts.0"]:visible').type(HOST);

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .eq(1)
      .type(RESOLUTION);

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type(LOCATION);

    cy.get('[aria-label="expand Addresses"]:visible', { log: false }).click();

    cy.get('[placeholder="For example, 127.0.0.1"]:visible', {
      log: false,
    }).type(ADDRESS);

    cy.get('[placeholder="Enter key"]:visible', { log: false })
      .filterWithNoValue()
      .type('test');

    cy.get('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type('selector-value');

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.contains('h3', SE_NAME).should('be.visible');
  });

  it('Check the Service Entry details', () => {
    cy.get('#content-wrap')
      .should('include.text', RESOLUTION)
      .and('include.text', LOCATION)
      .and('include.text', HOST)
      .and('include.text', ADDRESS);

    cy.contains(WORKLOAD_SELECTOR_LABEL);
  });

  it('Check the Service Entries list', () => {
    cy.inspectList('Service Entries', SE_NAME);
    cy.contains(RESOLUTION);
  });
});
