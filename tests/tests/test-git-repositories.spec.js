/// <reference types="cypress" />
import 'cypress-file-upload';

const REPOSITORY_NAME =
  'test-repo-' +
  Math.random()
    .toString()
    .substr(2, 8);

context('Test Git Repositories', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Repository', () => {
    cy.navigateTo('Configuration', 'Git Repositories');

    cy.getIframeBody()
      .contains('Connect Repository')
      .click();

    // name
    cy.getIframeBody()
      .find('[placeholder="Git Repository Name"]:visible', { log: false })
      .clear()
      .type(REPOSITORY_NAME);

    // url
    cy.getIframeBody()
      .find('[placeholder^="Enter the URL address"]:visible', { log: false })
      .type('https://test-repo');

    // create
    cy.getIframeBody()
      .contains('button', 'Create')
      .click();
  });

  it('Inspect details', () => {
    // name
    cy.getIframeBody().contains(REPOSITORY_NAME);
    // url
    cy.getIframeBody().contains('https://test-repo');
    // authorization
    cy.getIframeBody().contains(/none/i);
  });

  it('Edit Repository', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    // name should be disabled for edit
    cy.getIframeBody()
      .find('[placeholder="Git Repository Name"]:visible', { log: false })
      .should('have.attr', 'readonly');

    // edit url
    cy.getIframeBody()
      .find('[placeholder^="Enter the URL address"]:visible', { log: false })
      .type('-edited');

    // edit authorization (Public -> Basic)
    cy.getIframeBody()
      .contains('Public')
      .filter(':visible', { log: false })
      .click();
    cy.getIframeBody()
      .contains('Basic')
      .filter(':visible', { log: false })
      .click();

    // fill secret
    cy.getIframeBody()
      .find('[placeholder^="Start typing to select Secret"]:visible', {
        log: false,
      })
      .type('default');
    cy.getIframeBody()
      .contains(/default-token/)
      .click();

    // move to Advanced
    cy.getIframeBody()
      .contains('Advanced')
      .click();

    // edit labels
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Labels')
      .filter(':visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Key"]')
      .filterWithNoValue()
      .type('is-edited');

    cy.getIframeBody()
      .find('[placeholder="Enter Value"]')
      .filterWithNoValue()
      .first()
      .type('yes');

    // hit update
    cy.getIframeBody()
      .contains('button', 'Update')
      .click();

    // label
    cy.getIframeBody().contains('is-edited=yes');
    // url
    cy.getIframeBody().contains('https://test-repo-edited');
    // authorization
    cy.getIframeBody().contains(/basic/i);
  });

  it('Inspect list', () => {
    cy.getIframeBody()
      .contains('Git Repositories')
      .click();

    // name
    cy.getIframeBody().contains(REPOSITORY_NAME);
    // url
    cy.getIframeBody().contains('https://test-repo-edited');
    // label
    cy.getIframeBody().contains('is-edited=yes');

    // navigate to secret
    cy.getIframeBody()
      .contains(/default-token/)
      .click();

    cy.getIframeBody().contains('Secrets');
    cy.getIframeBody().contains(/default-token/);
  });
});
