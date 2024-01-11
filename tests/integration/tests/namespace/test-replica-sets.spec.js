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

    cy.contains('ui5-button', 'Create Replica Set').click();

    cy.contains('Advanced').click();

    cy.get('[aria-label="ReplicaSet name"]')
      .find('input')
      .clear()
      .type(REPLICA_SET_NAME);

    cy.get('[placeholder="Replicas"]')
      .find('input')
      .clear()
      .type(REPLICAS_AMOUNT)
      .should('have.value', REPLICAS_AMOUNT);

    cy.get(
      '[placeholder="Enter the Docker image tag, for example, bitnami/nginx"]',
    )
      .find('input')
      .clear()
      .type(DOCKER_IMAGE_TAG)
      .should('have.value', DOCKER_IMAGE_TAG);

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Checks the details view', () => {
    cy.getMidColumn()
      .contains(`${REPLICA_SET_NAME}-`)
      .click();

    cy.contains(REPLICA_SET_NAME);

    cy.contains('Always');

    cy.contains(`Image${DOCKER_IMAGE_TAG}`);
  });

  it('Checks the list view', () => {
    cy.getLeftNav()
      .contains('Replica Sets')
      .click();

    cy.contains('ui5-link', REPLICA_SET_NAME).click();

    cy.getMidColumn().contains(REPLICA_SET_NAME);
  });

  it('Edits the Docker image and Replicas amount in the Replica set', () => {
    cy.wait(1000);

    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    cy.get(
      '[placeholder="Enter the Docker image tag, for example, bitnami/nginx"]',
    )
      .find('input')
      .clear()
      .type(EDITED_DOCKER_IMAGE_TAG)
      .should('have.value', EDITED_DOCKER_IMAGE_TAG);

    cy.get('[placeholder="Replicas"]')
      .find('input')
      .clear()
      .type(EDITED_REPLICAS_AMOUNT)
      .should('have.value', EDITED_REPLICAS_AMOUNT);

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Update')
      .should('be.visible')
      .click();
  });

  it('Checks the new amout of Replicas and the new Docker image', () => {
    cy.getMidColumn().contains(
      `${EDITED_REPLICAS_AMOUNT} / ${EDITED_REPLICAS_AMOUNT}`,
      {
        timeout: 15 * 1000,
      },
    );

    cy.closeMidColumn();

    cy.contains(EDITED_DOCKER_IMAGE_TAG);
  });
});
