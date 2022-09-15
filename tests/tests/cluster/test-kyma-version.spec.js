/// <reference types="cypress" />
import 'cypress-file-upload';
import { mockBusolaConfig } from '../../support/helpers';

function mockKymaSystemForbidden() {
  const requestData = {
    method: 'GET',
    url: '/backend/api/v1/namespaces/kyma-system',
  };
  cy.intercept(requestData, { statusCode: 403 });
}

context('Test Kyma version', () => {
  Cypress.skipAfterFail();
  const getConfig = enabled => ({
    config: {
      features: {
        SHOW_KYMA_VERSION: { isEnabled: enabled },
      },
    },
  });

  it('No Kyma Version when feature is disabled', () => {
    mockBusolaConfig(getConfig(false));
    cy.loginAndSelectCluster();

    cy.getIframeBody()
      .contains('Kubernetes:')
      .should('exist');

    cy.getIframeBody()
      .contains('Kyma:')
      .should('not.exist');
  });

  it('Enabled by ConfigMap', () => {
    mockBusolaConfig(getConfig(true));

    cy.loginAndSelectCluster();

    cy.getIframeBody()
      .contains('Kyma:')
      .should('exist');
  });

  it('Fails gracefully', () => {
    mockBusolaConfig(getConfig(true));
    mockKymaSystemForbidden();
    cy.loginAndSelectCluster();

    cy.getIframeBody()
      .contains('Kubernetes:')
      .should('exist');

    cy.getIframeBody()
      .contains('Kyma:')
      .should('not.exist');
  });
});
