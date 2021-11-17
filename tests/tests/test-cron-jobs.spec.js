/// <reference types="cypress" />
import 'cypress-file-upload';

const CRON_JOB_NAME = 'test-cron-job';

context('Create a Cron Job', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to Cron Job', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Cron Jobs')
      .click();
  });

  it('Create Cron Job', () => {
    cy.getIframeBody()
      .contains('Create Cron Job')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Cron Job Name"]')
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
      .find('[placeholder="Container Name"]')
      .clear()
      .type('test-container');

    cy.getIframeBody()
      .find(
        '[placeholder="Enter the Docker image tag, for example, \'busybox\'."]',
      )
      .clear()
      .type('busybox');

    cy.getIframeBody()
      .contains('Command')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Command to run in a container."]')
      .clear()
      .type('ls -la');

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

  it('Create Cron Job', () => {
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
});
