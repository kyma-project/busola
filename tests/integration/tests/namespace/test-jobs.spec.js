/// <reference types="cypress" />
import 'cypress-file-upload';

const JOB_NAME =
  'test-job-' +
  Math.random()
    .toString()
    .substr(2, 8);

const SECOND_CONTAINER_NAME = JOB_NAME + '-node';

function checkJobLogs({ showLogsSelector, expectedLogs }) {
  cy.get(showLogsSelector).click({ force: true });

  cy.contains(expectedLogs);

  cy.navigateBackTo(JOB_NAME, JOB_NAME);
}

context('Test Jobs', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Job', () => {
    cy.navigateTo('Workloads', /^Jobs/);

    cy.contains('Create Job').click();

    // job name
    cy.get('[ariaLabel="Job name"]:visible')
      .clear()
      .type(JOB_NAME);

    // job container name
    cy.get('[ariaLabel="Container name"]:visible').type(JOB_NAME);

    // job command
    cy.get('[placeholder^="Command to run"]:visible').type(
      '/bin/sh{downarrow}-c{downarrow}echo "Busola test"',
    );

    // job docker image
    cy.get('[placeholder^="Enter the Docker image tag"]:visible').type(
      'busybox',
    );

    // we can't edit Job's template, so we add 2 containers now
    cy.contains('Advanced').click();

    cy.contains('Add Container').click();
    cy.contains('Container 2').click();

    // job container name
    cy.get('[ariaLabel="Container name"]:visible').type(SECOND_CONTAINER_NAME);

    // job args
    cy.get('[aria-label="expand Args"]:visible').click();

    cy.get('[placeholder^="Arguments to the"]:visible').type(
      '-e{downarrow}console.log("Node image test");',
    );

    // job docker image
    cy.get('[placeholder^="Enter the Docker image tag"]:visible').type(
      'node:14-alpine',
    );

    // create
    cy.get('[role=dialog]')
      .get('ui5-button.fd-dialog__decisive-button')
      .contains('Create')
      .should('be.visible')
      .click();
  });

  it('Inspect details and created Pods', () => {
    // name
    cy.contains(JOB_NAME);

    // created pod
    cy.get('ui5-table-cell')
      .get('a.fd-link')
      .contains(JOB_NAME + '-')
      .click();

    // images for both containers
    cy.contains(/Imagebusybox/);
    cy.contains(/Imagenode:14-alpine/);

    // controlled-by
    cy.contains(`Job (${JOB_NAME})`);

    // status
    cy.get('[role="status"]', { timeout: 75 * 1000 })
      .first()
      .should('have.text', 'Completed');

    // check logs
    checkJobLogs({
      showLogsSelector: `[aria-label="view-logs-for-${JOB_NAME}"]`,
      expectedLogs: 'Busola test',
    });
    checkJobLogs({
      showLogsSelector: `[aria-label="view-logs-for-${SECOND_CONTAINER_NAME}"]`,
      expectedLogs: 'Node image test',
    });

    // back to job
    cy.contains(`Job (${JOB_NAME})`)
      .contains('a', JOB_NAME)
      .click();

    // pod status
    cy.contains('Completed');
  });

  it('Edit Job', () => {
    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    // containers section should be readonly
    cy.contains('After a Job is created, the containers are read-only.');

    cy.get('[role="dialog"]')
      .get('ui5-button[icon="add"][disabled="true"]')
      .contains('Add Container')
      .should('be.visible');

    // edit labels
    cy.get('[role=dialog]')
      .contains('Labels')
      .filter(':visible', { log: false })
      .click();

    cy.get('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('a');

    cy.get('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type('b');

    cy.get('ui5-button.fd-dialog__decisive-button')
      .contains('Update')
      .should('be.visible')
      .click();

    cy.contains('a=b');
  });

  it('Inspect list', () => {
    cy.inspectList('Jobs', JOB_NAME);
  });
});
