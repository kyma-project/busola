/// <reference types="cypress" />

context('Create Namespace', () => {
  Cypress.skipAfterFail({ skipAllSuits: true });

  before(cy.loginAndSelectCluster);

  it('Create Namespace', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.contains('Create Namespace').click();

    cy.contains('Advanced').click();

    cy.contains('Create Resource Quota').click();

    cy.contains('Create Limit Range').click();

    cy.get('[aria-label="expand Apply Total Memory Quotas"]')
      .contains('Choose preset')
      .click();

    cy.contains('XL (limits: 9Gi').click();

    cy.get('[role=dialog]')
      .find('input[ariaLabel="Namespace name"]:visible')
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.get('[role=dialog]')
      .contains('Advanced')
      .click();

    cy.get('[role=dialog]')
      .get('ui5-button.fd-dialog__decisive-button')
      .contains('Create')
      .should('be.visible')
      .click();

    cy.contains('[aria-label="title"]', Cypress.env('NAMESPACE_NAME')).should(
      'be.visible',
    );

    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    cy.get('[role=dialog]')
      .get('ui5-button.fd-dialog__decisive-button')
      .contains('Update')
      .should('be.visible')
      .click();
  });
});
