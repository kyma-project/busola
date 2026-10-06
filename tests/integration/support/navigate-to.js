Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  const categorySelector = `ui5-side-navigation-item[text="${leftNav}"]`;

  if (!resource) {
    // clicking only starts the navigation; wait until it's done before returning
    cy.getLeftNav().get(categorySelector).should('be.visible').click();
    cy.getLeftNav().get(categorySelector).should('have.prop', 'selected', true);
    return;
  }

  const subItemSelector = `ui5-side-navigation-sub-item[text="${resource}"]`;

  cy.getLeftNav().then(($nav) => {
    if ($nav.find(`${subItemSelector}:visible`).length === 0) {
      cy.getLeftNav().get(categorySelector).should('be.visible').click();
    }
  });

  cy.getLeftNav().get(subItemSelector).should('be.visible').click();

  cy.getLeftNav().get(subItemSelector).should('have.prop', 'selected', true);
});
