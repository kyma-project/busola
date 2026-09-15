export function chooseComboboxOption(selector, optionText, force = false) {
  const combobox = () => cy.get(`ui5-combobox${selector}`);

  // wait for the specific option to be registered before typing
  combobox().find(`ui5-cb-item[text*="${optionText}"]`).should('exist');

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
