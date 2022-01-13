/// <reference types="cypress" />
const APPLICATION_NAME = `test-mock-app-${Cypress.env('NAMESPACE_NAME')}`;
const APPLICATION_DESCRIPTION = `test description`;

context('Test Application', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Go to application details', () => {
    cy.getLeftNav()
      .contains('Back to Namespaces')
      .click();

    cy.getLeftNav()
      .contains('Integration')
      .click();

    cy.getLeftNav()
      .contains('Applications')
      .click();

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
      .find('[placeholder="Enter Key"]')
      .filterWithNoValue()
      .type('label-key');

    cy.getIframeBody()
      .find('[placeholder="Enter Value"]')
      .filterWithNoValue()
      .first()
      .type('label-value');

    cy.getIframeBody()
      .find('[placeholder="Specify a description for your Application."]')
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
