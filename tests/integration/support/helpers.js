export function chooseComboboxOption(selector, optionText) {
  cy.get(`ui5-combobox${selector}`)
    .find('input')
    .filterWithNoValue()
    .click()
    .type(optionText);

  cy.contains('ui5-li:visible', optionText).click();

  return cy.end();
}
