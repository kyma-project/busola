/// <reference types="cypress" />
import 'cypress-file-upload';

const DNS_ENTRY_NAME =
  'dns-entry-' +
  Math.random()
    .toString()
    .substr(2, 8);

const DNS_NAME =
  'dns-name-' +
  Math.random()
    .toString()
    .substr(2, 8);

context('Create a DNS Entry', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('DNS Entries node should be present', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('DNS Entries')
      .click();
  });

  it('Create DNS Entry', () => {
    cy.getIframeBody()
      .contains('Create DNS Entry')
      .click();

    // name
    cy.getIframeBody()
      .find('[placeholder="DNS Entry Name"]')
      .filter(':visible', { log: false })
      .clear()
      .type(DNS_ENTRY_NAME);
  });
});
