Cypress.Commands.add(
  'setBusolaFeature',
  (featureName, isEnabled, properties = {}) => {
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
              [featureName]: { isEnabled, ...properties },
            },
          },
        }),
      },
    };

    cy.intercept(requestData, configMock);
  },
);

Cypress.Commands.add(
  'mockConfigMap',
  ({ namespace = 'kube-public', label, data }) => {
    const requestData = {
      method: 'GET',
      url: `/backend/api/v1/configmaps?labelSelector=${label}`,
    };

    const configMock = {
      items: [
        {
          data: {
            data,
          },
        },
      ],
    };

    cy.intercept(requestData, configMock);
  },
);
