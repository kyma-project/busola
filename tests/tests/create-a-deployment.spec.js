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
      .contains('Deploy new workload')
      .click();

    cy.getIframeBody()
      .find('[role="menuitem"]')
      .contains('Create Deployment')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Deployment name"]:visible')
      .clear()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]:visible')
      .type(`app=${DEPLOYMENT_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]:visible')
      .type(`example=${DEPLOYMENT_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder^="Enter Docker image"]:visible')
      .type(DOCKER_IMAGE);

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .contains('Runtime profile')
      .click();

    cy.getIframeBody()
      .contains('label', 'Memory requests')
      .next('input')
      .clear()
      .type('16Mi');

    cy.getIframeBody()
      .contains('label', 'Memory limits')
      .next('input')
      .clear()
      .type('32Mi');

    cy.getIframeBody()
      .contains('label', 'CPU requests')
      .next('input')
      .clear()
      .type('10m');

    cy.getIframeBody()
      .contains('label', 'CPU limits')
      .next('input')
      .clear()
      .type('20m');

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
