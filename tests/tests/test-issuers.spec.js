const ISSUER_NAME = `test-issuer-${Math.floor(Math.random() * 9999) + 1000}`;
const SECRET_NAME = `issuer-secret-${Math.floor(Math.random() * 9999) + 1000}`;

context('Test Issuers', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();

    cy.navigateTo('Configuration', 'Secrets');

    cy.getIframeBody()
      .contains('Create Secret')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Secret Name"]:visible')
      .type(SECRET_NAME);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.url().should('match', new RegExp(`/secrets/details/${SECRET_NAME}$`));
  });

  it('Create an issuer', () => {
    cy.getLeftNav()
      .contains('Issuers')
      .click();

    cy.getIframeBody()
      .contains('Create Issuer')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Issuer Name"]:visible')
      .type(ISSUER_NAME);

    cy.getIframeBody()
      .contains('Select issuer type')
      .filter(':visible')
      .click();

    cy.getIframeBody()
      .contains('CA')
      .filter(':visible')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Select Namespace"]:visible')
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.getIframeBody()
      .contains('li', Cypress.env('NAMESPACE_NAME'))
      .click();

    cy.getIframeBody()
      .find('[placeholder="Select name"]:visible')
      .type(SECRET_NAME);

    cy.getIframeBody()
      .contains('li', SECRET_NAME)
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.url().should('match', new RegExp(`/issuers/details/${ISSUER_NAME}$`));
  });

  it('Inspect issuer', () => {
    cy.getIframeBody().contains(ISSUER_NAME);
  });

  it('Edit an issuer', () => {
    //wait for the issuer to update to not have version conflicts
    cy.getIframeBody()
      .find('[role="status"]')
      .should('not.have.text', 'Unknown');

    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('CA')
      .click();

    cy.getIframeBody()
      .contains('ACME')
      .click();

    cy.getIframeBody()
      .find('[placeholder="ACME Server URL"]:visible')
      .type('server.com');

    cy.getIframeBody()
      .find('[placeholder^="Email address"]:visible')
      .type('mail@server.com');

    cy.getIframeBody()
      .find('[placeholder^="Domain"]:visible')
      .type('other.server.com{enter}another.server.com');

    cy.getIframeBody()
      .contains('Update')
      .click();
  });

  it('Inspect updated issuer', () => {
    cy.getIframeBody().contains(ISSUER_NAME);
    cy.getIframeBody().contains('server.com');
    cy.getIframeBody().contains('mail@server.com');
    cy.getIframeBody().contains('other.server.com');
    cy.getIframeBody().contains('another.server.com');
  });

  it('Inspect issuer list', () => {
    cy.getIframeBody()
      .contains('Issuers')
      .click();

    cy.getIframeBody().contains(ISSUER_NAME);
  });

  it('Delete issuer', () => {
    cy.getLeftNav()
      .contains('Issuers')
      .click();

    cy.url().should('match', /issuers$/);

    cy.getIframeBody()
      .contains('tr', ISSUER_NAME)
      .find('[aria-label="Delete"]')
      .click();

    cy.getIframeBody()
      .contains('.fd-message-box button', 'Delete')
      .click();
  });
});
