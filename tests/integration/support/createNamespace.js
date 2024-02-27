Cypress.Commands.add('createNamespace', namespaceName => {
  cy.log('Create a Namespace');

  cy.getLeftNav()
    .contains('Namespaces')
    .click();

  cy.contains('ui5-button', 'Create').click();

  cy.contains('Simple').click();

  cy.get('ui5-dialog')
    .find('[aria-label="Namespace name"]:visible')
    .find('input')
    .type(namespaceName, { force: true })
    .click();

  cy.get('ui5-dialog')
    .contains('ui5-button', 'Create')
    .should('be.visible')
    .click();
});
