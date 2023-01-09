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

    cy.contains('Create Certificate')
      .click()
      .should('be.visible');

    cy.contains('Simple').should('be.visible');

    cy.get('input[data-cy="cert-name"]:visible').type(CERT_NAME);

    cy.get('input[placeholder^="Certificate CN"]:visible').type(
      CERT_COMMON_NAME,
    );

    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.contains('h3', CERT_NAME).should('be.visible');
  });

  it('Edits a certificate', () => {
    cy.getLeftNav()
      .contains('Certificates')
      .click();

    cy.contains('a', CERT_NAME).click();

    cy.contains('button', 'Edit').click();

    cy.contains('Annotations').click();

    cy.get('input[placeholder^="Enter key"]:visible').type(ANNOTATION_KEY);

    cy.get('input[placeholder^="Enter value"]:visible')
      .first()
      .type(ANNOTATION_VALUE);

    cy.get('[role=dialog]')
      .contains('button', 'Update')
      .click();

    cy.contains(`${ANNOTATION_KEY}=${ANNOTATION_VALUE}`).should('be.visible');
  });

  it('Inspect a certificate list', () => {
    cy.inspectList('Certificates', CERT_NAME);
  });
});
