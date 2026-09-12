export function chooseComboboxOption(selector, optionText, force = false) {
  const combobox = () => cy.get(`ui5-combobox${selector}`);

  // the field enables before its options are ready — the API-group list, for one, comes from async
  // cluster discovery. Typing before they load filters an empty list, and UI5 won't re-run the filter
  // once the options arrive, so the item would never show. The options sit in the DOM as (hidden)
  // items as soon as they load, so wait for them to exist before typing instead of guessing with a sleep.
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
