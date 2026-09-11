Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  const categorySelector = `ui5-side-navigation-item[text="${leftNav}"]`;
  cy.getLeftNav().get(categorySelector).should('be.visible').click();

  if (resource) {
    const subItemSelector = `ui5-side-navigation-sub-item[text="${resource}"]`;
    cy.getLeftNav().get(subItemSelector).should('be.visible').click();

    // clicking the sub-item only fires the route change, it does not wait for it.
    // without this gate navigateTo returns while the previous view (e.g. the namespace
    // overview) is still mounted, and a following openCreate then grabs that page's
    // Create button (the overview's Limit Ranges panel) instead of the one we navigated
    // to. the sub-item flips to selected once the router has committed the destination
    // route, so wait for that before handing back.
    cy.getLeftNav().get(subItemSelector).should('have.prop', 'selected', true);
  }
});
