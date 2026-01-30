Cypress.Commands.add('openCreate', () => {
  cy.get('ui5-panel').contains('ui5-button', 'Create').click();
  cy.wait(500);
});

Cypress.Commands.add('saveChanges', (action = 'Create') => {
  const isCreate = action === 'Create';
  cy.get(isCreate ? '[data-testid="create-form-footer-bar"]' : '.edit-form')
    .contains('ui5-button:visible', isCreate ? 'Create' : 'Save')
    .click();

  cy.wait(2000);
});

Cypress.Commands.add('checkUnsavedDialog', () => {
  cy.wait(500);
  cy.getLeftNav().contains('Events').click();

  cy.get('ui5-dialog[header-text="Discard Changes"]').should('be.visible');

  cy.get('ui5-dialog[header-text="Discard Changes"]:visible')
    .find('ui5-button')
    .contains('Cancel')
    .click();

  cy.go('back');

  cy.get('ui5-dialog[header-text="Discard Changes"]:visible')
    .find('ui5-button')
    .contains('Cancel')
    .click();
});
