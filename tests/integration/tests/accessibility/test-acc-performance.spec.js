/// <reference types="cypress" />
import config from '../../config';

context('Accessibility test Cluster list and overview', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
    cy.loginAndSelectCluster();
  });

  it('Acc test with performance panel open', () => {
    cy.get('[title="Profile"]').click();

    cy.get('ui5-menu-item:visible')
      .contains('Preferences')
      .click({ force: true });

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Performance panel',
      );
  });
});
