export function chooseComboboxOption(selector, optionText, force = false) {
  const combobox = () => cy.get(`ui5-combobox${selector}`);

  // wait for options to exist before typing; early typing filters an empty list and
  // UI5 won't re-run the filter once options arrive, so the item would never show
  combobox().find('ui5-cb-item').should('have.length.greaterThan', 0);

  combobox()
    .find('input')
    .should('not.be.disabled')
    .filterWithNoValue()
    .click()
    .type(optionText);

  cy.get('ui5-cb-item:visible').contains(optionText).click({ force: force });

  return cy.end();
}

export function useCategory(category) {
  before(() => {
    cy.getLeftNav().contains(category).click();
  });

  after(() => {
    cy.getLeftNav().contains(category).click();
  });
}

export const grantClipboardPermissions = () => {
  cy.wrap(
    Cypress.automation('remote:debugger:protocol', {
      command: 'Browser.grantPermissions',
      params: {
        permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
        origin: window.location.origin,
      },
    }),
  );
};
