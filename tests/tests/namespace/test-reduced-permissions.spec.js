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

    cy.get('[ariaLabel="Load"]:visible', { log: false }).click();

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

    cy.wait(500); // TODO
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
      .contains('Namespaces')
      .click();

    cy.goToNamespaceDetails();

    cy.getLeftNav()
      .contains('Service Accounts')
      .click();

    cy.contains(SA_NAME).click();

    cy.get('[aria-label="Download Kubeconfig"]').click();

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
        `/namespaces/${Cypress.env('NAMESPACE_NAME')}/details`,
      ),
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
    cy.get('[aria-controls="fd-shellbar-product-popover"]').click();

    // 2 results: "Clusters Overview" node and original cluster, take second
    cy.get('[role=menuitem]:visible')
      .eq(1)
      .click();

    // wait until original cluster loads
    cy.getLeftNav()
      .contains('Configuration')
      .should('exist');

    cy.wait(5000);

    // delete binding
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Cluster Role Bindings')
      .click();

    cy.deleteFromGenericList(CRB_NAME);

    // delete role
    cy.getLeftNav()
      .contains('Cluster Roles')
      .click();

    cy.deleteFromGenericList(CR_NAME);

    // remove cluster
    cy.get('[aria-controls="fd-shellbar-product-popover"]').click();

    cy.contains('Clusters Overview').click();

    cy.deleteFromGenericList(SA_NAME, true, false);

    cy.contains(/No clusters found/).should('exist');
  });
});
