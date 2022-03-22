/// <reference types="cypress" />
import 'cypress-file-upload';

const random = Math.random()
  .toString()
  .substr(2, 8);

const DNS_ENTRY_NAME = 'dns-entry-' + random;
const DNS_NAME = 'dns-name-' + random;
const TTL = 200;

context('Test DNS Entries', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create DNS Entry', () => {
    cy.navigateTo('Configuration', 'DNS Entries');

    cy.getIframeBody()
      .contains('Create DNS Entry')
      .click();

    // name
    cy.getIframeBody()
      .find('[ariaLabel="DNS Entry name"]:visible')
      .type(DNS_ENTRY_NAME);

    // ttl
    cy.getIframeBody()
      .find('[placeholder^="Enter the time to live"]:visible')
      .clear()
      .type(TTL);

    // dns name
    cy.getIframeBody()
      .find('[placeholder^="Select the DNS name"]:visible')
      .type(DNS_NAME)
      .click();

    // target
    cy.getIframeBody()
      .find('[aria-label^="Enter the A record"]:visible')
      .click();

    cy.getIframeBody()
      .contains('istio-ingressgateway')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Inspect details', () => {
    cy.getIframeBody().contains(DNS_ENTRY_NAME);

    cy.getIframeBody().contains(`DNS Name${DNS_NAME}`);

    cy.getIframeBody().contains(`TTL${TTL}`);
  });

  it('Edit DNS Entry', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    // name should be disabled for edit
    cy.getIframeBody()
      .find('[ariaLabel="DNS Entry name"]:visible')
      .should('have.attr', 'readonly');

    // change from A to CNAME
    cy.getIframeBody()
      .find('[placeholder^="Enter the A record"]:visible')
      .last()
      .type('e');
    cy.getIframeBody()
      .find('[placeholder^="Enter the CNAME record"]:visible')
      .type('xample.com');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Update')
      .click();

    cy.getIframeBody().contains(/Targets.*, example\.com/);
  });

  it('Inspect list', () => {
    cy.inspectList('Entries', DNS_ENTRY_NAME);
  });
});
