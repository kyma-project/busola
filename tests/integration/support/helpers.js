export function chooseComboboxOption(selector, optionText, force = false) {
  // the combobox stays disabled until options load; typing early makes UI5 throw on a half-built item
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
