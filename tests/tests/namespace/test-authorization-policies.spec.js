/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

context('Test Authorization Policies', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Authorization Policy', () => {
    cy.navigateTo('Istio', 'Authorization Policies');

    cy.getIframeBody()
      .contains('Create Authorization Policy')
      .click();

    cy.wrap(loadFile('test-authorization-policies.yaml')).then(AP_CONFIG => {
      const AP = JSON.stringify(AP_CONFIG);

      cy.pasteToMonaco(AP);
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.getIframeBody()
      .contains('test-ap')
      .should('be.visible');

    cy.getIframeBody()
      .contains('app=myapi')
      .should('be.visible');

    cy.getIframeBody()
      .contains('To')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Operation')
      .should('be.visible');

    cy.getIframeBody()
      .contains('GET')
      .should('be.visible');

    cy.getIframeBody()
      .contains('/user/profile/*')
      .should('be.visible');
  });

  it('Inspect list and delete Authorization Policy', () => {
    cy.getIframeBody()
      .contains('Authorization Policies')
      .click();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type('test-ap', { force: true });

    cy.getIframeBody()
      .contains('tbody tr td a', 'test-ap')
      .click({ force: true });

    cy.deleteInDetails();
  });
});
