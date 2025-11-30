/// <reference types="cypress" />

context('Accessibility test Modules view', () => {
  before(() => {
    cy.handleExceptions();
    cy.loginAndSelectCluster();
    cy.setUpContinuum('continuum/continuum.conf.js');
  });

  it('Acc test Modules view', () => {
    cy.wait(2000);

    cy.get('ui5-card').contains('Modify Modules').click();

    cy.wait(1000);

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Modules view',
      );
  });

  it('Acc test add Modules view', () => {
    cy.get('ui5-panel').contains('ui5-button', 'Add').click();

    cy.wait(1000);

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Add Modules view',
      );
  });

  it('Acc test edit Modules view', () => {
    cy.get('ui5-card').contains('api-gateway').should('be.visible');

    cy.get('ui5-title').contains('api-gateway').click();

    cy.get('[data-testid="create-form-footer-bar"]')
      .contains('ui5-button:visible', 'Add')
      .click();

    cy.wait(7000);

    cy.get('ui5-table-row').contains('api-gateway').should('be.visible');

    cy.inspectTab('Edit');

    cy.wait(1000);

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Edit Modules view',
      );
  });
});
