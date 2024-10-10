/// <reference types="cypress" />
import config from '../../config';
const date = new Date();
const todaysDate =
  date.getMonth() +
  1 +
  '/' +
  date.getDate() +
  '/' +
  date.getFullYear() +
  '-' +
  (date.getUTCHours() + 2) +
  ':' +
  date.getUTCMinutes();
const reportName = `AMP REPORT ${todaysDate}`;

context('Accessibility test Cluster list and overview', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
  });

  it('Acc test clusters list', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(reportName);
  });

  it('Acc test cluster overview', () => {
    cy.loginAndSelectCluster();

    cy.url().should('match', /overview$/);

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(reportName);
  });

  it('Acc test namespace overview', () => {
    cy.loginAndSelectCluster();

    cy.url().should('match', /overview$/);

    cy.createNamespace('acc-test-namespace');

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(reportName);
  });
});
