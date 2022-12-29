/// <reference types="cypress" />

context('Create Application', () => {
  Cypress.skipAfterFail({ skipAllSuits: true });

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions([
      'examples/resources/applicationconnector/applications.yaml',
    ]);

    cy.loginAndSelectCluster();
  });

  it('Create Application', () => {
    cy.navigateTo('Integration', 'Applications');

    cy.contains('Create Application').click();

    cy.get('[arialabel="Application name"]input:visible').type(
      Cypress.env('APP_NAME'),
    );

    cy.contains('[role="dialog"] button', 'Create').click();

    cy.contains(Cypress.env('APP_NAME')).should('be.visible');
  });
});
