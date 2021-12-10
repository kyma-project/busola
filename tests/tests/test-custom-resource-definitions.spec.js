/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadRandomCRD } from '../support/loadCRD';

const CRD_PLURAL_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

const CRD_NAME = CRD_PLURAL_NAME + '.stable.example.com';

context('Test Create Resource Definitions', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to Create Custom Resource Definition', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Custom Resource Definitions')
      .click();
  });

  it('Create Custom Resource Definition', () => {
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

    cy.wrap(loadRandomCRD()).then(CRD_CONFIG => {
      const CRD = JSON.stringify(CRD_CONFIG);
      cy.getIframeBody()
        .find('[role="presentation"],[class="view-lines"]')
        .first()
        .click()
        .type(CRD, { parseSpecialCharSequences: false });
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Check Custom Resource Definitions list', () => {
    cy.getLeftNav()
      .find('[data-testid=customresourcedefinitions_customresourcedefinitions]')
      .click();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type(CRD_NAME, { force: true });

    cy.getIframeBody().contains('Namespaced');

    cy.getIframeBody()
      .contains('tbody tr td a', CRD_NAME)
      .click({ force: true });
  });

  it('Check Custom Resource Definition details', () => {
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

  it('Delete Custom Resource Definition', () => {
    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.get('[data-testid=luigi-modal-confirm]').click();
  });
});
