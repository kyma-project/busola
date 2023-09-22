export function chooseComboboxOption(selector, optionText) {
  cy.get(selector)
    .filterWithNoValue()
    .click()
    .type(optionText);

  cy.contains('li', optionText).click();

  return cy.end();
}
