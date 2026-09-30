Cypress.Commands.add(
  'inspectTab',
  { prevSubject: ['optional', 'element'] },
  (subject, tabName) => {
    // the strip item, not the inner text span `.contains` would drill into
    const tab = () =>
      (subject
        ? cy.wrap(subject).find('ui5-tabcontainer')
        : cy.get('ui5-tabcontainer')
      )
        .find('[role="tablist"]')
        .find('[role="tab"]')
        .filter((_, el) => el.textContent.includes(tabName))
        .first();

    tab().should('be.visible');
    tab().click();
    tab().should('have.attr', 'aria-selected', 'true');
  },
);
