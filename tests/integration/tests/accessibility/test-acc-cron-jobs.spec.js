/// <reference types="cypress" />

import 'cypress-file-upload';

const NAMESPACE_NAME = 'acc-cron-jobs';
const CRON_JOB_NAME = 'acc-test-cron-job';

context('Accessibility test Cron Jobs', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
    cy.loginAndSelectCluster();
    cy.createNamespace(NAMESPACE_NAME);
  });

  it('Acc test Cron Jobs list', () => {
    cy.loginAndSelectCluster();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .type(NAMESPACE_NAME);

    cy.clickGenericListLink(NAMESPACE_NAME);

    cy.navigateTo('Workloads', 'Cron Jobs');

    cy.contains('ui5-title', 'Cron Jobs').should('be.visible');

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Cron Jobs list',
      );
  });

  it('Acc test Cron Jobs create', () => {
    cy.openCreate();

    cy.getMidColumn()
      .contains('ui5-title', 'Create Cron Job')
      .should('be.visible');

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Cron Jobs create',
      );
  });

  it('Acc test Cron Jobs details', () => {
    cy.get('[accessible-name="CronJob name"]')
      .find('input')
      .type(CRON_JOB_NAME, { force: true });

    cy.get('[placeholder="Minute"]')
      .find('input')
      .click()
      .clear()
      .type(0, { force: true });

    cy.get('[placeholder="Hour"]')
      .find('input')
      .click()
      .clear()
      .type(0, { force: true });

    cy.get('[placeholder="Day of Month"]')
      .find('input')
      .click()
      .clear()
      .type(1, { force: true });

    cy.get('[placeholder="Month"]')
      .find('input')
      .click()
      .clear()
      .type('*', { force: true });

    cy.get('[placeholder="Day of Week"]')
      .find('input')
      .click()
      .clear()
      .type('*', { force: true });

    cy.get(
      '[aria-label="Schedule: At 12:00 AM, on day 1 of the month, expanded"]',
    ).click();

    cy.contains('Command').click();

    cy.get('[placeholder="Command to run in a container"]')
      .find('input')
      .click()
      .clear()
      .type('ls -la', { force: true });

    cy.get('[accessible-name="Container name"]')
      .find('input')
      .click()
      .clear()
      .type('test-container', { force: true });

    cy.get(
      '[placeholder="Enter the Docker image tag, for example, \'busybox\'"]',
    )
      .find('input')
      .click()
      .clear()
      .type('busybox', { force: true });

    cy.get('ui5-combobox[value="IfNotPresent"]')
      .find('ui5-icon[accessible-name="Select Options"]')
      .click();

    cy.get('ui5-li:visible')
      .contains('Always')
      .click();

    cy.saveChanges('Create');

    cy.getMidColumn()
      .contains('ui5-title', CRON_JOB_NAME)
      .should('be.visible');

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Cron Jobs details',
      );
  });
});
