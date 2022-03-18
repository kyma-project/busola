/// <reference types="cypress" />
import 'cypress-file-upload';
import { deleteFromGenericList } from '../../support/helpers';

const CLIENT_NAME = 'test-oauth2-client';

context('Test OAuth2 Clients', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Client', () => {
    cy.navigateTo('Configuration', 'OAuth2 Clients');

    cy.getIframeBody()
      .contains('Create OAuth2 Client')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="OAuth2 Client name"]')
      .clear()
      .type(CLIENT_NAME);

    cy.getIframeBody()
      .contains('label', 'ID Token')
      .click();

    cy.getIframeBody()
      .contains('label', 'Authorization Code')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="OAuth2 Client scope"]')
      .first()
      .clear()
      .type('openid', {
        //for unknown reason Cypress can lose 'e' when typing openid, therefore slowing down the typing
        delay: 100,
        waitForAnimations: true,
      });

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

  it('Inpect list and delete', () => {
    cy.getIframeBody()
      .contains('a', 'OAuth2 Clients')
      .click();

    deleteFromGenericList(CLIENT_NAME);
  });
});
