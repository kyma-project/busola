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

    cy.contains('Create Deployment').click();

    cy.get('[ariaLabel="Deployment name"]:visible')
      .clear()
      .type(DEPLOYMENT_NAME);

    cy.contains('Advanced').click();

    cy.get('[aria-label="expand Labels"]').click();

    cy.get('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('app');

    cy.get('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type(DEPLOYMENT_NAME);

    cy.get('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('example');

    cy.get('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type(DEPLOYMENT_NAME);

    cy.get('[placeholder^="Enter the Docker image"]:visible').type(
      DOCKER_IMAGE,
    );

    cy.contains('Advanced').click();

    cy.contains('label', 'Memory Requests')
      .next()
      .find('input')
      .clear()
      .type('32');

    cy.contains('label', 'Memory Limits')
      .next()
      .find('input')
      .clear()
      .type('64');

    cy.contains('label', 'CPU Requests (m)')
      .next()
      .find('input')
      .clear()
      .type('10');

    cy.contains('label', 'CPU Limits (m)')
      .next()
      .find('input')
      .clear()
      .type('20');

    cy.get('ui5-button.fd-dialog__decisive-button')
      .contains('Create')
      .should('be.visible')
      .click();
  });

  it('Check if deployment and pod exist', () => {
    cy.url().should('match', new RegExp(`\/deployments\/${DEPLOYMENT_NAME}$`));

    cy.contains('[role=row]', DEPLOYMENT_NAME)
      .should('be.visible')
      .click();

    cy.contains('[aria-label="title"]', DEPLOYMENT_NAME).should('be.visible');
  });

  it('Edit a deployment', () => {
    cy.getLeftNav()
      .contains('Deployments')
      .click();

    cy.get('[role=row]')
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
      .filterWithNoValue()
      .type('label-key');

    cy.get('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type('label-value');

    cy.get('ui5-button.fd-dialog__decisive-button')
      .contains('Update')
      .should('be.visible')
      .click();

    cy.contains('label-key=label-value');
  });
});
