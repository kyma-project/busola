Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  const categorySelector = `ui5-side-navigation-item[text="${leftNav}"]`;
  cy.getLeftNav().get(categorySelector).should('be.visible').click();

  if (resource) {
    const subItemSelector = `ui5-side-navigation-sub-item[text="${resource}"]`;
    cy.getLeftNav().get(subItemSelector).should('be.visible').click();

    // the click only fires the route change; wait for selected so a following openCreate
    // doesn't grab the previous view's Create button
    cy.getLeftNav().get(subItemSelector).should('have.prop', 'selected', true);
  } else {
    // a top-level item without sub-items (e.g. Namespaces) is itself the destination; the click
    // only starts the route change, so wait for it to commit before the caller touches the list.
    // Otherwise the list is still mounting and a following typeInSearch races its re-render.
    cy.getLeftNav().get(categorySelector).should('have.prop', 'selected', true);
  }
});
