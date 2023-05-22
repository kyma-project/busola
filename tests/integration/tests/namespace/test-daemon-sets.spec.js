/// <reference types="cypress" />
import 'cypress-file-upload';

const NAMESPACE = 'kube-system';
const DAEMONSET_NAME = 'apiserver-proxy';

context('Test Daemon Sets', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.contains('a', NAMESPACE).click();
  });

  it('Inspect details and list', () => {
    cy.navigateTo('Workloads', 'Daemon Sets');

    cy.contains('a', DAEMONSET_NAME).click();

    // name
    cy.contains(DAEMONSET_NAME);

    // created pod
    cy.get('table')
      .contains(new RegExp(DAEMONSET_NAME + '-'))
      .click();

    // images
    cy.contains(/gardener\/apiserver-proxy/);
    cy.contains(/envoyproxy/);
  });
});
