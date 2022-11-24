/// <reference types="cypress" />
import 'cypress-file-upload';

context('Clean up Application', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions([
      'examples/resources/applicationconnector/applications.yaml',
    ]);

    cy.loginAndSelectCluster();
  });

  it('Delete the Application', () => {
    cy.navigateTo('Integration', 'Applications');

    cy.deleteFromGenericList(Cypress.env('APP_NAME'));
  });
});
