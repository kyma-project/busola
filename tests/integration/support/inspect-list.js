Cypress.Commands.add('inspectList', (resource, resourceName) => {
  const resourceUrl = resource.replace(/\s/g, '').toLowerCase();
  cy.navigateBackTo(resourceUrl, resource);

  cy.get('ui5-button[aria-label="open-search"]:visible').click();

  cy.get('[aria-label="search-input"]')
    .find('input')
    .type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
