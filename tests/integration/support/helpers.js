export function chooseComboboxOption(selector, optionText, inputSelector = '') {
  cy.get(`ui5-combobox${selector}`)
    .find(`input${inputSelector}`)
    .filterWithNoValue()
    .click()
    .type(optionText);

  cy.get('ui5-li:visible')
    .contains(optionText)
    .find('li')
    .click({ force: true });

  return cy.end();
}
