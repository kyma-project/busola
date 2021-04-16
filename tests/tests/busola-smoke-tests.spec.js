/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  debugger
  return false
})

context('Busola Smoke Tests', () => {
  before(() => {
    cy.clearSessionStorage().clearLocalStorage();

    cy.visit(ADDRESS)
      .get("#file-input").attachFile("kubeconfig.yaml", { subjectType: 'drag-n-drop' })
  });



  it('Renders navigation nodes', () => {
    ['Namespaces', 'Administration', 'Diagnostics'].forEach(node => {
      cy.contains(node).should('exist');
    });
  });

  // beforeEach(() => {
  //   // return to main view
  //   cy.visit(ADDRESS + '/home/workspace');
  // });

  // it('Renders namespaces details', () => {
  //   cy.getIframeBody()
  //     .contains('.fd-link' ,config.DEFAULT_NAMESPACE_NAME)
  //     .click()
  //     .get('body')
  //     .contains('Back to Namespaces')
  //     .should('exist');
  // });

  // it('Renders deployments', () => {
  //   cy.getIframeBody()
  //     .contains(config.DEFAULT_NAMESPACE_NAME)
  //     .click()
  //     .get('body')
  //     .contains('Workloads')
  //     .click()
  //     .get('body')
  //     .contains('Deployments')
  //     .click()
  //     .getIframeBody()
  //     .contains('Deployments')
  //     .should('exist');
  // });

  /*
    investigate failing test
    either addons or cluster addons test fails regulary on minikube (but they pass on gke)
    a same situation was happening with Testcafe
  */
  // it('Renders cluster addons', () => {
  //   cy.contains('Integration')
  //     .click()
  //     .get('body')
  //     .contains('Cluster Addons')
  //     .click()
  //     .getIframeBody()
  //     .contains('Cluster Addons Configuration')
  //     .should('exist');
  // });

  /*
    This is (probably) caused by Angular. Disabled until we rewrite this component to React.
  */
  // if (!config.disableLegacyConnectivity || true) {
  //   it('Renders applications', () => {
  //     cy.contains('Integration')
  //       .click()
  //       .get('body')
  //       .contains('Applications/Systems')
  //       .click()
  //       .getIframeBody()
  //       .contains('Applications/Systems')
  //       .should('exist');
  //   });
  // }

  // if (config.serviceCatalogEnabled) {
  //   it('Renders service catalog', () => {
  //     cy.getIframeBody()
  //       .contains(config.DEFAULT_NAMESPACE_NAME)
  //       .click()
  //       .get('body')
  //       .contains('Service Management')
  //       .click()
  //       // catalog
  //       .get('body')
  //       .contains('Catalog')
  //       .click()
  //       .getIframeBody()
  //       .contains('Service Catalog')
  //       .should('exist')
  //       // instances
  //       .get('body')
  //       .contains('Instances')
  //       .click()
  //       .getIframeBody()
  //       .contains('Service Instances')
  //       // brokers
  //       .get('body')
  //       .contains('Brokers')
  //       .click()
  //       .getIframeBody()
  //       .contains('Service Brokers');
  //   });
  // }

  // if (config.functionsEnabled) {
  //   it('Renders functions', () => {
  //     cy.getIframeBody()
  //       .contains(config.DEFAULT_NAMESPACE_NAME)
  //       .click()
  //       .get('body')
  //       .contains('Workloads')
  //       .click()
  //       .get('body')
  //       .contains('Functions')
  //       .click()
  //       .getIframeBody()
  //       .contains('Functions')
  //       .should('exist');
  //   });
  // }
});
