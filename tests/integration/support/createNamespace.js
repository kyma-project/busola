Cypress.Commands.add('createNamespace', namespaceName => {
  cy.log('Create a Namespace');

  cy.getLeftNav()
    .contains('Namespaces', { includeShadowDom: true })
    .click();

  cy.contains('ui5-button', 'Create Namespace').click();

  cy.get('input[arialabel="Namespace name"]:visible').type(namespaceName);

  cy.get('ui5-button.ui5-bar-content')
    .contains('Create')
    .should('be.visible')
    .click();
});
