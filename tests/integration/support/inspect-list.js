Cypress.Commands.add('inspectList', (resource, resourceName) => {
  const resourceUrl = resource.replace(/\s/g, '').toLowerCase();

  cy.get('ui5-breadcrumbs')
    .find(`ui5-link[href*=${resourceUrl}]`, {
      includeShadowDom: true,
    })
    .should('contain.text', resource)
    .find(`a[href*=${resourceUrl}]`, {
      includeShadowDom: true,
    })
    .should('be.visible')
    .click({ force: true });

  cy.get('[role="search"] [aria-label="open-search"]').type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
