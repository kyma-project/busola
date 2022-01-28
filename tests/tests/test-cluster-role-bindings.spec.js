/// <reference types="cypress" />

const random = Math.floor(Math.random() * 9999) + 1000;
const CRB_NAME = `test-crb-${random}`;
const USER_NAME = 'test@kyma.eu';

context('Test Cluster Role Bindings', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Create a ClusterRoleBinding', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Cluster Role Bindings')
      .click();

    cy.getIframeBody()
      .contains('Create Cluster Role Binding')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Cluster Role Binding Name"]')
      .type(CRB_NAME);

    cy.getIframeBody()
      .find(
        '[placeholder="Start typing to select Role Binding from the list."]',
      )
      .type('broker');

    cy.getIframeBody()
      .contains('helm-broker-h3')
      .click();

    cy.getIframeBody()
      .find('[placeholder="User name"]')
      .clear()
      .type(USER_NAME);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.getIframeBody()
      .contains(CRB_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains('User')
      .should('be.visible');

    cy.getIframeBody()
      .contains(USER_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains('helm-broker-h3')
      .should('be.visible');
  });

  it('Edit', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role="document"]')
      .contains('User')
      .click();

    cy.getIframeBody()
      .contains('ServiceAccount')
      .click();

    cy.getIframeBody()
      .contains('Service Account Namespace')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Service Account Name')
      .should('be.visible');

    cy.getIframeBody()
      .contains('ServiceAccount')
      .click();

    cy.getIframeBody()
      .contains('Group')
      .click();

    cy.getIframeBody()
      .find('[placeholder="User group"]')
      .clear()
      .type('test-group');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Update')
      .click();
  });

  it('Checking updates details', () => {
    cy.getIframeBody()
      .contains('Group')
      .should('be.visible');

    cy.getIframeBody()
      .contains('test-group')
      .should('be.visible');
  });

  it('Delete Cluster Role Binding', () => {
    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .find('[data-testid="delete-confirmation"]')
      .click();
  });
});
