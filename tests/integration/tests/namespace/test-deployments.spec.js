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

    cy.contains('ui5-button', 'Create Deployment').click();

    cy.get('[aria-label="Deployment name"]:visible')
      .find('input')
      .clear()
      .type(DEPLOYMENT_NAME, { force: true });

    cy.contains('Advanced').click();

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

    cy.contains('Advanced').click();

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

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Check if deployment and pod exist', () => {
    cy.url().should('match', new RegExp(`\/deployments\/${DEPLOYMENT_NAME}$`));

    cy.contains('ui5-title', DEPLOYMENT_NAME).should('be.visible');

    cy.contains('ui5-table-cell', DEPLOYMENT_NAME)
      .should('be.visible')
      .click();
  });

  it('Edit a deployment', () => {
    cy.getLeftNav()
      .contains('Deployments')
      .click();

    cy.get('ui5-table-row')
      .contains('a', DEPLOYMENT_NAME)
      .click();

    cy.get('[data-testid="has-tooltip"]').contains('span', '1 / 1', {
      timeout: 60 * 1000,
    });

    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
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

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Update')
      .should('be.visible')
      .click();

    cy.contains('label-key=label-value');
  });
});
