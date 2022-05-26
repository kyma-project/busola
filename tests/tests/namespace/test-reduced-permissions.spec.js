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
    cy.getLeftNav()
      .contains('Configuration')
      .click();
    cy.getLeftNav()
      .contains('Cluster Roles')
      .click();

    cy.getIframeBody()
      .contains('Create Cluster Role')
      .type(CR_NAME);

    cy.getIframeBody()
      .find('[ariaLabel="Role name"]:visible')
      .type(CR_NAME);

    // api groups
    chooseComboboxOption(
      '[placeholder^="Start typing to select API"]:visible',
      '(core)',
    );

    chooseComboboxOption(
      '[placeholder^="Start typing to select API"]:visible',
      'apps',
    );

    cy.getIframeBody()
      .find('[ariaLabel="Load"]:visible', { log: false })
      .click();

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

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Create Service Account', () => {
    cy.goToNamespaceDetails();

    cy.navigateTo('Configuration', 'Service Accounts');

    cy.getIframeBody()
      .contains('Create Service Account')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Service Account name"]:visible')
      .type(SA_NAME);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Create a ClusterRoleBinding for SA and CR', () => {
    cy.getLeftNav()
      .contains('Back to Cluster Details')
      .click();

    cy.navigateTo('Configuration', 'Cluster Role Bindings');

    cy.getIframeBody()
      .contains('Create Cluster Role Binding')
      .click();

    // subject type - select it first so the list starts loading
    cy.getIframeBody()
      .contains('User')
      .click();
    cy.getIframeBody()
      .contains('ServiceAccount')
      .click();

    // name
    cy.getIframeBody()
      .find('[ariaLabel="Cluster Role Binding name"]:visible')
      .type(CRB_NAME);

    // role
    cy.getIframeBody()
      .find(
        '[placeholder="Start typing to select Role Binding from the list"]:visible',
      )
      .type(CR_NAME);
    cy.getIframeBody()
      .contains(new RegExp(CR_NAME))
      .click();

    // service account namespace
    chooseComboboxOption(
      '[placeholder="Select Namespace"]:visible',
      Cypress.env('NAMESPACE_NAME'),
    );

    // service account name
    chooseComboboxOption('[placeholder="Select name"]:visible', SA_NAME);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Download kubeconfig for Service Account', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();
    cy.goToNamespaceDetails();

    cy.navigateTo('Configuration', 'Service Accounts');

    cy.getIframeBody()
      .contains(SA_NAME)
      .click();

    cy.getIframeBody()
      .find('[aria-label="Download Kubeconfig"]')
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
        `/namespaces/${Cypress.env('NAMESPACE_NAME')}/details`,
      ),
    });
  });

  it('Inspect reduced permissions view', () => {
    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody().contains('Are you sure you want to');

    cy.getIframeBody()
      .wait(1000)
      .find('[data-testid="delete-confirmation"]')
      .click();

    cy.contains('Close').click();

    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Deployments')
      .should('be.visible');

    cy.getLeftNav()
      .contains('Back to Cluster Details')
      .click();

    cy.getLeftNav()
      .contains('Configuration')
      .should('not.exist');
  });

  it('Cleanup', () => {
    cy.get('[data-testid="app-switcher"]').click();

    // 2 results: "Clusters Overview" node and original cluster, take second
    cy.get('#appSwitcherPopover:visible')
      .find('li')
      .eq(1)
      .find('[role="button"]')
      .click();

    // wait until original cluster loads
    cy.getLeftNav()
      .contains('Configuration')
      .should('exist');

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
    cy.get('[data-testid="app-switcher"]').click();
    cy.contains('Clusters Overview').click();

    cy.deleteFromGenericList(SA_NAME, true, false);

    cy.getIframeBody()
      .contains(/No clusters found/)
      .should('exist');
  });
});
