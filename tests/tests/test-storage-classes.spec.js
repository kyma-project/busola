/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadRandomSC } from '../support/loadFile';

const STORAGE_CLASS_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

context('Test Storage Classes', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Navigate to Storage Classes', () => {
    cy.getLeftNav()
      .contains('Storage')
      .click();

    cy.getLeftNav()
      .contains('Storage Classes')
      .click();
  });

  it('Create Storage Class', () => {
    cy.getIframeBody()
      .contains('Create Storage Class')
      .click();

    cy.wrap(loadRandomSC(STORAGE_CLASS_NAME)).then(SC_CONFIG => {
      const SC = JSON.stringify(SC_CONFIG);

      cy.getIframeBody()
        .find('textarea[aria-roledescription="editor"]')
        .clearMonaco()
        .type(SC, {
          parseSpecialCharSequences: false,
          waitForAnimations: false,
        });
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.getIframeBody()
      .contains(STORAGE_CLASS_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains('pd.csi.storage.gke.io')
      .should('be.visible');

    cy.getIframeBody()
      .contains('pd-ssd')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Retain')
      .should('be.visible');
  });

  it('Delete Storage Class', () => {
    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.get('[data-testid=luigi-modal-confirm]').click();

    cy.getIframeBody()
      .contains(/deleted/)
      .should('be.visible');
  });
});
