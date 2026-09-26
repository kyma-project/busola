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
      // Fast typing sometimes gets partly overwritten, leaving a wrong value in the field.
      // If that happened, set the value directly instead.
      // TODO: remove once https://github.com/UI5/webcomponents/issues/14097 is fixed.
      if (!$input.val().startsWith(optionText)) {
        const input = $input[0];
        input.value = optionText;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

  cy.get('ui5-cb-item:visible').contains(optionText).click({ force: force });
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
