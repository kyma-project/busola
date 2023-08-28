Cypress.Commands.add('inspectList', (resource, resourceName) => {
  const resourceUrl = resource.replace(/\s/g, '').toLowerCase();
  cy.navigateBackTo(resourceUrl, resource);

  cy.get('ui5-button[aria-label="open-search"]')
    .click()
    .get('input[aria-label="search-input"]')
    .type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
