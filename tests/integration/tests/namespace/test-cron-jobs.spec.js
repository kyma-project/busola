/// <reference types="cypress" />
import 'cypress-file-upload';

const CRON_JOB_NAME = 'test-cron-job';

context('Test Cron Jobs', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Cron Job', () => {
    cy.navigateTo('Workloads', 'Cron Jobs');

    cy.contains('ui5-button', 'Create').click();

    cy.get('[aria-label="CronJob name"]')
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
      '[aria-label="expand Schedule: At 12:00 AM, on day 1 of the month"]',
    ).click();

    cy.contains('Command').click();

    cy.get('[placeholder="Command to run in a container"]')
      .find('input')
      .click()
      .clear()
      .type('ls -la', { force: true });

    cy.get('[aria-label="Container name"]')
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

    cy.get('.create-form')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Checking details', () => {
    cy.getMidColumn()
      .contains('ui5-title', CRON_JOB_NAME)
      .should('be.visible');

    cy.getMidColumn()
      .contains('0 0 1 * *')
      .should('be.visible');
  });

  it('Edit Cron Job', () => {
    cy.wait(1000);

    cy.getMidColumn().inspectTab('Edit');

    cy.get('[placeholder="Hour"]')
      .find('input')
      .clear({ force: true })
      .type('*', { force: true });

    cy.get('[placeholder="Day of Month"]')
      .find('input')
      .click()
      .clear()
      .type('*', { force: true });

    cy.get('[placeholder="Month"]')
      .find('input')
      .click()
      .clear()
      .type('*', { force: true });

    cy.get('[aria-label="expand Schedule: Every hour"]').click();

    cy.get('[aria-label="expand Command"]').click();

    cy.get('[placeholder="Command to run in a container"]')
      .find('input')
      .click()
      .clear()
      .type('ls', { force: true });

    cy.get('[aria-label="Container name"]')
      .find('input')
      .clear()
      .type('test-busybox', { force: true });

    cy.get(
      '[placeholder="Enter the Docker image tag, for example, \'busybox\'"]',
    )
      .find('input')
      .click()
      .clear()
      .type('busytest', { force: true });

    cy.get('ui5-combobox[value="Always"]')
      .find('ui5-icon[accessible-name="Select Options"]')
      .click();

    cy.get('ui5-li:visible')
      .contains('Never')
      .click();

    cy.saveEdit();
  });

  it('Checking updates details', () => {
    cy.getMidColumn().inspectTab('View');

    cy.getMidColumn()
      .contains('ui5-title', CRON_JOB_NAME)
      .should('be.visible');

    cy.getMidColumn()
      .contains('0 * * * *')
      .should('be.visible');
  });

  it('Inspect list', () => {
    cy.inspectList(CRON_JOB_NAME);
  });
});
