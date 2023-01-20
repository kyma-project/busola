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

    cy.contains('Create Cron Job').click();

    cy.contains('Advanced').click();

    cy.get('[ariaLabel="CronJob name"]').type(CRON_JOB_NAME);

    cy.get('[placeholder="Minute"]')
      .clear()
      .type(0);

    cy.get('[placeholder="Hour"]')
      .clear()
      .type(0);

    cy.get('[placeholder="Day of Month"]')
      .clear()
      .type(1);

    cy.get('[placeholder="Month"]')
      .clear()
      .type('*');

    cy.get('[placeholder="Day of Week"]')
      .clear()
      .type('*');

    cy.contains('Command').click();

    cy.get('[placeholder="Command to run in a container"]')
      .clear()
      .type('ls -la');

    cy.get('[ariaLabel="Container name"]')
      .clear()
      .type('test-container');

    cy.get(
      '[placeholder="Enter the Docker image tag, for example, \'busybox\'"]',
    )
      .clear()
      .type('busybox');

    cy.contains('IfNotPresent').click();

    cy.contains('Always').click();

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.contains(CRON_JOB_NAME).click();

    cy.contains(CRON_JOB_NAME).should('be.visible');

    cy.contains('0 0 1 * *').should('be.visible');
  });

  it('Edit Cron Job', () => {
    cy.contains('Edit').click();

    cy.get('[placeholder="Hour"]')
      .clear()
      .type('*');

    cy.get('[placeholder="Day of Month"]')
      .clear()
      .type('*');

    cy.get('[placeholder="Month"]')
      .clear()
      .type('*');

    cy.get('[aria-label="expand Command"]').click();

    cy.get('[placeholder="Command to run in a container"]')
      .clear()
      .type('ls');

    cy.get('[ariaLabel="Container name"]')
      .clear()
      .type('test-busybox');

    cy.get(
      '[placeholder="Enter the Docker image tag, for example, \'busybox\'"]',
    )
      .clear()
      .type('busytest');

    cy.contains('[data-testid="select-dropdown"]', 'Always').click();

    cy.contains('Never').click();

    cy.get('[role="dialog"]')
      .contains('button', 'Update')
      .click();
  });

  it('Checking updates details', () => {
    cy.contains(CRON_JOB_NAME).should('be.visible');

    cy.contains('0 * * * *').should('be.visible');
  });

  it('Inspect list', () => {
    cy.inspectList('Cron Jobs', CRON_JOB_NAME);
  });
});
