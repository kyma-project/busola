/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { loadKubeconfig } from '../support/loadKubeconfigFile';

const kubeconfigIdAddress = `${config.clusterAddress}/kubeconfig`;

context('Login - kubeconfigID', () => {
  it('Uses custom kubeconfig URL', () => {
    cy.wrap(loadKubeconfig()).then(kubeconfig => {
      const customKubeconfigUrl = 'http://example.com/kubeconfig';
      cy.intercept(
        {
          method: 'GET',
          url: '/assets/config/config.json*',
        },
        JSON.stringify({
          config: {
            features: {
              KUBECONFIG_ID: {
                config: {
                  kubeconfigUrl: customKubeconfigUrl,
                },
              },
            },
          },
        }),
      );
      cy.intercept(
        {
          method: 'GET',
          url: `${customKubeconfigUrl}/*`,
        },
        kubeconfig,
      );
      cy.visit(`${config.clusterAddress}/clusters?kubeconfigID=tests`);
      cy.url().should('match', /namespaces$/);
    });
  });

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
});
