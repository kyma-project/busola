/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { loadKubeconfig } from '../support/loadKubeconfigFile';

const kubeconfigIdAddress =
  'https://kyma-env-broker.cp.dev.kyma.cloud.sap/kubeconfig';

context('Login - kubeconfigID', () => {
  it('Adds cluster by kubeconfigID', () => {
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

  it('Authenticated but not authorized', () => {
    const requestData = {
      method: 'POST',
      url: '/backend/apis/authorization.k8s.io/v1/selfsubjectrulesreviews',
    };
    cy.intercept(requestData, {
      status: {
        resourceRules: [],
      },
    });

    cy.wrap(loadKubeconfig()).then(kubeconfig => {
      cy.intercept(
        {
          method: 'GET',
          url: `${kubeconfigIdAddress}/*`,
        },
        kubeconfig,
      );
      cy.visit(`${config.clusterAddress}/clusters?kubeconfigID=tests`);
      cy.getIframeBody()
        .contains(/It looks like you have no role assigned./)
        .should('be.visible');
    });
  });
});
