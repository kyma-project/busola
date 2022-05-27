/// <reference types="cypress" />
const APPLICATION_NAME = Cypress.env('APP_NAME');
const APPLICATION_DESCRIPTION = `test description`;

const serviceRequestData = {
  method: 'GET',
  url: /connector-service-internal-api/,
};

context('Test Applications', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Inspect list', () => {
    cy.intercept(serviceRequestData, { statusCode: 200, body: '{}' });
    cy.navigateTo('Integration', 'Applications');

    cy.getIframeBody()
      .contains('Status')
      .should('be.visible');
  });

  it('Inspect details', () => {
    cy.intercept(serviceRequestData, { statusCode: 200, body: '{}' });

    cy.getIframeBody()
      .contains('a', APPLICATION_NAME)
      .should('be.visible')
      .click();

    cy.getIframeBody()
      .contains('Connect Application')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Status')
      .should('be.visible');
  });

  it('Edit an application', () => {
    cy.getIframeBody()
      .contains('Edit')
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
      .find('[placeholder="Provide a description for your Application"]')
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

  it('When APPLICATION_CONNECTOR_FLOW is disabled', () => {
    cy.intercept(serviceRequestData, { statusCode: 404 });
    cy.getLeftNav()
      .contains('Applications')
      .click();

    // make sure the table row is rendered before performing 'not.exist' checks
    cy.getIframeBody()
      .contains(APPLICATION_NAME)
      .should('exist');

    cy.getIframeBody()
      .contains('Status')
      .should('not.exist');

    cy.getIframeBody()
      .contains('a', APPLICATION_NAME)
      .should('be.visible')
      .click();

    cy.getIframeBody()
      .contains('Connect Application')
      .should('not.exist');

    cy.getIframeBody()
      .contains('Status')
      .should('not.exist');
  });
});
