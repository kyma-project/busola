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

    cy.contains('Create Cluster Role').type(CR_NAME);

    cy.get('[ariaLabel="ClusterRole name"]:visible').type(CR_NAME);

    // api groups
    chooseComboboxOption(
      '[placeholder^="Start typing to select API"]:visible',
      '(core)',
    );

    chooseComboboxOption(
      '[placeholder^="Start typing to select API"]:visible',
      'apps',
    );

    cy.get('[ariaLabel="roles.buttons.load"]:visible', { log: false }).click();

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

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Create Service Account', () => {
    cy.goToNamespaceDetails();

    cy.navigateTo('Configuration', 'Service Accounts');

    cy.contains('Create Service Account').click();

    cy.get('[ariaLabel="ServiceAccount name"]:visible').type(SA_NAME);

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Create a ClusterRoleBinding for SA and CR', () => {
    cy.navigateTo('Back To Cluster Details', 'Cluster Role Bindings');

    cy.contains('Create Cluster Role Binding').click();

    // subject type - select it first so the list starts loading
    cy.get('[role=dialog]')
      .contains('User')
      .click();

    cy.get('[role=list]')
      .contains('ServiceAccount')
      .click();

    // name
    cy.get('[ariaLabel="ClusterRoleBinding name"]:visible').type(CRB_NAME);

    // role
    cy.get(
      '[placeholder="Start typing to select ClusterRole from the list"]:visible',
    ).type(CR_NAME);
    cy.contains(new RegExp(CR_NAME)).click();

    // service account namespace
    chooseComboboxOption(
      '[placeholder="Select Namespace"]:visible',
      Cypress.env('NAMESPACE_NAME'),
    );

    // service account name
    chooseComboboxOption('[placeholder="Select name"]:visible', SA_NAME);

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Download kubeconfig for Service Account', () => {
    cy.getLeftNav()
      .contains('Namespaces', { includeShadowDom: true })
      .click();

    cy.goToNamespaceDetails();

    cy.getLeftNav()
      .contains('Service Accounts', { includeShadowDom: true })
      .click();

    cy.contains(SA_NAME).click();

    cy.contains('Generate TokenRequest').click();

    cy.contains('Download Kubeconfig').click();

    cy.contains('Close').click();

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
      .contains('Workloads', { includeShadowDom: true })
      .click();

    cy.getLeftNav()
      .contains('Deployments', { includeShadowDom: true })
      .should('be.visible');

    cy.getLeftNav()
      .contains('Back To Cluster Details', { includeShadowDom: true })
      .click();

    cy.getLeftNav()
      .contains('Configuration', { includeShadowDom: true })
      .should('not.exist');
  });

  it('Cleanup', () => {
    cy.loginAndSelectCluster({ disableClear: true });

    // delete binding
    cy.getLeftNav()
      .contains('Cluster Role Bindings', { includeShadowDom: true })
      .click();

    cy.deleteFromGenericList(CRB_NAME);

    // delete role
    cy.getLeftNav()
      .contains('Cluster Roles', { includeShadowDom: true })
      .click();

    cy.deleteFromGenericList(CR_NAME);

    // remove cluster
    cy.changeCluster('all-clusters');

    cy.deleteFromGenericList(SA_NAME, true, false, false);

    cy.contains(/No clusters found/).should('exist');
  });
});
