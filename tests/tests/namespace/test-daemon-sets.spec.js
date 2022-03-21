/// <reference types="cypress" />
import 'cypress-file-upload';
import { deleteFromGenericList } from '../../support/helpers';

const NAMESPACE = 'kube-system';
const DAEMONSET_NAME = 'apiserver-proxy';

context('Test Daemon Sets', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();

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

  it('Inspect details', () => {
    cy.navigateTo('Workloads', 'Daemon Sets');

    cy.getIframeBody()
      .contains('a', DAEMONSET_NAME)
      .click();

    // name
    cy.getIframeBody().contains(DAEMONSET_NAME);

    // created pod
    cy.getIframeBody()
      .contains(new RegExp(DAEMONSET_NAME + '-'))
      .click();

    // images
    cy.getIframeBody().contains(/gardener\/apiserver-proxy/);
    cy.getIframeBody().contains(/envoyproxy\/envoy-alpine/);
  });

  it('Inspect Daemon Sets list', () => {
    cy.getLeftNav()
      .contains('Daemon Sets')
      .click();

    cy.inspectList('Daemon Sets', DAEMONSET_NAME);
  });
});
