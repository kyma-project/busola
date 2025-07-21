context('Test Community Modules views', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Test Community Modules Overview card', () => {
    cy.wait(2000);

    cy.get('ui5-card')
      .contains('Modules Overview')
      .should('be.visible');

    cy.contains('ui5-card', 'Community Modules')
      .contains('0')
      .should('be.visible');

    cy.get('ui5-card')
      .contains('Modify Modules')
      .click();

    cy.url().should('match', /.*\/kymamodules/);
  });

  it('Check if edit is empty', () => {
    cy.wait(500);
    cy.inspectTab('Edit');

    cy.contains('No community modules installed').should('be.visible');

    cy.inspectTab('View');
  });

  it('Test adding Community Module', () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .find('ui5-table')
      .find('ui5-illustrated-message')
      .find('ui5-title', 'No Community modules')
      .should('be.visible');

    // Add first module
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .contains('ui5-button', 'Add')
      .click();

    cy.wait(1000);

    cy.get('ui5-card')
      .contains('busola')
      .should('be.visible');

    cy.get('[data-testid="create-form-footer-bar"]')
      .contains('ui5-button:visible', 'Add')
      .click();
  });

  it('Test Community Modules list and details', () => {});
  it('Test changing Community Module version', () => {});
  it('Test deleting Community Modules from List and Details', () => {});
});
