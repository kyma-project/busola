Cypress.Commands.add('navigateBackTo', (resourceUrl, resourceName) => {
  cy.get('ui5-breadcrumbs')
    .find(`ui5-link[href*=${resourceUrl}]`, {
      includeShadowDom: true,
    })
    .should('contain.text', resourceName)
    .find(`a[href*=${resourceUrl}]`, {
      includeShadowDom: true,
    })
    .should('be.visible')
    .click({ force: true });
});
