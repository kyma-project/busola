/// <reference types="cypress" />

const random = Math.floor(Math.random() * 9999) + 1000;
const CRB_NAME = `test-###-crb-${random}`;
const USER_NAME = 'test@kyma.eu';

context('Test Cluster Role Bindings', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Create a ClusterRoleBinding', () => {
    cy.navigateTo('Configuration', 'Cluster Role Bindings');

    cy.contains('Create Cluster Role Binding').click();

    cy.contains('Advanced').click();

    cy.get('[ariaLabel="ClusterRoleBinding name"]').type(CRB_NAME);

    cy.get(
      '[placeholder="Start typing to select ClusterRole from the list"]',
    ).type('admin');

    cy.contains('li', 'cluster-admin').click();

    cy.get('[ariaLabel="User name"]')
      .clear()
      .type(USER_NAME);

    cy.contains('[role="dialog"]button', 'Create').click();
  });

  it('Checking details', () => {
    cy.contains(CRB_NAME).should('be.visible');

    cy.contains('User').should('be.visible');

    cy.contains(USER_NAME).should('be.visible');

    cy.contains('cluster-admin').should('be.visible');
  });

  it('Edit', () => {
    cy.contains('Edit').click();

    cy.contains('[role="document"]', 'User').click();

    cy.contains('ServiceAccount').click();

    cy.contains('Service Account Namespace').should('be.visible');

    cy.contains('Service Account Name').should('be.visible');

    cy.contains('ServiceAccount').click();

    cy.contains('Group').click();

    cy.get('[ariaLabel="Group name"]')
      .clear()
      .type('test-group');

    cy.contains('[role="dialog"] button', 'Update').click();
  });

  it('Checking updates details', () => {
    cy.contains('Group').should('be.visible');

    cy.contains('test-group').should('be.visible');
  });

  it('Delete Cluster Role Binding', () => {
    cy.deleteInDetails();
  });
});
