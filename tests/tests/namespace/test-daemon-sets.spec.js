/// <reference types="cypress" />
import 'cypress-file-upload';

const NAMESPACE = 'kube-system';
const DAEMONSET_NAME = 'apiserver-proxy';

context('Test Daemon Sets', () => {
  Cypress.skipAfterFail();

  // Luigi throws error of the "replace" function when entering the Preferences dialog. Remove the code below after Luigi's removal
  Cypress.on('uncaught:exception', () => {
    return false;
  });

  before(() => {
    cy.loginAndSelectCluster();

    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
    cy.contains('Preferences').click();

    cy.getIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getIframeBody()
      .contains('.preferences-row', 'Show hidden Namespaces')
      .find('.fd-switch')
      .click();

    cy.getIframeBody()
      .contains('Close')
      .click();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('a', NAMESPACE)
      .click();
  });

  it('Inspect details and list', () => {
    cy.navigateTo('Workloads', 'Daemon Sets');

    cy.getIframeBody()
      .contains('a', DAEMONSET_NAME)
      .click();

    // name
    cy.getIframeBody().contains(DAEMONSET_NAME);

    // created pod
    cy.getIframeBody()
      .find('table')
      .contains(new RegExp(DAEMONSET_NAME + '-'))
      .click();

    // images
    cy.getIframeBody().contains(/gardener\/apiserver-proxy/);
    cy.getIframeBody().contains(/envoyproxy/);
  });
});
