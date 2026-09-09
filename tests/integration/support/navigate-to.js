Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  // Alias the query before clicking. UI5 side-navigation re-renders
  // asynchronously (React), so a direct `.should('be.visible').click()` can
  // hit an element that detaches between the actionability check and the click
  // ("element detached from the DOM"). Accessing an alias re-runs the query,
  // so Cypress clicks a fresh, attached node instead of a stale reference.
  cy.wait(1500)
    .getLeftNav()
    .get(`ui5-side-navigation-item[text="${leftNav}"]`)
    .should('be.visible')
    .as('leftNavItem');
  cy.get('@leftNavItem').click();

  if (resource) {
    cy.getLeftNav()
      .get(`ui5-side-navigation-sub-item[text="${resource}"]`)
      .should('be.visible')
      .as('leftNavSubItem');
    cy.get('@leftNavSubItem').click();
  }
  cy.wait(1500);
});
