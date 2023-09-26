/// <reference types="cypress" />

context('Create Namespace', () => {
  Cypress.skipAfterFail({ skipAllSuits: true });

  before(cy.loginAndSelectCluster);

  it('Create Namespace', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.contains('ui5-button', 'Create Namespace').click();

    cy.contains('Advanced').click();

    cy.get('ui5-checkbox[text="Create Resource Quota"]').click();

    cy.get('ui5-checkbox[text="Create Limit Range"]').click();

    cy.get('[aria-label="expand Apply Total Memory Quotas"]')
      .contains('Choose preset')
      .click();

    cy.contains('XL (limits: 9Gi').click();

    cy.get('ui5-dialog')
      .find('input[ariaLabel="Namespace name"]:visible')
      .click()
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.get('ui5-dialog')
      .contains('Advanced')
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();

    cy.contains('ui5-title', Cypress.env('NAMESPACE_NAME')).should(
      'be.visible',
    );

    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Update')
      .should('be.visible')
      .click();
  });
});
