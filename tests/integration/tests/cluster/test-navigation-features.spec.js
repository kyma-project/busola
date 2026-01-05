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
      HIDDEN_NAMESPACES: {
        isEnabled: false,
      },
    });
    cy.loginAndSelectCluster();
  });

  it('Disable features visible by default', () => {
    // visual resources
    cy.navigateTo('Configuration', 'Cluster Role Bindings');

    cy.wait(500).typeInSearch('cronjob-controller');

    cy.get('ui5-suggestion-item:visible')
      .contains('li', /cronjob-controller/)
      .click();

    cy.wait(1000);

    cy.contains('ui5-text', 'system:controller:cronjob-controller').click();

    cy.getMidColumn()
      .contains('ui5-panel', 'Subjects')
      .contains('ui5-link', 'cronjob-controller')
      .click();

    cy.contains('Disabled').should('exist');
  });
});
