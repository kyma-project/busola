import { load } from 'js-yaml';

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

Cypress.Commands.add('mockExtensions', extensionsPaths => {
  const requestData = {
    method: 'GET',
    url:
      '/backend/api/v1/configmaps?labelSelector=busola.io/extension=resource',
  };

  let extensions = [];
  extensionsPaths.forEach(element => {
    cy.fixture(element).then(fileContent => {
      const extensionConfig = load(fileContent);
      extensions = [...extensions, extensionConfig];
      cy.intercept(requestData, JSON.stringify({ items: extensions }));
    });
  });
});
