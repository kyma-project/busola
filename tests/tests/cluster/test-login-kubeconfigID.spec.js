/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../../config';
import { loadFile } from '../../support/loadFile';

const kubeconfigIdAddress = `${config.clusterAddress}/kubeconfig`;

context('Test login - kubeconfigID', () => {
  Cypress.skipAfterFail();

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

      cy.getIframeBody()
        .contains('Session Storage')
        .should('be.visible');
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
    cy.loginAndSelectCluster({ storage: 'Local storage' });

    cy.getIframeBody()
      .contains('Local Storage')
      .should('be.visible');

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

      cy.getIframeBody()
        .contains('Session Storage')
        .should('not.exist');

      cy.getIframeBody()
        .contains('Local Storage')
        .should('be.visible');
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
