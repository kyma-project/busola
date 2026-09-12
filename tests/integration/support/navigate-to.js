Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  const categorySelector = `ui5-side-navigation-item[text="${leftNav}"]`;

  if (!resource) {
    // a top-level item without sub-items (e.g. Namespaces) is itself the destination; the click
    // only starts the route change, so wait for it to commit before the caller touches the list.
    // Otherwise the list is still mounting and a following typeInSearch races its re-render.
    cy.getLeftNav().get(categorySelector).should('be.visible').click();
    cy.getLeftNav().get(categorySelector).should('have.prop', 'selected', true);
    return;
  }

  const subItemSelector = `ui5-side-navigation-sub-item[text="${resource}"]`;

  // Only click the category to open it when its sub-items aren't already showing. Clicking a
  // category that's already expanded still fires handleExpandedCategories (see CategoryItem): the
  // key is dropped from expandedCategories, and even though a selected child keeps it visually open,
  // the atom change re-renders the sidebar and UI5 re-templates the slotted sub-items. That moves
  // the node out from under the click below, so it lands on the neighbouring item and routes there.
  // Skipping the redundant click keeps the tree still, so the single sub-item click hits its target.
  cy.getLeftNav().then(($nav) => {
    if ($nav.find(`${subItemSelector}:visible`).length === 0) {
      cy.getLeftNav().get(categorySelector).should('be.visible').click();
    }
  });

  cy.getLeftNav().get(subItemSelector).should('be.visible').click();

  // selected is derived from the route (see NavItem/CategoryItem), so it only turns true once the
  // click actually navigated to the item we asked for. Waiting on it stops a following openCreate
  // from grabbing the previous view's Create button.
  cy.getLeftNav().get(subItemSelector).should('have.prop', 'selected', true);
});
