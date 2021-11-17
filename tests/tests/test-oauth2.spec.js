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
      .contains('label', 'Scope')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains(CLIENT_NAME)
      .click();

    cy.getIframeBody()
      .contains(CLIENT_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains('ID Token')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Authorization Code')
      .should('be.visible');

    cy.getIframeBody()
      .contains('openid')
      .should('be.visible');

    cy.getIframeBody()
      .contains('client_id')
      .should('be.visible');

    cy.getIframeBody()
      .contains('client_secret')
      .should('be.visible');

    cy.wait(4000000);
  });
});
