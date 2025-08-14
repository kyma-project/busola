/// <reference types="cypress" />

context('Create Namespace', () => {
  Cypress.skipAfterFail({ skipAllSuits: true });

  before(cy.loginAndSelectCluster);

  it('Create Namespace', () => {
    cy.getLeftNav()
      .find('ui5-side-navigation-item')
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

    cy.get('ui5-cb-item:visible')
      .find('li', 'XL (limits: 9Gi, requests: 8.4Gi)')
      .click({ force: true });

    cy.wait(1000);

    cy.get('.create-form')
      .find('ui5-input[accessible-name="Namespace name"]:visible')
      .find('input')
      .should('not.be.disabled', { timeout: 5000 })
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.saveChanges('Create');

    cy.contains('ui5-title', Cypress.env('NAMESPACE_NAME')).should(
      'be.visible',
    );

    cy.inspectTab('Edit');

    cy.saveChanges('Edit');
  });
});
