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

    cy.openCreate();

    cy.get('[accessible-name="ReplicaSet name"]')
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

    cy.saveChanges('Create');
  });

  it('Checks the details view', () => {
    cy.getMidColumn()
      .contains(`${REPLICA_SET_NAME}-`)
      .click({ force: true });

    cy.contains(REPLICA_SET_NAME);

    cy.contains('Always');

    cy.contains(`${DOCKER_IMAGE_TAG}`);
  });

  it('Checks the list view', () => {
    cy.getLeftNav()
      .contains('Replica Sets')
      .click();

    cy.clickGenericListLink(REPLICA_SET_NAME);

    cy.getMidColumn().contains(REPLICA_SET_NAME);
  });

  it('Edits the Docker image and Replicas amount in the Replica set', () => {
    cy.wait(1000);

    cy.inspectTab('Edit');

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

    cy.saveChanges('Edit');
  });

  it('Checks the new amount of Replicas and the new Docker image', () => {
    cy.inspectTab('View');

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
