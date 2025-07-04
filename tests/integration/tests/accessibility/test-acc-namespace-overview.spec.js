/// <reference types="cypress" />

context('Accessibility test Namespace overview', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
  });

  it('Acc test namespace overview', () => {
    cy.loginAndSelectCluster();

    cy.url().should('match', /overview$/);

    cy.createNamespace('acc-test-namespace');

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Namespace overview',
      );
  });
});
