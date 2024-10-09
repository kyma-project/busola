/// <reference types="cypress" />
import 'cypress-file-upload';

function mockKymaSystemForbidden() {
  const requestData = {
    method: 'GET',
    url: '/backend/api/v1/namespaces/kyma-system',
  };
  cy.intercept(requestData, { statusCode: 403 });
}

context('Test Kyma version', () => {
  Cypress.skipAfterFail();

  it('No Kyma Version when feature is disabled', () => {
    cy.setBusolaFeature('SHOW_KYMA_VERSION', false);
    cy.loginAndSelectCluster();

    cy.contains('Kubernetes:').should('exist');

    cy.contains('Kyma:').should('not.exist');
  });

  it('Enabled by ConfigMap', () => {
    cy.setBusolaFeature('SHOW_KYMA_VERSION', true);

    cy.loginAndSelectCluster();

    cy.contains('Kyma:').should('exist');
  });

  it('Fails gracefully', () => {
    cy.setBusolaFeature('SHOW_KYMA_VERSION', true);
    mockKymaSystemForbidden();

    cy.loginAndSelectCluster();

    cy.contains('Kubernetes:').should('exist');

    cy.contains('Kyma:').should('not.exist');
  });
});
