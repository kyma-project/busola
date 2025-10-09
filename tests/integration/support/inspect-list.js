Cypress.Commands.add('inspectList', (resourceName, hiddenButtons = false) => {
  cy.closeMidColumn(false, hiddenButtons);

  cy.typeInSearch(`${resourceName}{enter}`);

  cy.contains('ui5-text', resourceName).should('be.visible');
});
