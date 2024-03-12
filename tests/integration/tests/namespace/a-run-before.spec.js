/// <reference types="cypress" />

context('Create Namespace', () => {
  Cypress.skipAfterFail({ skipAllSuits: true });

  before(cy.loginAndSelectCluster);

  it('Create Namespace', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.contains('ui5-button', 'Create').click();

    cy.get('.create-form')
      .find('ui5-checkbox[text="Create Resource Quota"]:visible')
      .find('[role="checkbox"]')
      .click();

    cy.get('.create-form')
      .find('ui5-checkbox[text="Create Limit Range"]:visible')
      .find('[role="checkbox"]')
      .click();

    cy.get('[aria-label="expand Apply Total Memory Quotas"]')
      .find('ui5-combobox[placeholder="Choose preset"]:visible')
      .find('ui5-icon[accessible-name="Select Options"]')
      .click();

    cy.get('ui5-static-area')
      .find('ui5-li:visible')
      .contains('XL (limits: 9Gi, requests: 8.4Gi)')
      .find('li[role="listitem"]')
      .click({ force: true });

    cy.get('.create-form')
      .find('[aria-label="Namespace name"]:visible')
      .find('input')
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.get('.create-form')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();

    cy.contains('ui5-title', Cypress.env('NAMESPACE_NAME')).should(
      'be.visible',
    );

    cy.get('ui5-tabcontainer')
      .find('[role="tablist"]')
      .find('[role="tab"]')
      .contains('Edit')
      .click();

    cy.get('.edit-form')
      .contains('ui5-button', 'Save')
      .should('be.visible')
      .click();
  });
});
