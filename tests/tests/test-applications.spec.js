/// <reference types="cypress" />
const APPLICATION_NAME = `test-mock-app-${Cypress.env('NAMESPACE_NAME')}`;
const APPLICATION_DESCRIPTION = `test description`;

context('Test Applications', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Go to application details', () => {
    cy.navigateTo('Integration', 'Applications');

    cy.getIframeBody()
      .contains('a', APPLICATION_NAME)
      .should('be.visible')
      .click();
  });

  it('Edit an application', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();
    cy.getIframeBody()
      .find('[aria-label="expand Labels"]')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]')
      .filterWithNoValue()
      .type('label-key');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]')
      .filterWithNoValue()
      .first()
      .type('label-value');

    cy.getIframeBody()
      .find('[placeholder="Specify a description for your Application"]')
      .type(APPLICATION_DESCRIPTION);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();
  });

  it('Inspect an updated application', () => {
    cy.getIframeBody().contains('label-key=label-value');
    cy.getIframeBody().contains(APPLICATION_DESCRIPTION);
  });
});
