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

    cy.getIframeBody()
      .contains('Create Cron Job')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Cron Job name"]')
      .type(CRON_JOB_NAME);

    cy.getIframeBody()
      .find('[placeholder="Minute"]')
      .clear()
      .type(0);

    cy.getIframeBody()
      .find('[placeholder="Hour"]')
      .clear()
      .type(0);

    cy.getIframeBody()
      .find('[placeholder="Day of Month"]')
      .clear()
      .type(1);

    cy.getIframeBody()
      .find('[placeholder="Month"]')
      .clear()
      .type('*');

    cy.getIframeBody()
      .find('[placeholder="Day of Week"]')
      .clear()
      .type('*');

    cy.getIframeBody()
      .contains('Command')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Command to run in a container"]')
      .clear()
      .type('ls -la');

    cy.getIframeBody()
      .find('[ariaLabel="Container name"]')
      .clear()
      .type('test-container');

    cy.getIframeBody()
      .find(
        '[placeholder="Enter the Docker image tag, for example, \'busybox\'"]',
      )
      .clear()
      .type('busybox');

    cy.getIframeBody()
      .contains('IfNotPresent')
      .click();

    cy.getIframeBody()
      .contains('Always')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.getIframeBody()
      .contains(CRON_JOB_NAME)
      .click();

    cy.getIframeBody()
      .contains(CRON_JOB_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains('0 0 1 * *')
      .should('be.visible');
  });

  it('Edit Cron Job', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Hour"]')
      .clear()
      .type('*');

    cy.getIframeBody()
      .find('[placeholder="Day of Month"]')
      .clear()
      .type('*');

    cy.getIframeBody()
      .find('[placeholder="Month"]')
      .clear()
      .type('*');

    cy.getIframeBody()
      .contains('Command')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Command to run in a container"]')
      .clear()
      .type('ls');

    cy.getIframeBody()
      .find('[ariaLabel="Container name"]')
      .clear()
      .type('test-busybox');

    cy.getIframeBody()
      .find(
        '[placeholder="Enter the Docker image tag, for example, \'busybox\'"]',
      )
      .clear()
      .type('busytest');

    cy.getIframeBody()
      .contains('Always')
      .click();

    cy.getIframeBody()
      .contains('Never')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Update')
      .click();
  });

  it('Checking updates details', () => {
    cy.getIframeBody()
      .contains(CRON_JOB_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains('0 * * * *')
      .should('be.visible');
  });
});
