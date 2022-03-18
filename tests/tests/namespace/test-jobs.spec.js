/// <reference types="cypress" />
import 'cypress-file-upload';
import { deleteFromGenericList } from '../../support/helpers';

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
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Job', () => {
    cy.navigateTo('Workloads', /^Jobs/);

    cy.getIframeBody()
      .contains('Create Job')
      .click();

    // job name
    cy.getIframeBody()
      .find('[ariaLabel="Job name"]:visible')
      .clear()
      .type(JOB_NAME);

    // job container name
    cy.getIframeBody()
      .find('[ariaLabel="Container name"]:visible')
      .type(JOB_NAME);

    // job command
    cy.getIframeBody()
      .find('[placeholder^="Command to run"]:visible')
      .type('/bin/sh{downarrow}-c{downarrow}echo "Busola test"');

    // job docker image
    cy.getIframeBody()
      .find('[placeholder^="Enter the Docker image tag"]:visible')
      .type('busybox');

    // we can't edit Job's template, so we add 2 containers now
    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .contains('Add Container')
      .click();
    cy.getIframeBody()
      .contains('Container 2')
      .click();

    // job container name
    cy.getIframeBody()
      .find('[ariaLabel="Container name"]:visible')
      .type(SECOND_CONTAINER_NAME);

    // job args
    cy.getIframeBody()
      .contains('Args')
      .click();

    cy.getIframeBody()
      .find('[placeholder^="Arguments to the"]:visible')
      .type('-e{downarrow}console.log("Node image test");');

    // job docker image
    cy.getIframeBody()
      .find('[placeholder^="Enter the Docker image tag"]:visible')
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
      .contains(new RegExp(JOB_NAME + '-'))
      .click();

    // images for both containers
    cy.getIframeBody().contains(/Imagebusybox/);
    cy.getIframeBody().contains(/Imagenode:14-alpine/);

    // controlled-by
    cy.getIframeBody().contains(`Job (${JOB_NAME})`);

    // status
    cy.getIframeBody()
      .find('[role="status"]', { timeout: 30 * 1000 })
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
    cy.getIframeBody()
      .contains(`Job (${JOB_NAME})`)
      .contains(JOB_NAME)
      .click();

    // pod status
    cy.getIframeBody().contains('Completed');
  });

  it('Edit Job', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    // containers section should be readonly
    cy.getIframeBody().contains(
      'After a Job is created, the containers are read-only.',
    );

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
      .find('[placeholder="Enter key"]')
      .filterWithNoValue()
      .type('a');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]')
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
      .contains('a', /^Jobs/)
      .click();

    deleteFromGenericList(JOB_NAME);
  });
});
