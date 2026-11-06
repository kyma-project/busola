export function chooseComboboxOption(selector, optionText, force = false) {
  const combobox = () => cy.get(`ui5-combobox${selector}`);

  // wait for the specific option to be registered before typing
  combobox().find(`ui5-cb-item[text*="${optionText}"]`).should('exist');

  cy.get(`ui5-combobox${selector}`)
    .find('input')
    .should('not.be.disabled')
    .click()
    .clear()
    .type(optionText)
    .then(($input) => {
      // A late popover "open" event from the previous combobox can steal focus mid-typing;
      // this combobox's own refocus then selects the whole value and the next keys replace it.
      // If that happened, set the value directly.
      if (!$input.val().startsWith(optionText)) {
        const input = $input[0];
        input.value = optionText;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

  cy.get('ui5-cb-item:visible').contains(optionText).click({ force: force });
}

export function chooseSelectOption(optionText, force = true) {
  // clicking the ui5-option host often misses; the inner <li> is the real target
  cy.get('ui5-option:visible').contains(optionText).find('li').click({ force });

  cy.get('ui5-option:visible').should('not.exist');
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
