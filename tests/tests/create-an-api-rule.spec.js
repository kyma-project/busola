/// <reference types="cypress" />
import 'cypress-file-upload';

const random = Math.floor(Math.random() * 9999) + 1000;
const FUNCTION_NAME = 'test-function';
const API_RULE_NAME = 'test-api-rule';
const API_RULE_HOST = API_RULE_NAME + '-' + random;

context('API Rules in the Function details view', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a simple Function', () => {
    cy.createSimpleFunction(FUNCTION_NAME);
  });

  it('Create an API Rule for the Function', () => {
    cy.getIframeBody()
      .contains('Configuration')
      .click();

    cy.getIframeBody()
      .contains('Create API Rule')
      .click();

    cy.getIframeBody()
      .find('[placeholder="API Rule Name"]')
      .filter(':visible', { log: false })
      .type(API_RULE_NAME);

    cy.getIframeBody()
      .find('[placeholder="Subdomain part of API Rule address."]')
      .filter(':visible', { log: false })
      .type(API_RULE_HOST);

    cy.getIframeBody()
      .contains('Allow')
      .filter(':visible', { log: false })
      .click();

    cy.getIframeBody()
      .contains('OAuth2')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Required scope"]')
      .filter(':visible', { log: false })
      .type('read write');

    cy.getIframeBody()
      .contains('POST')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Check the API Rule details', () => {
    cy.getIframeBody()
      .contains(API_RULE_NAME)
      .click();
  });
});
