Cypress.Commands.add('openCreate', () => {
  cy.contains('ui5-button', 'Create').click();
});

Cypress.Commands.add('createResource', () => {
  cy.get('.create-form')
    .contains('ui5-button', 'Create')
    .should('be.visible')
    .click();
});
