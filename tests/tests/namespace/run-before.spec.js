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
      .find('[aria-label="expand Apply Total Memory Quotas"]')
      .contains('Choose option')
      .click();

    cy.getIframeBody()
      .contains('XL (limits: 9Gi')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find('input[ariaLabel="Namespace name"]:visible')
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
      .contains('button', 'Update')
      .click();
  });
});
