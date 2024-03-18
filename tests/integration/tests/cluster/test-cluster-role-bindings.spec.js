/// <reference types="cypress" />

// Also column layout test

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

    cy.contains('ui5-button', 'Create').click();

    cy.get('[aria-label="ClusterRoleBinding name"]')
      .find('input')
      .click()
      .type(CRB_NAME);

    cy.get(
      'ui5-combobox[placeholder="Start typing to select ClusterRole from the list"]',
    )
      .find('input')
      .click()
      .type('admin');

    cy.get('ui5-li:visible')
      .contains('cluster-admin')
      .find('li')
      .click();

    cy.get('[aria-label="User name"]')
      .find('input')
      .type(USER_NAME)
      .blur({ force: true });

    cy.get('.create-form')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Checking details using column layout', () => {
    cy.wait(3000); // wait for the resource to be refeched and displayed in the list
    cy.contains('ui5-title', CRB_NAME).should('be.visible');

    cy.inspectList(CRB_NAME);

    cy.clickGenericListLink(CRB_NAME);

    cy.getMidColumn()
      .contains('User')
      .should('be.visible');

    cy.getMidColumn()
      .contains(USER_NAME)
      .should('be.visible');

    cy.getMidColumn()
      .contains('ui5-link', 'cluster-admin')
      .should('be.visible');
  });

  it('Edit', () => {
    cy.wait(1000);

    cy.getMidColumn().inspectTab('Edit');

    cy.contains('[role="combobox"]', 'User').click();

    cy.get('ui5-li:visible')
      .contains('ServiceAccount')
      .find('li')
      .click({ force: true });

    cy.contains('Service Account Namespace').should('be.visible');

    cy.contains('Service Account Name').should('be.visible');

    cy.contains('[role="combobox"]', 'ServiceAccount').click();

    cy.contains('Group').click();

    cy.get('[aria-label="Group name"]')
      .find('input')
      .type('test-group')
      .blur({ force: true });

    cy.get('.edit-form')
      .find('.header-actions')
      .contains('ui5-button:visible', 'Save')
      .click();
  });

  it('Checking updates details', () => {
    cy.inspectTab('View');

    cy.getMidColumn()
      .contains('Group')
      .should('be.visible');

    cy.getMidColumn()
      .contains('test-group')
      .should('be.visible');
  });

  it('Test column layout functionality', () => {
    cy.testMidColumnLayout(CRB_NAME, false);
  });

  it('Delete Cluster Role Binding', () => {
    cy.clickGenericListLink(CRB_NAME);

    cy.deleteInDetails('Cluster Role Binding', CRB_NAME, true);
  });
});
