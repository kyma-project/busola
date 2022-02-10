/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../support/loadFile';

const DR_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

async function loadDR(drName, namespaceName) {
  const DR = await loadFile('test-custom-destination-rule.yaml');
  const newDR = { ...DR };

  newDR.metadata.name = drName;
  newDR.metadata.namespace = namespaceName;

  return newDR;
}

context('Test Destination Rules', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Destination Rule', () => {
    cy.navigateTo('Istio', 'Destination Rules');

    cy.getIframeBody()
      .contains('Create Destination Rule')
      .click();

    cy.wrap(loadDR(DR_NAME, Cypress.env('NAMESPACE_NAME'))).then(DR_CONFIG => {
      const DR = JSON.stringify(DR_CONFIG);
      cy.getIframeBody()
        .find('[role="presentation"],[class="view-lines"]')
        .first()
        .click()
        .clearMonaco()
        .type(DR, { parseSpecialCharSequences: false });
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', DR_NAME)
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
      .contains('.fd-table__row', DR_NAME)
      .should('not.exist');
  });
});
