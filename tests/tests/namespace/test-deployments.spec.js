/// <reference types="cypress" />
import 'cypress-file-upload';

const DOCKER_IMAGE = 'eu.gcr.io/kyma-project/pr/orders-service:PR-162';
const DEPLOYMENT_NAME = 'orders-service';

context('Test Deployments', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Deployment', () => {
    cy.navigateTo('Workloads', 'Deployments');

    cy.getIframeBody()
      .contains('Create Deployment')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Deployment name"]:visible')
      .clear()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Labels"]')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('app');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('example');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .find('[placeholder^="Enter the Docker image"]:visible')
      .type(DOCKER_IMAGE);

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .contains('label', 'Memory Requests')
      .next()
      .find('input')
      .clear()
      .type('16');

    cy.getIframeBody()
      .contains('label', 'Memory Limits')
      .next()
      .find('input')
      .clear()
      .type('32');

    cy.getIframeBody()
      .contains('label', 'CPU Requests (m)')
      .next()
      .find('input')
      .clear()
      .type('10');

    cy.getIframeBody()
      .contains('label', 'CPU Limits (m)')
      .next()
      .find('input')
      .clear()
      .type('20');

    cy.getIframeBody()
      .contains('button', /^Create$/)
      .click();
  });

  it('Check if deployment and pod exist', () => {
    cy.url().should(
      'match',
      new RegExp(`\/deployments\/details\/${DEPLOYMENT_NAME}$`),
    );

    cy.getIframeBody()
      .contains('a', DEPLOYMENT_NAME)
      .should('be.visible')
      .click();

    cy.getIframeBody()
      .contains('h3', DEPLOYMENT_NAME)
      .should('be.visible');
  });

  it('Edit a deployment', () => {
    cy.getLeftNav()
      .contains('Deployments')
      .click();

    cy.wait(1000);

    cy.getIframeBody()
      .contains('a', DEPLOYMENT_NAME)
      .should('be.visible')
      .click();

    cy.getIframeBody()
      .find('[data-testid="has-tooltip"]')
      .contains('span', '1 / 1', { timeout: 60 * 1000 });

    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Labels"]')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('label-key');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type('label-value');

    cy.getIframeBody()
      .contains('button', 'Update')
      .click();

    cy.getIframeBody().contains('label-key=label-value');
  });
});
