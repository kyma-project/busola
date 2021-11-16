/// <reference types="cypress" />
import 'cypress-file-upload';

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
      .type('test-oauth2-client');

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
