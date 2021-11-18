/// <reference types="cypress" />
import 'cypress-file-upload';

const CLIENT_NAME = 'test-oauth2-client';

context('Create a OAuth2 Client', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to OAuth2 Client', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('OAuth2 Clients')
      .click();
  });

  it('Create a Client', () => {
    cy.getIframeBody()
      .contains('Create OAuth2 Client')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[placeholder="OAuth2 Client Name"]')
      .clear()
      .type(CLIENT_NAME);

    cy.getIframeBody()
      .contains('label', 'ID Token')
      .click();

    cy.getIframeBody()
      .contains('label', 'Authorization Code')
      .click();

    cy.getIframeBody()
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
  });

  it('Checking details', () => {
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

    // don't check Secret section, as Secret may not be created yet
    // cy.getIframeBody()
    //   .contains('client_id')
    //   .should('be.visible');

    // cy.getIframeBody()
    //   .contains('client_secret')
    //   .should('be.visible');
  });

  it('Edit client', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .contains('label', 'ID Token')
      .click();

    cy.getIframeBody()
      .contains('label', 'Code')
      .click();

    cy.getIframeBody()
      .contains('label', 'Authorization Code')
      .click();

    cy.getIframeBody()
      .contains('label', 'Implicit')
      .click();

    cy.getIframeBody()
      .find('[value="openid"]')
      .clear()
      .type('email{downarrow}');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Update')
      .click();
  });

  it('Checking updates details', () => {
    cy.getIframeBody()
      .contains('Code')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Implicit')
      .should('be.visible');

    cy.getIframeBody()
      .contains('email')
      .should('be.visible');

    // don't check Secret section, as Secret may not be created yet
    // cy.getIframeBody()
    //   .contains('client_id')
    //   .should('be.visible');

    // cy.getIframeBody()
    //   .contains('client_secret')
    //   .should('be.visible');
  });
});
