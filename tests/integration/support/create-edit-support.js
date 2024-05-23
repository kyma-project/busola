Cypress.Commands.add('openCreate', () => {
  cy.contains('ui5-button', 'Create').click();
});

Cypress.Commands.add('saveChanges', (action = 'Create') => {
  const isCreate = action === 'Create';
  cy.get(isCreate ? '.create-form' : '.edit-form')
    .contains('ui5-button:visible', isCreate ? 'Create' : 'Save')
    .click();
});
