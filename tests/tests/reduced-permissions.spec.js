/// <reference types="cypress" />

import config from '../config';

const id = Math.random()
  .toString()
  .substr(2, 8);

const SA_NAME = 'test-sa-' + id;
const CR_NAME = 'test-cr-' + id;
const CRB_NAME = 'test-crb-' + id;

function chooseComboboxOption(selector, optionText) {
  cy.getIframeBody()
    .find(selector)
    .filterWithNoValue()
    .type(optionText);
  cy.getIframeBody()
    .contains(optionText)
    .click();
}

context('Reduced permissions', () => {
  let namespace;
  let kubeconfig;
  let c;

  // before(() => {
  //   cy.loginAndSelectCluster();
  //   cy.task('getNamespace').then(ns => (namespace = ns));
  // });

  // it('Create Cluster Role with reduced permissions', () => {
  //   cy.getLeftNav()
  //     .contains('Configuration')
  //     .click();
  //   cy.getLeftNav()
  //     .contains('Cluster Roles')
  //     .click();

  //   cy.getIframeBody()
  //     .contains('Create Cluster Role')
  //     .type(CR_NAME);

  //   cy.getIframeBody()
  //     .find('[placeholder="Role Name"]:visible')
  //     .type(CR_NAME);

  //   // api groups
  //   chooseComboboxOption(
  //     '[placeholder^="Start typing to select API"]:visible',
  //     '(core)',
  //   );

  //   chooseComboboxOption(
  //     '[placeholder^="Start typing to select API"]:visible',
  //     'apps',
  //   );

  //   // resources
  //   chooseComboboxOption(
  //     '[placeholder^="Start typing to select Resources"]:visible',
  //     'namespaces',
  //   );

  //   chooseComboboxOption(
  //     '[placeholder^="Start typing to select Resources"]:visible',
  //     'deployments',
  //   );

  //   // verbs
  //   chooseComboboxOption(
  //     '[placeholder^="Start typing to select Verbs"]:visible',
  //     'get',
  //   );

  //   chooseComboboxOption(
  //     '[placeholder^="Start typing to select Verbs"]:visible',
  //     'list',
  //   );

  //   cy.getIframeBody()
  //     .find('[role="dialog"]')
  //     .contains('button', 'Create')
  //     .click();
  // });

  // it('Create Service Account', () => {
  //   // for some reason "Namespaces" node gets detached from DOM
  //   cy.reload();

  //   cy.getLeftNav()
  //     .contains('Namespaces')
  //     .click();

  //   cy.goToNamespaceDetails();

  //   cy.getLeftNav()
  //     .contains('Configuration')
  //     .click();

  //   cy.getLeftNav()
  //     .contains('Service Accounts')
  //     .click();

  //   cy.getIframeBody()
  //     .contains('Create Service Account')
  //     .click();

  //   cy.getIframeBody()
  //     .find('[placeholder="Service Account Name"]:visible')
  //     .type(SA_NAME);

  //   cy.getIframeBody()
  //     .find('[role="dialog"]')
  //     .contains('button', 'Create')
  //     .click();
  // });

  // it('Create a ClusterRoleBinding for SA and CR', () => {
  //   cy.getLeftNav()
  //     .contains('Back to Namespaces')
  //     .click();

  //   cy.getLeftNav()
  //     .contains('Configuration')
  //     .click();

  //   cy.getLeftNav()
  //     .contains('Cluster Role Bindings')
  //     .click();

  //   cy.getIframeBody()
  //     .contains('Create Cluster Role Binding')
  //     .click();

  //   // subject type - select it first so the list starts loading
  //   cy.getIframeBody()
  //     .contains('User')
  //     .click();
  //   cy.getIframeBody()
  //     .contains('ServiceAccount')
  //     .click();

  //   // name
  //   cy.getIframeBody()
  //     .find('[placeholder="Cluster Role Binding Name"]:visible')
  //     .type(CRB_NAME);

  //   // role
  //   cy.getIframeBody()
  //     .find(
  //       '[placeholder="Start typing to select Role Binding from the list."]:visible',
  //     )
  //     .type(CR_NAME);
  //   cy.getIframeBody()
  //     .contains(new RegExp(CR_NAME))
  //     .click();

  //   // service account namespace
  //   chooseComboboxOption('[placeholder="Select Namespace"]:visible', namespace);

  //   // service account name
  //   chooseComboboxOption('[placeholder="Select name"]:visible', SA_NAME);

  //   cy.getIframeBody()
  //     .find('[role="dialog"]')
  //     .contains('button', 'Create')
  //     .click();
  // });

  it('Download kubeconfig for Service Account', () => {
    // once again the navigation is broken, so clicking on anything with bring us to Cluster Overview
    cy.reload();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();
    cy.goToNamespaceDetails();

    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Service Accounts')
      .click();

    cy.getIframeBody()
      .contains(SA_NAME)
      .click();

    cy.getIframeBody()
      .find('[aria-label="Download Kubeconfig"]')
      .click();

    cy.task('listDownloads', Cypress.config('downloadsFolder')).then(
      fileNames => {
        const kubeconfigFileName = fileNames.find(name =>
          name.includes(SA_NAME),
        );
        c = kubeconfigFileName;
        cy.readFile(
          Cypress.config('downloadsFolder') + '/' + kubeconfigFileName,
        ).then(e => (kubeconfig = e));
      },
    );

    cy.get('[data-testid="app-switcher"]').click();

    cy.contains('Clusters Overview').click();

    cy.visit(`${config.clusterAddress}/clusters`);
    cy.getIframeBody()
      .contains('Add a Cluster')
      .click();

    // cy.getIframeBody()
    //   .contains('Drag file here')
    //   .attachFile(Cypress.config('downloadsFolder') + '/' + c, {
    //     subjectType: 'drag-n-drop',
    //   });

    cy.getIframeBody()
      .find('textarea[aria-roledescription="editor"]')
      .filter(':visible')
      .type('{selectall}{backspace}{selectall}{backspace}')
      .paste({
        pastePayload: 'aaaa',
      });

    // cy.getIframeBody()
    //   .contains('Next')
    //   .click();

    // cy.getIframeBody()
    //   .contains('Add Cluster')
    //   .click();
  });
});
