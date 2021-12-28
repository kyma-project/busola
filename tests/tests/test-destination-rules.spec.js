/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadRandomDR } from '../support/loadDR';

const DR_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

context('Test Destination Rules', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to Istio', () => {
    cy.getLeftNav()
      .contains('Istio')
      .click();

    cy.getLeftNav()
      .contains('Destination Rules')
      .click();
  });

  it('Create a Destination Rule', () => {
    cy.getIframeBody()
      .contains('Create Destination Rule')
      .click();

    cy.wrap(loadRandomDR(DR_NAME, Cypress.env('NAMESPACE_NAME'))).then(
      DR_CONFIG => {
        const DR = JSON.stringify(DR_CONFIG);
        cy.getIframeBody()
          .find('[role="presentation"],[class="view-lines"]')
          .first()
          .click()
          .clearMonaco()
          .type(DR, { parseSpecialCharSequences: false });
      },
    );

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', DR_NAME, { timeout: 5000 })
      .should('be.visible');
  });

  it('Check Destination Rule details', () => {
    cy.getIframeBody()
      .find('[data-testid=traffic-policy]')
      .contains('LEAST_CONN')
      .should('be.visible');
  });

  it('Check the Destination Rule list', () => {
    cy.getLeftNav()
      .contains('Destination Rules')
      .click();

    cy.getIframeBody()
      .contains(DR_NAME)
      .should('be.visible');
  });

  it('Delete a Destination Rule', () => {
    cy.getIframeBody()
      .contains('.fd-table__row', DR_NAME)
      .find('button[data-testid="delete"]')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', DR_NAME, { timeout: 5000 })
      .should('not.exist');
  });
});
