/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadRandomIngress } from '../support/loadIngress';

const NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

context('Test Ingresses', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to Discovery and Network', () => {
    cy.getLeftNav()
      .contains('Discovery and Network')
      .click();

    cy.getLeftNav()
      .contains('Ingresses')
      .click();
  });

  it('Create an Ingress', () => {
    cy.getIframeBody()
      .contains('Create Ingress')
      .click();

    cy.wrap(loadRandomIngress(NAME, Cypress.env('NAMESPACE_NAME'))).then(
      INGRESS_CONFIG => {
        const INGRESS = JSON.stringify(INGRESS_CONFIG);
        cy.getIframeBody()
          .find('textarea[aria-roledescription="editor"]')
          .filter(':visible')
          .type('{selectall}{backspace}{selectall}{backspace}')
          .paste({
            pastePayload: INGRESS,
          });
      },
    );

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', NAME, { timeout: 5000 })
      .should('be.visible');
  });

  it('Check Ingress details', () => {
    cy.getIframeBody()
      .contains(/rules/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/default backend/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/paths/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/web:8080/i)
      .should('be.visible');
  });

  it('Check Ingresses list', () => {
    cy.getLeftNav()
      .find('[data-testid=ingresses_ingresses]')
      .click();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type(NAME, { force: true });

    cy.getIframeBody()
      .contains('tbody tr td a', NAME)
      .click({ force: true });
  });
});
