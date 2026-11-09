Cypress.Commands.add('checkExtension', (resource, create = true) => {
  cy.getLeftNav().contains(resource).should('be.visible');

  cy.getLeftNav().contains(resource).click();

  cy.contains('ui5-title', resource).should('be.visible');

  if (create) {
    cy.contains('ui5-button', 'Create').should('be.visible');
  }
});
