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

    cy.contains('ui5-button', 'Create Cron Job').click();

    cy.contains('Advanced').click();

    cy.get('[aria-label="CronJob name"]')
      .find('input')
      .type(CRON_JOB_NAME);

    cy.get('[placeholder="Minute"]')
      .find('input')
      .clear()
      .type(0);

    cy.get('[placeholder="Hour"]')
      .find('input')
      .clear()
      .type(0);

    cy.get('[placeholder="Day of Month"]')
      .find('input')
      .clear()
      .type(1);

    cy.get('[placeholder="Month"]')
      .find('input')
      .clear()
      .type('*');

    cy.get('[placeholder="Day of Week"]')
      .find('input')
      .clear()
      .type('*');
    cy.get(
      '[aria-label="expand Schedule: At 12:00 AM, on day 1 of the month"]',
    ).click();

    cy.contains('Command').click();

    cy.get('[placeholder="Command to run in a container"]')
      .find('input')
      .clear()
      .type('ls -la');

    cy.get('[aria-label="Container name"]')
      .find('input')
      .clear()
      .type('test-container');

    cy.get(
      '[placeholder="Enter the Docker image tag, for example, \'busybox\'"]',
    )
      .find('input')
      .clear()
      .type('busybox');

    cy.get('ui5-combobox[value="IfNotPresent"]')
      .find('ui5-icon[accessible-name="Select Options"]')
      .click();

    cy.get('ui5-li:visible')
      .contains('Always')
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Checking details', () => {
    cy.get('ui5-breadcrumbs')
      .find(`ui5-link[href*=${'cronjob'}]`)
      .scrollIntoView();

    cy.contains('ui5-title', CRON_JOB_NAME).should('be.visible');

    cy.contains('0 0 1 * *').should('be.visible');
  });

  it('Edit Cron Job', () => {
    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    cy.get('[placeholder="Hour"]')
      .find('input')
      .clear()
      .type('*');

    cy.get('[placeholder="Day of Month"]')
      .find('input')
      .clear()
      .type('*');

    cy.get('[placeholder="Month"]')
      .find('input')
      .clear()
      .type('*');

    cy.get('[aria-label="expand Command"]').click();

    cy.get('[placeholder="Command to run in a container"]')
      .find('input')
      .clear()
      .type('ls');

    cy.get('[aria-label="Container name"]')
      .find('input')
      .clear()
      .type('test-busybox');

    cy.get(
      '[placeholder="Enter the Docker image tag, for example, \'busybox\'"]',
    )
      .find('input')
      .clear()
      .type('busytest');

    cy.get('ui5-combobox[value="Always"]')
      .find('ui5-icon[accessible-name="Select Options"]')
      .click();

    cy.get('ui5-li:visible')
      .contains('Never')
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Update')
      .should('be.visible')
      .click();
  });

  it('Checking updates details', () => {
    cy.get('ui5-breadcrumbs')
      .find(`ui5-link[href*=${'cronjob'}]`)
      .scrollIntoView();

    cy.contains('ui5-title', CRON_JOB_NAME).should('be.visible');

    cy.contains('0 * * * *').should('be.visible');
  });

  it('Inspect list', () => {
    cy.inspectList('Cron Jobs', CRON_JOB_NAME);
  });
});
