/// <reference types="cypress" />
import 'cypress-file-upload';

const CERT_NAME = 'cypress-test-name';
const CERT_COMMON_NAME = 'cypress-test-common-name';
const ANNOTATION_KEY = 'annotation';
const ANNOTATION_VALUE = 'value';

context('Test Certificates', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Adds and displays a certificate', () => {
    cy.navigateTo('Configuration', 'Certificates');

    cy.url().should('match', /certificates$/);

    cy.getIframeBody()
      .contains('Create Certificate')
      .click()
      .should('be.visible');

    cy.getIframeBody()
      .contains('Simple')
      .should('be.visible');

    cy.getIframeBody()
      .find('input[data-cy="cert-name"]:visible')
      .type(CERT_NAME);

    cy.getIframeBody()
      .find('input[placeholder^="Certificate CN"]:visible')
      .type(CERT_COMMON_NAME);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', CERT_NAME)
      .should('be.visible');
  });

  it('Edits a certificate', () => {
    cy.getLeftNav()
      .contains('Certificates')
      .click();

    cy.getIframeBody()
      .contains('a', CERT_NAME)
      .click();

    cy.getIframeBody()
      .contains('button', 'Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .contains('Annotations')
      .click();

    cy.getIframeBody()
      .find('input[placeholder^="Enter key"]:visible')
      .type(ANNOTATION_KEY);

    cy.getIframeBody()
      .find('input[placeholder^="Enter value"]:visible')
      .first()
      .type(ANNOTATION_VALUE);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();

    cy.getIframeBody()
      .contains(`${ANNOTATION_KEY}=${ANNOTATION_VALUE}`)
      .should('be.visible');
  });

  it('Inspect a certificate list', () => {
    cy.inspectList('Certificates', CERT_NAME);
  });
});
