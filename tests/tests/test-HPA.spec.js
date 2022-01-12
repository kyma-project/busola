/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadRandomHPA } from '../support/loadHPA';

context('Test HPA', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to HPA', () => {
    cy.getLeftNav()
      .contains('Discovery and Network')
      .click();
    cy.getLeftNav()
      .contains('Horizontal Pod')
      .click();
  });

  it('Create a HPA', () => {
    cy.getIframeBody()
      .contains('Create Horizontal Pod Autoscaler')
      .click();

    cy.wrap(loadRandomHPA(Cypress.env('NAMESPACE_NAME'))).then(DR_CONFIG => {
      const HPA = JSON.stringify(DR_CONFIG);
      cy.getIframeBody()
        .find('[role="presentation"],[class="view-lines"]')
        .first()
        .click()
        .clearMonaco()
        .type(HPA, { parseSpecialCharSequences: false });
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', 'test-hpa', { timeout: 5000 })
      .should('be.visible');
  });

  it('Check HPA details', () => {
    cy.getIframeBody()
      .find('[data-testid=hpa-spec-ref]')
      .contains('apps/v1/deployments')
      .should('be.visible');
  });

  it('Check the HPA list', () => {
    cy.getLeftNav()
      .contains('Horizontal Pod')
      .click();

    cy.getIframeBody()
      .contains('test-hpa')
      .should('be.visible');
  });

  it('Delete a HPA ', () => {
    cy.getIframeBody()
      .contains('.fd-table__row', 'test-hpa')
      .find('button[data-testid="delete"]')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', 'test-hpa', { timeout: 5000 })
      .should('not.exist');
  });
});
