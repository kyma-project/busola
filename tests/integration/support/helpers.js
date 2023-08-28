export function chooseComboboxOption(selector, optionText) {
  cy.get(selector)
    .filterWithNoValue()
    .type(optionText);

  cy.contains(optionText).click({ force: true });

  return cy.end();
}
