Cypress.Commands.add('inspectList', (resource, resourceName) => {
  cy.contains('[aria-label="breadcrumb-item"]', resource).click();

  cy.get('ui5-button[aria-label="open-search"]')
    .click()
    .get('input[aria-label="search-input"]')
    .type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
