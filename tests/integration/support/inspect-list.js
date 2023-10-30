Cypress.Commands.add('inspectList', (resource, resourceName) => {
  const resourceUrl = resource.replace(/\s/g, '').toLowerCase();
  cy.navigateBackTo(resourceUrl, resource);

  cy.get('ui5-button[aria-label="open-search"]:visible')
    .click()
    .get('ui5-combobox[placeholder="Search"]')
    .find('input')
    .click()
    .type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
