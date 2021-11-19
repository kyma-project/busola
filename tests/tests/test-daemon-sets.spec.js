/// <reference types="cypress" />
import 'cypress-file-upload';

const NAMESPACE = 'kube-system';
const DAEMONSET_NAME = 'apiserver-proxy';

context('Test Daemon Sets', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Change system preferences', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
    cy.contains('Preferences').click();

    cy.getModalIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getModalIframeBody()
      .contains('.preferences-row', 'Show hidden Namespaces')
      .find('.fd-switch')
      .click();

    cy.get('[aria-label="close"]').click();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('a', NAMESPACE)
      .click();
  });

  it('Inspect Daemon Sets list', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Daemon Sets')
      .click();

    cy.getIframeBody()
      .contains('h3', 'Daemon Sets')
      .should('be.visible');

    cy.getIframeBody().contains(DAEMONSET_NAME);
  });

  it('Inspect details', () => {
    cy.getIframeBody()
      .contains('a', DAEMONSET_NAME)
      .click();

    // name
    cy.getIframeBody().contains(DAEMONSET_NAME);

    // created pod
    cy.getIframeBody()
      .contains(new RegExp(DAEMONSET_NAME + '-'), { timeout: 5 * 1000 })
      .click();

    // images
    cy.getIframeBody().contains(/gardener\/apiserver-proxy/);
    cy.getIframeBody().contains(/envoyproxy\/envoy-alpine/);
  });
});
