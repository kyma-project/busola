/// <reference types="cypress" />

context('Create Namespace', () => {
  Cypress.skipAfterFail({ skipAllSuits: true });

  before(cy.loginAndSelectCluster);

  it('Create Namespace', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.wait(800);

    cy.get('ui5-button')
      .contains('Create Namespace')
      .click();

    cy.contains('Advanced').click();

    cy.contains('Create Resource Quota').click();

    cy.contains('Create Limit Range').click();

    cy.get('[aria-label="expand Apply Total Memory Quotas"]')
      .contains('Choose preset')
      .click();

    cy.contains('XL (limits: 9Gi').click();

    cy.get('ui5-dialog[accessible-role="Dialog"]')
      .find('input[ariaLabel="Namespace name"]:visible')
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.get('ui5-dialog[accessible-role="Dialog"]')
      .contains('Advanced')
      .click();

    cy.get('ui5-dialog[accessible-role="Dialog"]')
      .get('ui5-button.ui5-bar-content')
      .contains('Create')
      .should('be.visible')
      .click();

    cy.contains('ui5-title', Cypress.env('NAMESPACE_NAME')).should(
      'be.visible',
    );

    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog[accessible-role="Dialog"]')
      .get('ui5-button.ui5-bar-content')
      .contains('Update')
      .should('be.visible')
      .click();
  });
});
