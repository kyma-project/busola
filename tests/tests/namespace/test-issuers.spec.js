const ISSUER_NAME = `test-issuer-${Math.floor(Math.random() * 9999) + 1000}`;
const SECRET_NAME = `issuer-secret-${Math.floor(Math.random() * 9999) + 1000}`;

context('Test Issuers', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();

    cy.wait(500); // TODO
    cy.navigateTo('Configuration', 'Secrets');

    cy.contains('Create Secret').click();

    cy.get('[ariaLabel="Secret name"]:visible').type(SECRET_NAME);

    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.url().should('match', new RegExp(`/secrets/${SECRET_NAME}$`));
  });

  it('Create an issuer', () => {
    cy.getLeftNav()
      .contains('Issuers')
      .click();

    cy.contains('Create Issuer').click();

    cy.get('[ariaLabel="Issuer name"]:visible').type(ISSUER_NAME);

    cy.contains('Select Issuer type')
      .filter(':visible')
      .click();

    cy.contains('CA')
      .filter(':visible')
      .click();

    cy.get('[placeholder="Select Namespace"]:visible').type(
      Cypress.env('NAMESPACE_NAME'),
    );

    cy.contains('li', Cypress.env('NAMESPACE_NAME')).click();

    cy.get('[placeholder="Select name"]:visible').type(SECRET_NAME);

    cy.contains('li', SECRET_NAME).click();

    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.url().should('match', new RegExp(`/issuers/${ISSUER_NAME}$`));
  });

  it('Inspect issuer', () => {
    cy.contains(ISSUER_NAME);
  });

  it('Edit an issuer', () => {
    //wait for the issuer to update to not have version conflicts
    cy.get('[role="status"]').should('not.have.text', 'Unknown');

    cy.contains('Edit').click();

    cy.contains('CA').click();

    cy.contains('ACME').click();

    cy.get('[placeholder="ACME Server URL"]:visible').type('server.com');

    cy.get('[placeholder^="Email address"]:visible').type('mail@server.com');

    cy.contains('Include Domains').click();

    cy.get('[placeholder^="Domain"]:visible').type(
      'other.server.com{enter}another.server.com',
    );

    cy.contains('Update').click();
  });

  it('Inspect updated issuer', () => {
    cy.contains(ISSUER_NAME);
    cy.contains('server.com');
    cy.contains('mail@server.com');
    cy.contains('other.server.com');
    cy.contains('another.server.com');
  });

  it('Inspect issuer list', () => {
    cy.inspectList('Issuers', ISSUER_NAME);
  });
});
