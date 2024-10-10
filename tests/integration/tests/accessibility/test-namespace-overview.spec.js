/// <reference types="cypress" />

context('Accessibility test Namespace overview', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
  });

  it('Acc test namespace overview', () => {
    cy.loginAndSelectCluster();

    // cy.url().should('match', /overview$/);

    cy.createNamespace('acc-test-namespace');

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP();
  });
});
