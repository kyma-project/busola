/// <reference types="cypress" />
import 'cypress-file-upload';

const FUNCTION_NAME = 'test-function';
const API_RULE_NAME = 'test-api-rule';
const API_RULE_HOST = API_RULE_NAME + '-host';
const API_RULE_PATH = '/test-path';
const API_RULE_DEFAULT_PATH = '/.*';

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

    cy.getIframeBody().contains(`${FUNCTION_NAME} (port: 80)`);

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
      .type('read');

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

    cy.getIframeBody()
      .contains(API_RULE_DEFAULT_PATH)
      .should('exist');

    cy.getIframeBody()
      .contains('OAuth2')
      .should('exist');

    cy.getIframeBody()
      .contains(API_RULE_PATH)
      .should('not.exist');

    cy.getIframeBody()
      .contains('Allow')
      .should('not.exist');
  });

  it('Edit the API Rule', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody().contains(API_RULE_NAME);

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .contains('Add Rule')
      .click();

    cy.getIframeBody()
      .contains('Rule 2')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter the path."]')
      .filter(':visible', { log: false })
      .type(API_RULE_PATH);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();
  });

  it('Check the edited API Rule details', () => {
    cy.getIframeBody()
      .contains(API_RULE_NAME)
      .click();

    cy.getIframeBody()
      .contains(API_RULE_DEFAULT_PATH)
      .should('exist');

    cy.getIframeBody()
      .contains('OAuth2')
      .should('exist');

    cy.getIframeBody()
      .contains(API_RULE_PATH)
      .should('exist');

    cy.getIframeBody()
      .contains('Allow')
      .should('exist');
  });
});
