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
    cy.goToNamespaceDetails();
  });

  it('Disable features visible by default', () => {
    // no application mappings since APPLICATIONS is disabled
    cy.getIframeBody()
      .contains(/Application Mapping/)
      .should('not.exist');

    // no graphs since PROMETHEUS is disabled
    cy.getIframeBody()
      .contains('CPU')
      .should('not.exist');

    // istio
    cy.getLeftNav()
      .contains('Istio')
      .should('not.exist');

    // functions
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Functions')
      .should('not.exist');

    // api rules
    cy.getLeftNav()
      .contains('Discovery and Network')
      .click();

    cy.getLeftNav()
      .contains('API Rules')
      .should('not.exist');

    // make sure other nav nodes are still here
    cy.getLeftNav()
      .contains('Deployments')
      .should('exist');
    cy.getLeftNav()
      .contains('Ingresses')
      .should('exist');
  });
});
