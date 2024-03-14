Cypress.Commands.add('openCreate', () => {
  cy.contains('ui5-button', 'Create').click();
});

Cypress.Commands.add('createResource', () => {
  cy.get('ui5-dialog')
    .contains('ui5-button', 'Create')
    .should('be.visible')
    .click();
});
