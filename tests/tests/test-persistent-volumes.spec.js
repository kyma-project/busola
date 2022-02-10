/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadPV } from '../support/loadPV';

const PV_NAME = `test-pv-${Math.random()
  .toString()
  .substr(2, 8)}`;

context('Test Persistent Volumes', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Create PV', () => {
    cy.navigateTo('Storage', 'Persistent Volumes');

    cy.getIframeBody()
      .contains('Create Persistent Volume')
      .click();

    cy.wrap(loadPV(PV_NAME)).then(PV_CONFIG => {
      const PV = JSON.stringify(PV_CONFIG);
      cy.getIframeBody()
        .find('[role="presentation"],[class="view-lines"]')
        .first()
        .click()
        .clearMonaco()
        .type(PV, { parseSpecialCharSequences: false });
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', PV_NAME)
      .should('be.visible');
  });

  it('Check PV details', () => {
    cy.getIframeBody()
      .find('[data-testid=persistent-volumes-ref]')
      .contains('ReadWriteOnce')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Events')
      .should('be.visible');
  });

  it('Check PV list', () => {
    cy.getLeftNav()
      .contains('Persistent Volumes')
      .click();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="open-search"]')
      .type(PV_NAME);

    cy.getIframeBody()
      .contains(PV_NAME)
      .should('be.visible');
  });

  it('Delete PV ', () => {
    cy.getIframeBody()
      .contains('.fd-table__row', PV_NAME)
      .find('button[data-testid="delete"]')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', PV_NAME)
      .should('not.exist');
  });
});
