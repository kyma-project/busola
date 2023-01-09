/// <reference types="cypress" />
import jsyaml from 'js-yaml';

function mockFeatures(features) {
  const requestData = {
    method: 'GET',
    url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
  };
  const configmapMock = {
    data: {
      config: jsyaml.dump({ config: { features } }),
    },
  };
  cy.intercept(requestData, configmapMock);
}

context('Test navigation features', () => {
  Cypress.skipAfterFail();

  before(() => {
    mockFeatures({
      PROMETHEUS: null,
      VISUAL_RESOURCES: { isEnabled: false },
    });
    cy.loginAndSelectCluster();
  });

  it('Disable features visible by default', () => {
    // visual resources
    cy.navigateTo('Configuration', 'Cluster Role Bindings');

    cy.get('[aria-label="open-search"]').click();

    cy.get('[aria-label="search-input"]').type('eventing-controller');

    cy.contains('eventing-controller (SA)') // link wrapper
      .contains('eventing-controller') // link itself
      .click();

    cy.contains('kubernetes.io/service-account-token').should('exist');

    cy.contains('Resource Graph').should('not.exist');
  });
});
