/// <reference types="cypress" />

function mockFeatures(features) {
  const requestData = {
    method: 'GET',
    url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
  };
  const configmapMock = {
    data: {
      config: JSON.stringify({ config: { features } }),
    },
  };
  cy.intercept(requestData, configmapMock);
}

context('Test navigation features', () => {
  Cypress.skipAfterFail();

  before(() => {
    mockFeatures({
      APPLICATIONS: { isEnabled: false },
      ISTIO: { isEnabled: false },
      SERVERLESS: { isEnabled: false },
      API_GATEWAY: { isEnabled: false },
      PROMETHEUS: { isEnabled: false },
      VISUAL_RESOURCES: { isEnabled: false },
    });
    cy.loginAndSelectCluster();
  });

  it('Disable features visible by default', () => {
    // applications
    cy.getLeftNav()
      .contains('Integration')
      .click();

    cy.getLeftNav()
      .contains('Applications')
      .should('not.exist');

    // visual resources
    cy.navigateTo('Configuration', 'Cluster Role Bindings');

    cy.getIframeBody()
      .contains('cluster-admin')
      .click();

    // wait for view to stabilize
    cy.wait(5000);

    cy.getIframeBody()
      .contains('Resource Graph')
      .should('not.exist');
  });
});
