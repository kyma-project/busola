/// <reference types="cypress" />
import 'cypress-file-upload';

const CERT_NAME = 'cypress-test-name';
const CERT_COMMON_NAME = 'cypress-test-common-name';
const ANNOTATION_KEY = 'annotation';
const ANNOTATION_VALUE = 'value';

context('Add and remove a certificate', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Adds and displays a certificate', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Certificates')
      .click();

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
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .contains('Annotations')
      .click();

    cy.getIframeBody()
      .find('input[placeholder^="Enter Key"]:visible')
      .type(ANNOTATION_KEY);

    cy.getIframeBody()
      .find('input[placeholder^="Enter Value"]:visible')
      .first()
      .type(ANNOTATION_VALUE);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click({ force: true });

    cy.getIframeBody()
      .contains('h3', CERT_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains(`${ANNOTATION_KEY}=${ANNOTATION_VALUE}`)
      .should('be.visible');
  });

  it('Deletes a certificate', () => {
    cy.getLeftNav()
      .contains('Certificates')
      .click();

    cy.url().should('match', /certificates$/);

    cy.getIframeBody()
      .contains('a', CERT_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .find('button[data-testid="delete"]:visible')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('a', CERT_NAME)
      .should('not.exist');
  });
});
