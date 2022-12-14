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
    cy.wait(500);
    cy.navigateTo('Configuration', 'Dns Entries');

    cy.contains('Create DNS Entry').click();

    // name
    cy.get('[ariaLabel="DNSEntry name"]:visible').type(DNS_ENTRY_NAME);

    // ttl
    cy.get('[placeholder^="Enter the time to live"]:visible')
      .clear()
      .type(TTL);

    // dns name
    cy.get('[placeholder^="Select the DNSName"]:visible')
      .type(DNS_NAME)
      .click();

    // target
    cy.get('[aria-label^="Enter the A record"]:visible').click();

    cy.contains('istio-ingressgateway').click();

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Inspect details', () => {
    cy.contains(DNS_ENTRY_NAME);

    cy.contains(`DNSName${DNS_NAME}`);

    cy.contains(`TTL${TTL}`);
  });

  it('Edit DNS Entry', () => {
    cy.contains('Edit').click();

    // name should be disabled for edit
    cy.get('[ariaLabel="DNSEntry name"]:visible').should(
      'have.attr',
      'readonly',
    );

    // change from A to CNAME
    cy.get('[placeholder^="Enter the A record"]:visible')
      .last()
      .type('e');

    cy.get('[placeholder^="Enter the CNAME record"]:visible').type(
      'xample.com',
    );

    cy.get('[role="dialog"]')
      .contains('button', 'Update')
      .click();

    cy.contains(/Targets.*, example\.com/);
  });

  it('Inspect list', () => {
    cy.inspectList('Entries', DNS_ENTRY_NAME);
  });
});
