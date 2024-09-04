const { chooseComboboxOption } = require('../../support/helpers');

const ISSUER_NAME = `test-issuer-${Math.floor(Math.random() * 9999) + 1000}`;
const SECRET_NAME = `issuer-secret-${Math.floor(Math.random() * 9999) + 1000}`;

context('Test Issuers', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();

    cy.navigateTo('Configuration', 'Secrets');

    cy.openCreate();

    cy.get('[aria-label="Secret name"]:visible')
      .find('input')
      .click()
      .type(SECRET_NAME, { force: true });

    cy.saveChanges('Create');

    cy.url().should('match', new RegExp(`/secrets/${SECRET_NAME}`));
  });

  it('Create an issuer', () => {
    cy.getLeftNav()
      .contains('Issuers')
      .click();

    cy.openCreate();

    cy.get('[aria-label="Issuer name"]:visible')
      .find('input')
      .click()
      .type(ISSUER_NAME, { force: true });

    chooseComboboxOption('[placeholder="Select Issuer type"]', 'CA');

    chooseComboboxOption(
      '[placeholder="Select Namespace"]',
      Cypress.env('NAMESPACE_NAME'),
    );

    cy.wait(500);

    chooseComboboxOption('[placeholder="Select name"]', SECRET_NAME);

    cy.saveChanges('Create');

    cy.url().should('match', new RegExp(`/issuers/${ISSUER_NAME}`));
  });

  it('Inspect issuer', () => {
    cy.getMidColumn().contains(ISSUER_NAME);
  });

  it('Edit an issuer', () => {
    cy.inspectTab('Edit');

    cy.get('[placeholder="Select Issuer type"]')
      .filter(':visible')
      .find('input')
      .click()
      .clear()
      .type('ACME');

    cy.get('ui5-li:visible')
      .contains('ACME')
      .find('li')
      .click({ force: true });

    cy.get('[placeholder="ACME Server URL"]:visible')
      .find('input')
      .type('server.com', { force: true });

    cy.get('[placeholder^="Email address"]:visible')
      .find('input')
      .type('mail@server.com', { force: true });

    cy.contains('Include Domains').click();

    cy.get('[placeholder^="Domain"]:visible')
      .find('input')
      .type('other.server.com{enter}another.server.com', { force: true });

    cy.saveChanges('Edit');
    cy.getMidColumn().inspectTab('View');
  });

  it('Inspect updated issuer', () => {
    cy.getMidColumn().contains(ISSUER_NAME);
    cy.getMidColumn().contains('server.com');
    cy.getMidColumn().contains('mail@server.com');
    cy.getMidColumn().contains('other.server.com');
    cy.getMidColumn().contains('another.server.com');
  });

  it('Inspect issuer list', () => {
    cy.inspectList(ISSUER_NAME);
  });
});
