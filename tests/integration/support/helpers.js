export function chooseComboboxOption(selector, optionText, force = false) {
  // the combobox stays disabled until its options finish loading, so wait for
  // that instead of a fixed delay. typing while the options are still coming in
  // makes UI5 filter over half-built items and throw on an undefined item text
  cy.get(`ui5-combobox${selector}`)
    .find('input')
    .should('not.be.disabled')
    .filterWithNoValue()
    .click()
    .type(optionText)
    .wait(500);

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
