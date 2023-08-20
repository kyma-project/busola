Cypress.Commands.add('createNamespace', namespaceName => {
  cy.log('Create a Namespace');

  cy.getLeftNav()
    .contains('Namespaces', { includeShadowDom: true })
    .click();

  cy.contains('ui5-button', 'Create Namespace').click();

  cy.get('input[ariaLabel="Namespace name"]:visible').type(namespaceName);

  cy.get('ui5-button.fd-dialog__decisive-button')
    .contains('Create')
    .should('be.visible')
    .click();
});
