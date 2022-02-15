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
    cy.getIframeBody()
      .contains('Deploy new workload')
      .click();

    cy.getIframeBody()
      .find('[role="menuitem"]')
      .contains('Create Deployment')
      .click({ force: true });

    cy.getIframeBody()
      .find('[placeholder="Deployment name"]:visible')
      .clear()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Labels"]')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]')
      .filterWithNoValue()
      .type('app');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]')
      .filterWithNoValue()
      .first()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter key"]')
      .filterWithNoValue()
      .type('example');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]')
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
      .next('input')
      .clear()
      .type('10');

    cy.getIframeBody()
      .contains('label', 'CPU Limits (m)')
      .next('input')
      .clear()
      .type('20');

    cy.getIframeBody()
      .contains('Expose a separate Service')
      .click();

    cy.getIframeBody()
      .contains('button', /^Create$/)
      .click();
  });

  it('Check if deployment, pod and service exist', () => {
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

    cy.getLeftNav()
      .contains('Discovery and Network')
      .click();

    cy.getLeftNav()
      .find('[data-testid=services_services]')
      .click();

    cy.getIframeBody()
      .contains('a', DEPLOYMENT_NAME)
      .should('be.visible');
  });

  it('Edit a deployment', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .find('[data-testid=deployments_deployments]')
      .click();

    cy.getIframeBody()
      .contains('a', DEPLOYMENT_NAME)
      .should('be.visible')
      .click();

    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Labels"]')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]')
      .filterWithNoValue()
      .type('label-key');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]')
      .filterWithNoValue()
      .first()
      .type('label-value');

    cy.getIframeBody()
      .contains('Expose a separate Service')
      .should('not.exist');

    cy.getIframeBody()
      .contains('button', 'Update')
      .click();

    cy.getIframeBody().contains('label-key=label-value');

    // Close the left side nav tabs to not interfere with other tests
    cy.getLeftNav()
      .contains('Discovery and Network')
      .click();

    cy.getLeftNav()
      .contains('Workloads')
      .click();
  });
});
