Cypress.Commands.add('inspectList', (resource, resourceName) => {
  cy.contains('[aria-label="breadcrumb-item"]', resource).click();

  cy.get('[role="search"] [aria-label="open-search"]').type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
