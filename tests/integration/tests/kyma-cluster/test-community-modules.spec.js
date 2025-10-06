context('Test Community Modules views', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Test Community Modules Overview card', () => {
    cy.wait(2000);

    cy.get('ui5-card').contains('Modules Overview').should('be.visible');

    cy.contains('ui5-card', 'Community Modules')
      .contains('0')
      .should('be.visible');

    cy.get('ui5-card').contains('Modify Modules').click();

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

    cy.get('ui5-title').contains('Add Community Modules').should('be.visible');

    cy.get('ui5-card').contains('busola').should('be.visible');

    cy.get('ui5-card').contains('Documentation').should('be.visible');

    cy.get('ui5-panel').contains('Advanced').should('be.visible');

    cy.get('ui5-title').contains('busola').click();

    // TODO: This wait allows 'community modules add/edit/delete' to download needed resources to apply from backend.
    // The download is initiated when user mark module to install and then when user click delete, it deleted what is was able to download
    cy.wait(2000);

    cy.get('[data-testid="create-form-footer-bar"]')
      .contains('ui5-button:visible', 'Add')
      .click();

    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .contains('ui5-button', 'Add')
      .click();

    // Check if already installed module is not visible
    cy.get('.create-form').contains('No community modules available');
  });

  it('Test number of Modules in Modules Overview card', () => {
    cy.getLeftNav().contains('Cluster Details').click();

    cy.contains('ui5-card', 'Installed Modules')
      .contains('1')
      .should('be.visible');

    cy.contains('ui5-card', 'Community Modules')
      .contains('1')
      .should('be.visible');

    cy.get('ui5-card').contains('Modify Modules').click();
  });

  it('Test Community Modules list', () => {
    cy.wait(1000);

    cy.get('.community-modules-list')
      .find('ui5-input[id^=search-]:visible')
      .find('input')
      .wait(1000)
      .type('busola');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('busola')
      .should('be.visible');
  });

  it('Test changing Community Module version', () => {
    cy.inspectTab('Edit');

    cy.wait(1000);

    cy.contains('ui5-label', 'busola').should('be.visible');

    cy.contains('ui5-label', 'busola').parent().find('ui5-select').click();

    cy.wait(500);

    cy.get('ui5-option:visible').contains('0.0.12').click();

    // TODO: This wait allows 'community modules add/edit/delete' to download needed resources to apply from backend.
    // The download is initiated when user mark module to install and then when user click delete, it deleted what is was able to download
    cy.wait(2000);

    cy.get('ui5-panel[data-testid="community-modules-edit"]')
      .find('ui5-button')
      .contains('Save')
      .click();

    cy.contains('Community Modules updated').should('be.visible');

    cy.inspectTab('View');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('busola')
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('0.0.12')
      .should('be.visible');
  });

  it('Test deleting Community Modules from List and Details', () => {
    cy.deleteFromGenericList('Module', 'busola', {
      searchInPlainTableText: true,
      deletedVisible: false,
      parentSelector: '.community-modules-list',
      waitForDelete: 2000,
    });
  });
});
