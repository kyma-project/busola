const TEST_VALUE = 'Test Data for Monaco';

context('Test Custom Components', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY_CUSTOM_COMPONENTS', true);
    cy.loginAndSelectCluster();
  });

  // it('Upload custom components')

  // Custom component should be deployer earlier by kustomize, so we can check if it's rendered
  it('Check if custom component is rendering', () => {
    cy.navigateTo('Kyma', 'Busola Web Components example');

    cy.get('div[id="custom-html"]').should('be.visible');
    cy.get('div[id="extension-web-component"]').should('be.visible');
    cy.get('my-custom-page').should('be.visible');

    cy.pasteToMonaco(TEST_VALUE);
    cy.get('my-custom-page').contains(TEST_VALUE);
  });
});
