export function chooseComboboxOption(selector, optionText) {
  cy.getIframeBody()
    .find(selector)
    .filterWithNoValue()
    .type(optionText);
  cy.getIframeBody()
    .contains(optionText)
    .click();
}

export function mockBusolaConfig(config) {
  const requestData = {
    method: 'GET',
    url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
  };
  const configmapMock = {
    data: {
      config: JSON.stringify({
        ...config,
      }),
    },
  };
  cy.intercept(requestData, configmapMock);
}
