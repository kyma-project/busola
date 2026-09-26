Cypress.Commands.add('inspectList', (resourceName, hiddenButtons = false) => {
  cy.closeMidColumn(false, hiddenButtons);

  cy.getStartColumn()
    .find('ui5-input[id^=search-]')
    .find('input')
    .should('be.visible')
    .should('not.be.disabled');

  cy.typeInSearch(`${resourceName}{enter}`);

  cy.contains('ui5-text', resourceName).should('be.visible');
});
