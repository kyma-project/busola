/// <reference types="cypress" />
import 'cypress-file-upload';
import { mockBusolaConfig } from '../../support/helpers';

function mockShootCMForbidden() {
  const requestData = {
    method: 'GET',
    url: 'backend/api/v1/namespaces/kube-system/configmaps/shoot-info',
  };
  cy.intercept(requestData, { statusCode: 403 });
}

context('Test Gardener provider', () => {
  Cypress.skipAfterFail();
  const getConfig = enabled => ({
    config: {
      features: {
        SHOW_GARDENER_METADATA: { isEnabled: enabled },
      },
    },
  });

  it('No Gardener Provider when feature is disabled', () => {
    mockBusolaConfig(getConfig(false));
    cy.loginAndSelectCluster();

    cy.getIframeBody()
      .contains('Provider')
      .should('not.exist');
  });

  it('Enabled by ConfigMap', () => {
    mockBusolaConfig(getConfig(true));

    cy.loginAndSelectCluster();

    cy.getIframeBody()
      .contains('Provider')
      .should('exist');
  });

  it('Fails gracefully', () => {
    mockBusolaConfig(getConfig(true));
    mockShootCMForbidden();
    cy.loginAndSelectCluster();

    cy.getIframeBody()
      .contains('Provider:')
      .should('not.exist');
  });
});
