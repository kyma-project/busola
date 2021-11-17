/// <reference types="cypress" />
import 'cypress-file-upload';

const CLIENT_NAME = 'test-oauth2-client';

context('Create a OAuth2 Client', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a OAuth2 Client', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('OAuth2 Clients')
      .click();

    cy.getIframeBody()
      .contains('Create OAuth2 Client')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('.advanced-form')
      .find('[placeholder="OAuth2 Client Name"]')
      .clear()
      .type(CLIENT_NAME);

    cy.getIframeBody()
      .find('.advanced-form')
      .contains('label', 'Token')
      .click();

    cy.getIframeBody()
      .find('.advanced-form')
      .contains('label', 'Authorization Code')
      .click();

    cy.getIframeBody()
      .find('.advanced-form')
      .find('[placeholder="OAuth2 scope"]')
      .clear()
      .type('openid{downarrow}');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    // cy.getIframeBody()
    //   .contains('test-oauth2-client')
    //   .click();

    // cy.getIframeBody()
    //   .find('span', 'ID Token', { timeout: 5000 })
    //   .should('have.text', 'ID Token');

    cy.wait(4000);
  });
});
// it('Create a OAuth2 Clients', () => {
//   cy.get('[data-testid=luigi-topnav-logo]').click();

//   cy.getLeftNav()
//     .contains('Namespaces')
//     .click();

//   cy.goToNamespaceDetails();

//   cy.getLeftNav()
//     .find('[data-testid=oauth2clients_oauthclients]')
//     .click();

//   cy.getIframeBody()
//     .contains('Create OAuth2 Client')
//     .click();

//   cy.getIframeBody()
//     .find('[placeholder="Client name"]')
//     .clear()
//     .type(CLIENT_NAME);

//   cy.getIframeBody()
//     .contains('label', 'ID token')
//     .prev('input')
//     .click({ force: true });

//   cy.getIframeBody()
//     .contains('label', 'Client credentials')
//     .prev('input')
//     .click({ force: true });

//   cy.getIframeBody()
//     .find('[placeholder="Enter multiple values separated by comma"]')
//     .clear()
//     .type(CLIENT_NAME);

//   cy.getIframeBody()
//     .contains('label', 'Scopes')
//     .click();

//   cy.getIframeBody()
//     .find('[role="dialog"]')
//     .contains('button', 'Create')
//     .click();

//   cy.getIframeBody()
//     .contains('a', CLIENT_NAME)
//     .click({ force: true });

//   cy.getIframeBody()
//     .contains(CLIENT_NAME)
//     .should('be.visible');
// });
