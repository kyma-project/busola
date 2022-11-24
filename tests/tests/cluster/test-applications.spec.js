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
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions([
      'examples/resources/applicationconnector/applications.yaml',
    ]);

    cy.loginAndSelectCluster();
  });

  it('Inspect list', () => {
    cy.intercept(serviceRequestData, { statusCode: 200, body: '{}' });
    cy.navigateTo('Integration', 'Applications');

    cy.getIframeBody()
      .contains('a', APPLICATION_NAME)
      .should('be.visible')
      .click();
  });

  it('Inspect details', () => {
    cy.intercept(serviceRequestData, { statusCode: 200, body: '{}' });

    cy.getIframeBody()
      .contains('Access Label')
      .should('be.visible');

    cy.getIframeBody()
      .contains('span', APPLICATION_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains('Provided Services and Events')
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
      .find('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('labelkey');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type('labelvalue');

    cy.getIframeBody()
      .find('[placeholder="Provide a description for your Application"]')
      .type(APPLICATION_DESCRIPTION);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();
  });

  it('Inspect an updated application', () => {
    cy.getIframeBody().contains('labelkey=labelvalue');
    cy.getIframeBody().contains(APPLICATION_DESCRIPTION);
  });
});
