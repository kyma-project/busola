Cypress.Commands.add(
  'inspectTab',
  { prevSubject: ['optional', 'element'] },
  (subject, tabName) => {
    return (subject
      ? cy.wrap(subject).find('ui5-tabcontainer')
      : cy.get('ui5-tabcontainer')
    )
      .find('[role="tablist"]')
      .find('[role="tab"]')
      .contains(tabName)
      .click();
  },
);
