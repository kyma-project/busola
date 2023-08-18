Cypress.Commands.add('inspectList', (resource, resourceName) => {
  const resourceUrl = resource.replace(/\s/g, '').toLowerCase();
  cy.navigateBackTo(resourceUrl, resourceName);

  cy.get('[role="search"] [aria-label="open-search"]').type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
