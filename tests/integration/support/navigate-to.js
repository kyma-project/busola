Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  // the nav streams its nodes in asynchronously, so clicking a category
  // before it has settled can race the expand toggle; let it settle first
  cy.wait(1500);
  cy.getLeftNav()
    .get(`ui5-side-navigation-item[text="${leftNav}"]`)
    .should('be.visible')
    .click();

  if (resource) {
    cy.getLeftNav()
      .get(`ui5-side-navigation-sub-item[text="${resource}"]`)
      .should('be.visible')
      .click();

    // clicking the sub-item only fires the route change, it does not wait for it.
    // without this gate navigateTo returns while the previous view (e.g. the
    // namespace overview) is still mounted, and a following openCreate then grabs
    // that page's Create button (the overview's Limit Ranges panel) instead of the
    // one we navigated to. the sub-item flips to selected once the router has
    // committed the destination route, so wait for that before handing back.
    cy.getLeftNav()
      .get(`ui5-side-navigation-sub-item[text="${resource}"]`)
      .should('have.prop', 'selected', true);
  }
});
