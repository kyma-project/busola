/// <reference types="cypress" />

context('Create Namespace', () => {
  Cypress.skipAfterFail({ skipAllSuits: true });

  before(cy.loginAndSelectCluster);

  it('Create Namespace', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('Create Namespace')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .contains('Create Resource Quota')
      .click();

    cy.getIframeBody()
      .contains('Create Limit Range')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find('input[placeholder]:visible')
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', Cypress.env('NAMESPACE_NAME'))
      .should('be.visible');

    cy.getIframeBody()
      .contains('button', 'Edit')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();
  });

  it('Create application', () => {
    cy.getLeftNav()
      .contains('Back to Cluster Overview')
      .click();

    cy.navigateTo('Integration', 'Applications');

    cy.getIframeBody()
      .contains('Create Application')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find("input[placeholder='Application name']:visible")
      .type(`test-mock-app-${Cypress.env('NAMESPACE_NAME')}`);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains(`test-mock-app-${Cypress.env('NAMESPACE_NAME')}`)
      .should('be.visible');
  });
});
