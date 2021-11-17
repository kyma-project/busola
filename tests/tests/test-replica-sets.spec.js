/// <reference types="cypress" />
import 'cypress-file-upload';

const REPLICA_SET_NAME = 'test-replica-set';

context('Create a Replica Set', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigates to Replica Sets', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Replica Sets')
      .click();
  });

  it('Creates a Replica Set', () => {
    cy.getIframeBody()
      .contains('Create Replica Set')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Replica Set Name"]')
      .clear()
      .type(REPLICA_SET_NAME);

    const replicasAmount = 1;
    cy.getIframeBody()
      .find('[placeholder="Replicas"]')
      .clear()
      .type(replicasAmount)
      .should('have.value', replicasAmount);

    cy.getIframeBody()
      .find(
        '[placeholder="Enter the Docker image tag, for example, bitnami/nginx."]',
      )
      .clear()
      .type('bitnami/nginx');

    cy.getIframeBody()
      .find('[role="document"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checks details view', () => {
    cy.getIframeBody()
      .contains(REPLICA_SET_NAME)
      .click();

    cy.getIframeBody()
      .contains(REPLICA_SET_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains('Containers')
      .parent()
      .contains(REPLICA_SET_NAME)
      .should('be.visible');
  });
});
