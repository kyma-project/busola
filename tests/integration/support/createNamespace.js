Cypress.Commands.add('createNamespace', namespaceName => {
  cy.log('Create a Namespace');

  cy.getLeftNav()
    .contains('Namespaces')
    .click();

  cy.contains('ui5-button', 'Create Namespace').click();

  cy.get('input[ariaLabel="Namespace name"]:visible')
    .click()
    .type(namespaceName);

  cy.get('ui5-dialog')
    .contains('ui5-button', 'Create')
    .should('be.visible')
    .click();
});
