/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { loadKubeconfig } from '../support/loadKubeconfigFile';

export function mockAddClusterDisabled() {
  const requestData = {
    method: 'GET',
    url: '/assets/config/config.json*',
  };
  const configMock = JSON.stringify({
    config: {
      features: {
        ADD_CLUSTER_DISABLED: { isEnabled: true },
      },
    },
  });
  cy.intercept(requestData, configMock);
}

context('Add Cluster disabled', () => {
  beforeEach(mockAddClusterDisabled);

  it('Does not display "Add Cluster" on landing page', () => {
    cy.visit(config.clusterAddress);

    cy.getIframeBody()
      .contains(/To view your clusters, go to BTP Cockpit/)
      .should('be.visible');

    cy.get('button')
      .contains(/Add Cluster/)
      .should('not.exist');
  });

  it('User can add cluster via kubeconfig ID + does not display "Add cluster on overview', () => {
    const kubeconfigIdAddress = `${config.clusterAddress}/kubeconfig`;

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

      //does not display "Add cluster on overview
      cy.get('[data-testid=app-switcher]').click();
      cy.get('[data-testid=clusters-overview]').click();

      cy.get('button')
        .contains(/Add Cluster/)
        .should('not.exist');
    });
  });
});
