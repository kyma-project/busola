Cypress.Commands.add('inspectList', (resource, resourceName) => {
  cy.closeMidColumn();

  cy.get('ui5-combobox[placeholder="Search"]:visible')
    .find('input')
    .click()
    .type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
