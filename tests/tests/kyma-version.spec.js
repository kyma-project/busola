/// <reference types="cypress" />
import 'cypress-file-upload';

function mockShowKymaVersion(enabled) {
  const requestData = {
    method: 'GET',
    url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
  };
  const configmapMock = {
    data: {
      config: JSON.stringify({
        config: {
          features: {
            SHOW_KYMA_VERSION: { isEnabled: enabled },
          },
        },
      }),
    },
  };
  cy.intercept(requestData, configmapMock);
}

function mockKymaSystemForbidden() {
  const requestData = {
    method: 'GET',
    url: '/backend/api/v1/namespaces/kyma-system',
  };
  cy.intercept(requestData, { statusCode: 403 });
}

context('Kyma Version', () => {
  it('No Kyma Version when feature is disabled', () => {
    mockShowKymaVersion(false);
    cy.loginAndSelectCluster();

    cy.getIframeBody()
      .contains('Kyma:')
      .should('not.exist');
  });

  it('Enabled by configmap', () => {
    mockShowKymaVersion(true);
    cy.loginAndSelectCluster();

    cy.getIframeBody()
      .contains('Kyma:')
      .should('exist')
      .parent()
      .contains('Unknown')
      .should('not.exist');
  });

  it('Fails gracefully', () => {
    mockShowKymaVersion(true);
    mockKymaSystemForbidden();
    cy.loginAndSelectCluster();

    cy.getIframeBody()
      .contains('Kyma: Unknown')
      .should('exist');
  });
});
