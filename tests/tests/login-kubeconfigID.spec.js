/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { loadKubeconfig } from '../support/loadKubeconfigFile';

context('Login - kubeconfigID', () => {
  it('Adds cluster by kubeconfigID', () => {
    const kubeconfigIdAddress =
      'https://kyma-env-broker.cp.dev.kyma.cloud.sap/kubeconfig';
    cy.wrap(loadKubeconfig()).then(kubeconfig => {
      cy.intercept(
        {
          method: 'GET',
          url: `${kubeconfigIdAddress}/*`,
        },
        kubeconfig,
      );
      cy.visit(`${config.clusterAddress}/clusters?kubeconfigID=tests`);
      cy.url().should('match', /namespaces$/);
    });
  });

  it('Gracefully fails on invalid input', () => {
    const kubeconfigIdAddress =
      'https://kyma-env-broker.cp.dev.kyma.cloud.sap/kubeconfig';
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
});
