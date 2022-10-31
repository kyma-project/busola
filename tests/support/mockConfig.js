import { load } from 'js-yaml';
import { loadFile } from '../support/loadFile';

Cypress.Commands.add('setBusolaFeature', (featureName, isEnabled) => {
  cy.log(`Set Busola feature: ${featureName} -> ${isEnabled}`);

  const requestData = {
    method: 'GET',
    url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
  };

  const configMock = {
    data: {
      config: JSON.stringify({
        config: {
          features: {
            [featureName]: { isEnabled },
          },
        },
      }),
    },
  };

  cy.intercept(requestData, configMock);
});

Cypress.Commands.add('mockExtension', (featureName, extensionPath) => {
  cy.log(`Set Busola feature: ${featureName}`);

  const requestData = {
    method: 'GET',
    url:
      '/backend/api/v1/configmaps?labelSelector=busola.io/extension=resource',
  };

  cy.fixture(extensionPath).then(fileContent => {
    const extensionConfig = load(fileContent);
    cy.intercept(requestData, JSON.stringify({ items: [extensionConfig] }));
  });
});
