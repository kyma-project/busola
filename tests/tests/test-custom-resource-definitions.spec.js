/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadRandomCRD } from '../support/loadCRD';

context('Test Create Resource Definitions', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to Create Resource Definition', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Custom Resource Definitions')
      .click();
  });

  it('Create Create Resource Definition', () => {
    cy.getIframeBody()
      .contains('Create Custom Resource Definition')
      .click();

    cy.getIframeBody()
      .find('[role="presentation"],[class="view-lines"]')
      .first()
      .type(
        '{selectall}{backspace}{selectall}{backspace}{selectall}{backspace}',
      );

    cy.getIframeBody()
      .find('[role="presentation"],[class="view-lines"]')
      .first()
      .type(
        '{selectall}{backspace}{selectall}{backspace}{selectall}{backspace}',
      );

    cy.getIframeBody()
      .find('[role="presentation"],[class="view-lines"]')
      .first()
      .type(
        '{selectall}{backspace}{selectall}{backspace}{selectall}{backspace}',
      );

    loadRandomCRD().then(CRB_TEST => {
      const CRB_2 = JSON.stringify(CRB_TEST);
      cy.getIframeBody()
        .find('[role="presentation"],[class="view-lines"]')
        .first()
        .click()
        .type(CRB_2, { parseSpecialCharSequences: false });
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.getIframeBody()
      .contains(/served/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/storage/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/crontab/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/test/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/namespaced/i)
      .should('be.visible');
  });

  it('Delete Cluster Role Binding', () => {
    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.get('[data-testid=luigi-modal-confirm]').click();
  });
});
