/// <reference types="cypress" />
import 'cypress-file-upload';

function mockShowKymaVersionEnabled() {
  const requestData = {
    method: 'GET',
    url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
  };
  const configmapMock = {
    data: {
      config: JSON.stringify({
        config: {
          features: {
            SHOW_KYMA_VERSION: { isEnabled: true },
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

function fromClusterOverview() {
  cy.loginAndSelectCluster();
  cy.getLeftNav()
    .contains('Cluster Overview')
    .click();
}

context('Kyma Version', () => {
  it('Disabled by default', () => {
    fromClusterOverview();

    cy.getIframeBody()
      .contains('Kyma Version')
      .should('not.exist');
  });

  it('Enabled by configmap', () => {
    mockShowKymaVersionEnabled();
    fromClusterOverview();

    cy.getIframeBody()
      .contains('Kyma Version')
      .should('exist')
      .parent()
      .contains('Unknown')
      .should('not.exist');
  });

  it('Fails gracefully', () => {
    mockShowKymaVersionEnabled();
    mockKymaSystemForbidden();
    fromClusterOverview();

    cy.getIframeBody()
      .contains('Kyma Version')
      .should('exist')
      .parent()
      .contains('Unknown')
      .should('exist');
  });
});
