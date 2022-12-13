Cypress.Commands.add('createNamespace', namespaceName => {
  cy.log('Create a Namespace');

  cy.getLeftNav()
    .contains('Namespaces')
    .click();

  cy.contains('button', 'Create Namespace').click();

  cy.get('input[ariaLabel="Namespace name"]:visible').type(namespaceName);

  cy.contains('[role=dialog] button', 'Create').click();
});
