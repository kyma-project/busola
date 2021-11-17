/// <reference types="cypress" />
import 'cypress-file-upload';

const DOCKER_IMAGE = 'eu.gcr.io/kyma-project/pr/orders-service:PR-162';
const DEPLOYMENT_NAME = 'orders-service';

context('Create a Deployment', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Deployment', () => {
    cy.getIframeBody()
      .contains('Deploy a new workload')
      .click();

    cy.getIframeBody()
      .find('[role="menuitem"]')
      .contains('Create Deployment')
      .click({ force: true });

    cy.getIframeBody()
      .find('[placeholder="Deployment Name"]:visible')
      .clear()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Labels"]')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Key"]')
      .filterWithNoValue()
      .type('app');

    cy.getIframeBody()
      .find('[placeholder="Enter Value"]')
      .filterWithNoValue()
      .first()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter Key"]')
      .filterWithNoValue()
      .type('example');

    cy.getIframeBody()
      .find('[placeholder="Enter Value"]')
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
      .contains('button', 'Create')
      .click();
  });

  it('Check if deployment, pod and service exist', () => {
    cy.url().should(
      'match',
      new RegExp(`\/deployments\/details\/${DEPLOYMENT_NAME}$`),
    );

    cy.getIframeBody()
      .contains('a', DEPLOYMENT_NAME, { timeout: 7000 })
      .should('be.visible')
      .click();

    cy.getIframeBody()
      .contains('h3', DEPLOYMENT_NAME, { timeout: 7000 })
      .should('be.visible');

    cy.getLeftNav()
      .contains('Discovery and Network')
      .click();

    cy.getLeftNav()
      .find('[data-testid=services_services]')
      .click();

    cy.getIframeBody()
      .contains('a', DEPLOYMENT_NAME, { timeout: 7000 })
      .should('be.visible');

    cy.getLeftNav()
      .contains('Discovery and Network')
      .click();
  });
});
