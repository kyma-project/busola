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
      VISUAL_RESOURCES: { isEnabled: false },
      HIDDEN_NAMESPACES: {
        isEnabled: false,
      },
    });
    cy.loginAndSelectCluster();
  });

  it('Disable features visible by default', () => {
    // visual resources
    cy.navigateTo('Configuration', 'Cluster Role Bindings');

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .type('cronjob-controller');

    cy.get('ui5-li-suggestion-item:visible')
      .contains('cronjob-controller')
      .click();

    cy.contains('cronjob-controller (SA)') // link wrapper
      .contains('cronjob-controller') // link itself
      .click();

    cy.contains('disabled').should('exist');

    cy.contains('Resource Graph').should('not.exist');
  });
});
