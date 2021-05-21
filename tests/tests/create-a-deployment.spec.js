/// <reference types="cypress" />
import 'cypress-file-upload';

const DOCKER_IMAGE = 'eu.gcr.io/kyma-project/pr/orders-service:PR-162';
const DEPLOYMENT_NAME = 'orders-service';

context('Busola - Create a Deployment', () => {
  const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');

  it('Create a Deployment', () => {
    cy.getIframeBody()
      .contains('Deploy new workload')
      .click();

    cy.getIframeBody()
      .find('[role="menuitem"]')
      .contains('Create Deployment')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Deployment name"]')
      .clear()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type(`app=${DEPLOYMENT_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type(`example=${DEPLOYMENT_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Docker image"]')
      .type(DOCKER_IMAGE);

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

  it('Check if deployment and service exist', () => {
    cy.url().should(
      'match',
      new RegExp(`\/deployments\/details\/${DEPLOYMENT_NAME}$`),
    );

    cy.getIframeBody()
      .contains('a', DEPLOYMENT_NAME, { timeout: 7000 })
      .should('be.visible');

    getLeftNav()
      .contains('Discovery and Network')
      .click();

    getLeftNav()
      .find('[data-testid=services_services]')
      .click();

    cy.getIframeBody()
      .contains('a', DEPLOYMENT_NAME, { timeout: 7000 })
      .should('be.visible');
  });
});
