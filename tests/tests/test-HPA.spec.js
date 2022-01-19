/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadRandomHPA } from '../support/loadHPA';

const HPA_NAME = 'test-hpa';

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

  it('Create HPA', () => {
    cy.getIframeBody()
      .contains('Create Horizontal Pod Autoscaler')
      .click();

    cy.wrap(loadRandomHPA(Cypress.env('NAMESPACE_NAME'))).then(HPA_CONFIG => {
      const HPA = JSON.stringify(HPA_CONFIG);
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
      .contains('h3', HPA_NAME, { timeout: 5000 })
      .should('be.visible');
  });

  it('Check HPA details', () => {
    cy.getIframeBody()
      .find('[data-testid=hpa-spec-ref]')
      .contains('apps/v1/deployments')
      .should('be.visible');
  });

  it('Check HPA list', () => {
    cy.getLeftNav()
      .contains('Horizontal Pod')
      .click();

    cy.getIframeBody()
      .contains(HPA_NAME)
      .should('be.visible');
  });

  it('Delete HPA ', () => {
    cy.getIframeBody()
      .contains('.fd-table__row', HPA_NAME)
      .find('button[data-testid="delete"]')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', HPA_NAME, { timeout: 5000 })
      .should('not.exist');
  });
});
