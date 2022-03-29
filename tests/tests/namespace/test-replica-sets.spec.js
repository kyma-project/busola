/// <reference types="cypress" />
import 'cypress-file-upload';

const REPLICA_SET_NAME = 'test-replica-set';
const REPLICAS_AMOUNT = 2;
const DOCKER_IMAGE_TAG = 'bitnami/nginx';

const EDITED_REPLICAS_AMOUNT = 1;
const EDITED_DOCKER_IMAGE_TAG = 'test-replica-set-image';
context('Test Replica Sets', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Creates a Replica Set', () => {
    cy.navigateTo('Workloads', 'Replica Sets');

    cy.getIframeBody()
      .contains('Create Replica Set')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Replica Set name"]')
      .clear()
      .type(REPLICA_SET_NAME);

    cy.getIframeBody()
      .find('[placeholder="Replicas"]')
      .clear()
      .type(REPLICAS_AMOUNT)
      .should('have.value', REPLICAS_AMOUNT);

    cy.getIframeBody()
      .find(
        '[placeholder="Enter the Docker image tag, for example, bitnami/nginx"]',
      )
      .clear()
      .type(DOCKER_IMAGE_TAG)
      .should('have.value', DOCKER_IMAGE_TAG);

    cy.getIframeBody()
      .find('[role="document"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checks the details view', () => {
    cy.getIframeBody()
      .contains(`${REPLICA_SET_NAME}-`)
      .click();

    cy.getIframeBody().contains(REPLICA_SET_NAME);

    cy.getIframeBody().contains('Always');

    cy.getIframeBody().contains(`Image${DOCKER_IMAGE_TAG}`);
  });

  it('Checks the list view', () => {
    cy.getLeftNav()
      .contains('Replica Sets')
      .click();

    cy.getIframeBody()
      .contains(REPLICA_SET_NAME)
      .click();

    cy.getIframeBody().contains(REPLICA_SET_NAME);
  });

  it('Edits the Docker image and Replicas amount in the Replica set', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="Enter the Docker image tag, for example, bitnami/nginx"]',
      )
      .clear()
      .type(EDITED_DOCKER_IMAGE_TAG)
      .should('have.value', EDITED_DOCKER_IMAGE_TAG);

    cy.getIframeBody()
      .find('[placeholder="Replicas"]')
      .clear()
      .type(EDITED_REPLICAS_AMOUNT)
      .should('have.value', EDITED_REPLICAS_AMOUNT);

    cy.getIframeBody()
      .find('[role="document"]')
      .contains('button', 'Update')
      .click();
  });

  it('Checks the new Docker image', () => {
    cy.getIframeBody()
      .contains('Replica Sets')
      .click();

    cy.getIframeBody().contains(EDITED_DOCKER_IMAGE_TAG);
  });

  it('Checks the new amout of Replicas', () => {
    cy.getIframeBody()
      .contains(REPLICA_SET_NAME)
      .click();

    cy.getIframeBody().contains(
      `${EDITED_REPLICAS_AMOUNT} / ${EDITED_REPLICAS_AMOUNT}`,
      { timeout: 15 * 1000 },
    );
  });
});
