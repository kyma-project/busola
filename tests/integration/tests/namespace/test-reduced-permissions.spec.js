/// <reference types="cypress" />
import jsyaml from 'js-yaml';

import { chooseComboboxOption } from '../../support/helpers';

const id = Math.random()
  .toString()
  .substr(2, 8);

const SA_NAME = 'test-sa-' + id;
const CR_NAME = 'test-cr-' + id;
const CRB_NAME = 'test-crb-' + id;

context('Test reduced permissions', () => {
  let tempKubeconfigPath;

  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  after(() => {
    if (tempKubeconfigPath) {
      cy.task('removeFile', tempKubeconfigPath);
    }
  });

  it('Create Cluster Role with reduced permissions', () => {
    cy.navigateTo('Configuration', 'Cluster Roles');

    cy.contains('ui5-button', 'Create Cluster Role').click();

    cy.get('[aria-label="ClusterRole name"]:visible')
      .find('input')
      .type(CR_NAME, { force: true });

    // api groups
    chooseComboboxOption(
      '[placeholder^="Start typing to select API"]:visible',
      '(core)',
    );

    chooseComboboxOption(
      '[placeholder^="Start typing to select API"]:visible',
      'apps',
    );

    cy.get('ui5-button[aria-label="roles.buttons.load"]:visible').click();
    cy.wait(500);

    // resources
    chooseComboboxOption(
      '[placeholder^="Start typing to select Resources"]:visible',
      'namespaces',
    );

    chooseComboboxOption(
      '[placeholder^="Start typing to select Resources"]:visible',
      'deployments',
    );

    // verbs
    chooseComboboxOption(
      '[placeholder^="Start typing to select Verbs"]:visible',
      'get',
    );

    chooseComboboxOption(
      '[placeholder^="Start typing to select Verbs"]:visible',
      'list',
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Create Service Account', () => {
    cy.goToNamespaceDetails();

    cy.navigateTo('Configuration', 'Service Accounts');

    cy.contains('ui5-button', 'Create Service Account').click();

    cy.get('[aria-label="ServiceAccount name"]:visible')
      .find('input')
      .click()
      .type(SA_NAME);

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Create a ClusterRoleBinding for SA and CR', () => {
    cy.navigateTo('Back To Cluster Details', 'Cluster Role Bindings');

    cy.contains('ui5-button', 'Create Cluster Role Binding').click();

    // subject type - select it first so the list starts loading
    cy.get('ui5-dialog')
      .get('ui5-select:visible')
      .click();

    cy.get('ui5-li:visible')
      .contains('ServiceAccount')
      .find('li')
      .click({ force: true });

    // name
    cy.get('ui5-input[aria-label="ClusterRoleBinding name"]:visible')
      .find('input')
      .type(CRB_NAME);

    // role
    chooseComboboxOption(
      '[placeholder="Start typing to select ClusterRole from the list"]:visible',
      CR_NAME,
    );

    // service account namespace
    chooseComboboxOption(
      '[id="secret-namespace-combobox-0"][aria-label="Secret namespace Combobox"]:visible',
      Cypress.env('NAMESPACE_NAME'),
    );

    // service account name
    chooseComboboxOption(
      '[id="secret-name-combobox-0"][aria-label="Secret name Combobox"]',
      SA_NAME,
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Download kubeconfig for Service Account', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.goToNamespaceDetails();

    cy.getLeftNav()
      .contains('Service Accounts')
      .click();

    cy.contains('ui5-link', SA_NAME).click();

    cy.getMidColumn()
      .find('ui5-button[aria-label="full-screen"]')
      .click();

    cy.contains('ui5-button', 'Generate TokenRequest').click();

    cy.contains('ui5-button', 'Download Kubeconfig').click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();

    cy.wait(200);

    cy.task('listDownloads', Cypress.config('downloadsFolder')).then(
      fileNames => {
        let kubeconfigFileName = fileNames.find(name => name.includes(SA_NAME));

        // make sure we don't take temporary Chrome download file
        kubeconfigFileName = kubeconfigFileName.replace('.crdownload', '');

        tempKubeconfigPath =
          Cypress.config('downloadsFolder') + '/' + kubeconfigFileName;

        // make sure .crdownload is not here anymore
        cy.wait(100)
          .readFile(tempKubeconfigPath)
          .then(kubeconfigStr => {
            // change kubeconfig cluster name
            const kubeconfig = jsyaml.load(kubeconfigStr);

            kubeconfig.clusters[0].name = 'sa-cluster';
            kubeconfig.contexts[0].context.cluster = 'sa-cluster';

            cy.writeFile(
              'fixtures/sa-kubeconfig.yaml',
              jsyaml.dump(kubeconfig),
            );
          });
      },
    );

    cy.loginAndSelectCluster({
      fileName: 'sa-kubeconfig.yaml',
      expectedLocation: new RegExp(
        `/namespaces/${Cypress.env('NAMESPACE_NAME')}`,
      ),
      disableClear: true,
    });
  });

  it('Inspect reduced permissions view', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Deployments')
      .should('be.visible');

    cy.getLeftNav()
      .contains('Back To Cluster Details')
      .click();

    cy.getLeftNav()
      .contains('Configuration')
      .should('not.exist');
  });

  it('Cleanup', () => {
    cy.loginAndSelectCluster({ disableClear: true });

    // delete binding
    cy.getLeftNav()
      .contains('Cluster Role Bindings')
      .click();

    cy.deleteFromGenericList('Cluster Role Binding', CRB_NAME);

    // delete role
    cy.getLeftNav()
      .contains('Cluster Roles')
      .click();

    cy.deleteFromGenericList('Cluster Role', CR_NAME);

    // remove cluster
    cy.changeCluster('all-clusters');

    cy.deleteFromGenericList('Cluster', SA_NAME, true, false, false, false);

    cy.contains(/No clusters found/).should('exist');
  });
});
