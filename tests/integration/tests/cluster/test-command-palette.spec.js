/// <reference types="cypress" />

function openCommandPalette() {
  cy.get('body').type(
    `${Cypress.platform === 'darwin' ? '{cmd}k' : '{ctrl}k'}`,
    { force: true },
  );
}

function closeCommandPalette() {
  cy.get('body').type('{esc}', { force: true });
}

function getQueryUI5Input() {
  return cy.get('[aria-label=command-palette-search]');
}
function getQueryInput() {
  return cy.get('[aria-label=command-palette-search]').find('input');
}

context('Test Command Palette navigation', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Opening and closing Command Palette', () => {
    const expectOpened = () => getQueryUI5Input().should('be.visible');
    const expectClosed = () => getQueryUI5Input().should('not.exist');

    openCommandPalette();
    expectOpened();

    closeCommandPalette();
    expectClosed();

    openCommandPalette();
    cy.get('#command-palette-background').click();
    expectClosed();
  });

  it('Basic navigation', () => {
    cy.contains('ui5-title', 'Cluster Details');

    // navigate to namespace
    openCommandPalette();

    cy.get('[aria-label="Remove Namespace context"]').should('not.exist');

    getQueryInput().type('ns default');

    cy.contains('default').click();

    cy.url().should('match', new RegExp('namespaces/default'));

    // navigate to list of cluster role bindings
    openCommandPalette();

    cy.get('[aria-label="Remove Namespace context"]').should('be.visible');

    getQueryInput().type('crb');

    cy.contains('List of Cluster Role Bindings').click();

    cy.url().should('match', new RegExp(`/clusterrolebindings`));

    // navigate to nodes
    openCommandPalette();

    getQueryInput().type('nodes ');

    cy.contains('Cluster Details > Nodes')
      .first()
      .click();

    cy.get('ui5-breadcrumbs')
      .should('contain.text', 'Cluster Details - Nodes')
      .should('be.visible');
  });

  it('All namespaces', () => {
    // navigate to deployments
    openCommandPalette();

    getQueryInput().type('deployments{enter}');

    openCommandPalette();

    getQueryInput().type('ns -a');

    cy.contains('All Namespaces').click({ force: true });

    cy.url().should('match', /\/namespaces\/-all-\/deployments$/);
  });

  it('History', () => {
    openCommandPalette();

    // navigate to cluster overview
    getQueryInput().type('ov{enter}');
    cy.contains('API Server Address').should('be.visible');

    openCommandPalette();
    // switch to history
    getQueryInput().type('{uparrow}');

    // search from previous case
    cy.get('[placeholder^="overview"]')
      .first()
      .should('be.visible')
      // back to normal mode

      .type('{downarrow}', { force: true });

    getQueryInput().should('be.visible');
  });

  it('Help', () => {
    getQueryInput().type('?');

    cy.contains('to navigate between results').should('be.visible');

    getQueryInput().clear();
    getQueryInput().type('help');

    cy.contains('to navigate between results').should('be.visible');

    getQueryInput().clear();
  });

  it('DidYouMean', () => {
    // TODO: fix this test
    getQueryInput().type('podz');

    cy.contains('Did you mean: pod').should('be.visible');

    cy.contains('List of Pods').should('not.exist');

    cy.contains('p', 'Did you mean:')
      .find('ui5-button')
      .click();

    cy.contains('List of Pods').should('be.visible');
    closeCommandPalette();
  });

  // TAB IS NOT WORKING
  // it('Autocompletion', () => {
  //   openCommandPalette();

  //   getQueryInput().type('pref');

  //   // autocomplete
  //   getQueryInput().tab().type('{enter}');

  //   cy.contains('Cluster interaction').should('be.visible');

  //   cy.contains('Close').click();
  // });

  it('Disables Command Palette if a modal is present', () => {
    openCommandPalette();

    getQueryInput().type('deploy{enter}');

    cy.contains('ui5-button', 'Create Deployment').click();

    cy.get('[aria-label="Deployment name"]:visible')
      .find('input')
      .type(`${Cypress.platform === 'darwin' ? '{cmd}k' : '{ctrl}k'}`, {
        force: true,
      });

    getQueryUI5Input().should('not.exist');
  });
});
