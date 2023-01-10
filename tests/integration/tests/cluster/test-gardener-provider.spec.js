/// <reference types="cypress" />
import 'cypress-file-upload';

function mockShootCMForbidden() {
  const requestData = {
    method: 'GET',
    url: 'backend/api/v1/namespaces/kube-system/configmaps/shoot-info',
  };
  cy.intercept(requestData, { statusCode: 403 });
}

context('Test Gardener provider', () => {
  Cypress.skipAfterFail();

  it('No Gardener Provider when feature is disabled', () => {
    cy.setBusolaFeature('SHOW_GARDENER_METADATA', false);

    cy.loginAndSelectCluster();

    cy.contains('Provider').should('not.exist');
  });

  it('Enabled by ConfigMap', () => {
    cy.setBusolaFeature('SHOW_GARDENER_METADATA', true);

    cy.loginAndSelectCluster();

    cy.contains('Provider').should('exist');
  });

  it('Fails gracefully', () => {
    cy.setBusolaFeature('SHOW_GARDENER_METADATA', true);
    mockShootCMForbidden();
    cy.loginAndSelectCluster();

    cy.contains('Provider:').should('not.exist');
  });
});
