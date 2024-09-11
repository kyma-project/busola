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

  it('Create Application', () => {
    cy.navigateTo('Integration', 'Applications');

    cy.openCreate();

    cy.get('[aria-label="Application name"]')
      .find('input')
      .click()
      .type(Cypress.env('APP_NAME'), { force: true });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();

    cy.contains(Cypress.env('APP_NAME')).should('be.visible');
  });

  it('Inspect list', () => {
    cy.intercept(serviceRequestData, { statusCode: 200, body: '{}' });

    cy.getLeftNav()
      .contains('Applications')
      .click();

    cy.get('ui5-table-row')
      .contains('a', APPLICATION_NAME)
      .click();
  });

  it('Inspect details', () => {
    cy.intercept(serviceRequestData, { statusCode: 200, body: '{}' });

    cy.contains('Access Label').should('be.visible');

    cy.contains('span', APPLICATION_NAME).should('be.visible');

    cy.contains('Provided Services and Events').should('be.visible');
  });

  it('Edit an application', () => {
    cy.contains('ui5-button', 'Edit').click();

    cy.get('[aria-label="expand Labels"]').click();

    cy.get('[placeholder="Enter key"]:visible')
      .find('input')
      .filterWithNoValue()
      .type('labelkey');

    cy.get('[placeholder="Enter value"]:visible')
      .find('input')
      .filterWithNoValue()
      .first()
      .type('labelvalue');

    cy.get('[placeholder="Provide a description for your Application"]')
      .find('input')
      .type(APPLICATION_DESCRIPTION);

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Update')
      .should('be.visible')
      .click();
  });

  it('Inspect an updated application', () => {
    cy.contains('labelkey=labelvalue');
    cy.contains(APPLICATION_DESCRIPTION);
  });

  it('Delete the Application', () => {
    cy.getLeftNav()
      .contains('Applications')
      .click();

    cy.deleteFromGenericList('Application', Cypress.env('APP_NAME'));
  });
});
