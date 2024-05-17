Cypress.Commands.add('openCreate', () => {
  cy.contains('ui5-button', 'Create').click();
});

Cypress.Commands.add('saveChanges', (action = 'Create') => {
  const isCreate = action === 'Create';
  cy.get(isCreate ? '.create-form' : '.edit-form')
    .contains('ui5-button:visible', isCreate ? 'Create' : 'Save')
    .click();
});

Cypress.Commands.add('checkUnsavedDialog', () => {
  cy.getLeftNav()
    .contains('Events')
    .click();

  cy.get('ui5-dialog[header-text="Discard Changes"]').should('be.visible');

  cy.get('ui5-dialog[header-text="Discard Changes"]')
    .find('ui5-button')
    .contains('Cancel')
    .click();
});
