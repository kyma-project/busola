/// <reference types="cypress" />
import 'cypress-file-upload';
import jsyaml from 'js-yaml';
import config from '../../config';
import { loadFile } from '../../support/loadFile';

const kubeconfigIdAddress = `${config.clusterAddress}/kubeconfig`;

context('Test login - kubeconfigID', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
  });

  it('Adds cluster by kubeconfigID - no path, go to Cluster Overview', () => {
    cy.wrap(loadFile('kubeconfig.yaml')).then(kubeconfig => {
      cy.intercept(
        {
          method: 'GET',
          url: `${kubeconfigIdAddress}/*`,
        },
        kubeconfig,
      );
      cy.visit(`${config.clusterAddress}/?kubeconfigID=tests`);
      cy.url().should('match', /overview$/);

      cy.contains('Session Storage').should('be.visible');
    });
  });

  it('Adds cluster by kubeconfigID - saves path', () => {
    cy.wrap(loadFile('kubeconfig.yaml')).then(kubeconfig => {
      cy.intercept(
        {
          method: 'GET',
          url: `${kubeconfigIdAddress}/*`,
        },
        kubeconfig,
      );

      const clusterName = kubeconfig['current-context'];
      const path = `cluster/${clusterName}/namespaces/default/deployments`;

      cy.visit(`${config.clusterAddress}/${path}/?kubeconfigID=tests`);
      cy.url().should('match', /deployments\/$/);
    });
  });

  it('Does not change storage for already added cluster', () => {
    cy.loginAndSelectCluster({
      storage: 'Local storage',
    });

    cy.contains('Local Storage').should('be.visible');

    cy.wrap(loadFile('kubeconfig.yaml')).then(kubeconfig => {
      cy.intercept(
        {
          method: 'GET',
          url: `${kubeconfigIdAddress}/*`,
        },
        kubeconfig,
      );

      cy.visit(`${config.clusterAddress}/?kubeconfigID=tests`);
      cy.url().should('match', /overview$/);

      cy.contains('Session Storage').should('not.exist');

      cy.contains('Local Storage').should('be.visible');
    });
  });

  it('Gracefully fails on invalid input', () => {
    cy.intercept(
      {
        method: 'GET',
        url: `${kubeconfigIdAddress}/*`,
      },
      `a:
  c:d`,
    );
    cy.visit(`${config.clusterAddress}/clusters?kubeconfigID=tests`);
    Cypress.on('window:alert', alertContent =>
      expect(alertContent).to.include('Error loading kubeconfig ID'),
    );
  });

  // Uncomment after resolving https://github.com/kyma-project/busola/issues/2511
  // it('Handles default kubeconfig', () => {
  //   // mock defaultKubeconfig on
  //   cy.intercept(
  //     {
  //       method: 'GET',
  //       url: '/config/config.yaml*',
  //     },
  //     jsyaml.dump({
  //       config: {
  //         features: {
  //           KUBECONFIG_ID: {
  //             isEnabled: true,
  //             config: {
  //               kubeconfigUrl: '/kubeconfig',
  //               defaultKubeconfig: 'mock-kubeconfig.yaml',
  //             },
  //           },
  //         },
  //       },
  //     }),
  //   );

  //   cy.wrap(loadFile('kubeconfig.yaml')).then(kubeconfig => {
  //     cy.intercept(
  //       {
  //         method: 'GET',
  //         url: `${kubeconfigIdAddress}/*`,
  //       },
  //       kubeconfig,
  //     );
  //     cy.visit(`${config.clusterAddress}/clusters`);

  //     cy.contains('Load default cluster')
  //       .should('be.visible')
  //       .click();

  //     cy.url().should('match', /overview$/);

  //     cy.contains('Session Storage').should('be.visible');
  //   });
  // });
});
