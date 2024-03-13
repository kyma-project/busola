/// <reference types="cypress" />
import 'cypress-file-upload';

const DOCKER_IMAGE = 'eu.gcr.io/kyma-project/develop/orders-service:68a58069';
const DEPLOYMENT_NAME = 'orders-service';

context('Test Deployments', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Deployment', () => {
    cy.navigateTo('Workloads', 'Deployments');

    cy.contains('ui5-button', 'Create').click();

    cy.get('[aria-label="Deployment name"]:visible')
      .find('input')
      .click()
      .clear()
      .type(DEPLOYMENT_NAME, { force: true });

    cy.get('[aria-label="expand Labels"]').click();

    cy.get('[placeholder="Enter key"]:visible')
      .find('input')
      .filterWithNoValue()
      .type('app');

    cy.get('[placeholder="Enter value"]:visible')
      .find('input')
      .filterWithNoValue()
      .first()
      .type(DEPLOYMENT_NAME);

    cy.get('[placeholder="Enter key"]:visible')
      .find('input')
      .filterWithNoValue()
      .type('example');

    cy.get('[placeholder="Enter value"]:visible')
      .find('input')
      .filterWithNoValue()
      .first()
      .type(DEPLOYMENT_NAME);

    cy.get('[placeholder^="Enter the Docker image"]:visible')
      .find('input')
      .type(DOCKER_IMAGE);

    cy.contains('ui5-label', 'Memory Requests')
      .next()
      .find('ui5-input')
      .find('input')
      .clear()
      .type('32');

    cy.contains('ui5-label', 'Memory Limits')
      .next()
      .find('ui5-input')
      .find('input')
      .clear()
      .type('64');

    cy.contains('ui5-label', 'CPU Requests (m)')
      .next()
      .find('input')
      .clear()
      .type('10');

    cy.contains('ui5-label', 'CPU Limits (m)')
      .next()
      .find('input')
      .clear()
      .type('20');

    cy.get('.create-form')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Check if deployment and pod exist', () => {
    cy.url().should('match', new RegExp(`\/deployments\/${DEPLOYMENT_NAME}`));

    cy.getMidColumn()
      .contains('ui5-title', DEPLOYMENT_NAME)
      .should('be.visible');

    cy.getMidColumn()
      .contains('ui5-table-cell', DEPLOYMENT_NAME)
      .click({ force: true });
  });

  it('Edit a deployment', () => {
    cy.getLeftNav()
      .contains('Deployments')
      .click();

    cy.clickGenericListLink(DEPLOYMENT_NAME);

    cy.getMidColumn()
      .get('[data-testid="has-tooltip"]')
      .contains('span', '1 / 1', {
        timeout: 60 * 1000,
      });
    cy.wait(1000);

    cy.wait(1000);

    cy.getMidColumn()
      .find('ui5-tabcontainer')
      .find('[role="tablist"]')
      .find('[role="tab"]')
      .contains('Edit')
      .click();

    cy.get('[aria-label="expand Labels"]').click();

    cy.get('[placeholder="Enter key"]:visible')
      .find('input')
      .filterWithNoValue()
      .type('label-key');

    cy.get('[placeholder="Enter value"]:visible')
      .find('input')
      .filterWithNoValue()
      .first()
      .type('label-value');

    cy.get('.edit-form')
      .find('.header-actions')
      .contains('ui5-button:visible', 'Save')
      .click();

    cy.getMidColumn()
      .find('ui5-tabcontainer')
      .find('[role="tablist"]')
      .find('[role="tab"]')
      .contains('View')
      .click();

    cy.getMidColumn().contains('label-key=label-value');
  });
});
