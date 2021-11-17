/// <reference types="cypress" />
import 'cypress-file-upload';

const JOB_NAME =
  'test-job-' +
  Math.random()
    .toString()
    .substr(2, 8);

const SECOND_CONTAINER_NAME = JOB_NAME + '-node';

function checkJobLogs({ showLogsSelector, expectedLogs }) {
  cy.getIframeBody()
    .find(showLogsSelector)
    .click();

  cy.getIframeBody().contains(expectedLogs);

  // back to pod details
  cy.getIframeBody()
    .find('[role=menu]')
    .contains(JOB_NAME)
    .click();
}

context('Test Jobs', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Jobs node should be present', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains(/^Jobs/) // regex so Cypress doesn't confuse them with CronJobs
      .click();
  });

  it('Create Job', () => {
    cy.getIframeBody()
      .contains('Create Job')
      .click();

    // job name
    cy.getIframeBody()
      .find('[placeholder="Job Name"]')
      .filter(':visible', { log: false })
      .clear()
      .type(JOB_NAME);

    // job container name
    cy.getIframeBody()
      .find('[placeholder="Container Name"]')
      .filter(':visible', { log: false })
      .type(JOB_NAME);

    // job command
    cy.getIframeBody()
      .find('[placeholder^="Command to run"]')
      .filter(':visible', { log: false })
      .type('/bin/sh{downarrow}-c{downarrow}echo "Busola test"');

    // job docker image
    cy.getIframeBody()
      .find('[placeholder^="Enter the Docker image tag"]')
      .filter(':visible', { log: false })
      .type('busybox');

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    // we can't edit Job's template, so we add 2 containers now
    cy.getIframeBody()
      .contains('Add Container')
      .click();

    cy.getIframeBody()
      .contains('Container 2')
      .click();

    // job container name
    cy.getIframeBody()
      .find('[placeholder="Container Name"]')
      .filter(':visible', { log: false })
      .type(SECOND_CONTAINER_NAME);

    cy.getIframeBody()
      .contains('Args')
      .click();

    // job args
    cy.getIframeBody()
      .find('[placeholder^="Arguments to the"]')
      .filter(':visible', { log: false })
      .type('-e{downarrow}console.log("Node image test");');

    // job docker image
    cy.getIframeBody()
      .find('[placeholder^="Enter the Docker image tag"]')
      .filter(':visible', { log: false })
      .type('node:14-alpine');

    // create
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Inspect details and created Pods', () => {
    // name
    cy.getIframeBody().contains(JOB_NAME);

    // created pod
    cy.getIframeBody()
      .contains(new RegExp(JOB_NAME + '-'), { timeout: 5 * 1000 })
      .click();

    // images for both containers
    cy.getIframeBody().contains(/Image:busybox/);
    cy.getIframeBody().contains(/Image:node:14-alpine/);

    // controlled-by
    cy.getIframeBody().contains(`Job (${JOB_NAME})`);

    // status
    cy.getIframeBody()
      .find('[role="status"]', { timeout: 15 * 1000 })
      .should('have.text', 'COMPLETED');

    // check logs
    checkJobLogs({
      showLogsSelector: `[aria-label="view-logs-for-${JOB_NAME}"]`,
      expectedLogs: 'Busola test',
    });
    checkJobLogs({
      showLogsSelector: `[aria-label="view-logs-for-${SECOND_CONTAINER_NAME}"]`,
      expectedLogs: 'Node image test',
    });

    // sometimes ControlledBy component still renders CRD(?) path instead of our predefined path - wait until it loads
    cy.wait(500);

    // back to job
    cy.getIframeBody()
      .contains(`Job (${JOB_NAME})`)
      .contains(JOB_NAME)
      .click();

    // pod status
    cy.getIframeBody().contains('COMPLETED');
  });

  it('Edit Job', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    // containers section should be readonly
    cy.getIframeBody().contains('Containers are readonly in edit mode.');

    cy.getIframeBody()
      .contains('Add Container')
      .filter(':visible', { log: false })
      .should('be.disabled');

    // edit labels
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Labels')
      .filter(':visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Key"]')
      .filterWithNoValue()
      .type('a');

    cy.getIframeBody()
      .find('[placeholder="Enter Value"]')
      .filterWithNoValue()
      .first()
      .type('b');

    cy.getIframeBody()
      .contains('button', 'Update')
      .click();

    cy.getIframeBody().contains('a=b');
  });

  it('Inspect list', () => {
    cy.getIframeBody()
      .contains('Jobs')
      .click();

    cy.getIframeBody().contains(JOB_NAME);
  });
});
