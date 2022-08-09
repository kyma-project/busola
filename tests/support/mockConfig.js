const requestData = {
  method: 'GET',
  url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
};

Cypress.Commands.add('setBusolaFeature', (featureName, isEnabled) => {
  cy.log(`Set Busola feature: ${featureName} -> ${isEnabled}`);

  const configMock = {
    data: {
      config: JSON.stringify({
        config: {
          features: {
            [featureName]: isEnabled,
          },
        },
      }),
    },
  };

  cy.intercept(requestData, configMock);
});
