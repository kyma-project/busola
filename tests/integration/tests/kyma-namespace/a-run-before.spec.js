/// <reference types="cypress" />

context('Create Namespace', () => {
  Cypress.skipAfterFail({ skipAllSuits: true });

  before(cy.loginAndSelectCluster);

  it('Create Namespace', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.openCreate();

    cy.get('.create-form')
      .find('ui5-checkbox[text="Create Resource Quota"]:visible')
      .find('[role="checkbox"]')
      .click();

    cy.get('.create-form')
      .find('ui5-checkbox[text="Create Limit Range"]:visible')
      .find('[role="checkbox"]')
      .click();

    cy.get('[aria-label="Apply Total Memory Quotas, collapsed"]')
      .find('ui5-combobox[placeholder="Choose template"]:visible')
      .click();

    cy.get('ui5-responsive-popover:visible')
      .contains('ui5-li:visible', 'XL (limits: 9Gi, requests: 8.4Gi)')
      .find('li')
      .click({ force: true });

    cy.get('.create-form')
      .find('[accessible-name="Namespace name"]:visible')
      .find('input')
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.saveChanges('Create');

    cy.contains('ui5-title', Cypress.env('NAMESPACE_NAME')).should(
      'be.visible',
    );

    cy.inspectTab('Edit');

    cy.saveChanges('Edit');
  });
});
