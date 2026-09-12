Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  const categorySelector = `ui5-side-navigation-item[text="${leftNav}"]`;

  if (!resource) {
    // click starts the route change; wait for it to commit so a following typeInSearch
    // doesn't race the list mounting
    cy.getLeftNav().get(categorySelector).should('be.visible').click();
    cy.getLeftNav().get(categorySelector).should('have.prop', 'selected', true);
    return;
  }

  const subItemSelector = `ui5-side-navigation-sub-item[text="${resource}"]`;

  // skip the category click when sub-items are already visible — clicking an already-expanded
  // category drops its key from expandedCategories, which re-renders the sidebar and re-templates
  // slotted sub-items, moving the target node mid-click so it lands on the wrong neighbour
  cy.getLeftNav().then(($nav) => {
    if ($nav.find(`${subItemSelector}:visible`).length === 0) {
      cy.getLeftNav().get(categorySelector).should('be.visible').click();
    }
  });

  cy.getLeftNav().get(subItemSelector).should('be.visible').click();

  // selected flips only once the route commits, so this stops a following openCreate
  // from grabbing the previous view's Create button
  cy.getLeftNav().get(subItemSelector).should('have.prop', 'selected', true);
});
