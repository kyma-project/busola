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

    cy.contains('ui5-button', 'Create Cluster Role Binding').click();

    cy.contains('Advanced').click();

    cy.get('[aria-label="ClusterRoleBinding name"]')
      .find('input')
      .type(CRB_NAME);

    cy.get(
      'ui5-combobox[placeholder="Start typing to select ClusterRole from the list"]',
    )
      .find('input')
      .click()
      .type('admin');

    cy.contains('ui5-li:visible', 'cluster-admin').click();

    cy.get('[aria-label="User name"]')
      .find('input')
      .type(USER_NAME)
      .blur({ force: true });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Checking details', () => {
    cy.contains('ui5-title', CRB_NAME).should('be.visible');

    cy.contains('User').should('be.visible');

    cy.contains(USER_NAME).should('be.visible');

    cy.contains('a.fd-link', 'cluster-admin').should('be.visible');
  });

  it('Edit', () => {
    cy.contains('ui5-button', 'Edit').click();

    cy.contains('[role="combobox"]', 'User').click();

    cy.contains('ServiceAccount').click();

    cy.contains('Service Account Namespace').should('be.visible');

    cy.contains('Service Account Name').should('be.visible');

    cy.contains('[role="combobox"]', 'ServiceAccount').click();

    cy.contains('Group').click();

    cy.get('[aria-label="Group name"]')
      .find('input')
      .type('test-group')
      .blur({ force: true });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Update')
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
