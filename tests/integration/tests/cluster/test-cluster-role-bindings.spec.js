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

    cy.get('ui5-button')
      .contains('Create Cluster Role Binding')
      .click();

    cy.get('ui5-dialog[accessible-role="Dialog"]')
      .contains('Advanced')
      .click();

    cy.get('[ariaLabel="ClusterRoleBinding name"]').type(CRB_NAME);

    cy.get('input[id="role-input"]').type('cluster-admin');

    cy.contains('li', 'cluster-admin').click();

    cy.get('[ariaLabel="User name"]')
      .clear()
      .type(USER_NAME);

    cy.get('ui5-button.ui5-bar-content')
      .contains('Create')
      .should('be.visible')
      .click();
  });

  it('Checking details', () => {
    cy.contains(CRB_NAME, { includeShadowDom: false }).should('be.visible');

    cy.contains('User').should('be.visible');

    cy.contains(USER_NAME).should('be.visible');

    cy.get('.fd-link')
      .contains('cluster-admin')
      .should('be.visible');
  });

  it('Edit', () => {
    cy.get('ui5-button')
      .contains('Edit')
      .click();

    cy.contains('[role="combobox"]', 'User').click();

    cy.contains('ServiceAccount').click();

    cy.contains('Service Account Namespace').should('be.visible');

    cy.contains('Service Account Name').should('be.visible');

    cy.contains('ServiceAccount').click();

    cy.contains('Group').click();

    cy.get('[ariaLabel="Group name"]')
      .clear()
      .type('test-group');

    cy.get('ui5-button.ui5-bar-content')
      .contains('Update')
      .should('be.visible')
      .click();
  });

  it('Checking updates details', () => {
    cy.contains('Group').should('be.visible');

    cy.contains('test-group').should('be.visible');
  });

  it('Delete Cluster Role Binding', () => {
    cy.deleteInDetails(CRB_NAME);
  });
});
