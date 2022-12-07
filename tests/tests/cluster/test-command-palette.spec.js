/// <reference types="cypress" />

function openCommandPalette() {
  cy.get('body').type(
    `${Cypress.platform === 'darwin' ? '{cmd}k' : '{ctrl}k'}`,
  );
}

function closeCommandPalette() {
  cy.get('body').type('{esc}');
}

function getQueryInput() {
  return cy.get('[aria-label=command-palette-search]');
}

context('Test Command Palette navigation', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Opening and closing Command Palette', () => {
    const expectOpened = () => getQueryInput().should('be.visible');
    const expectClosed = () => getQueryInput().should('not.exist');

    openCommandPalette();
    expectOpened();

    closeCommandPalette();
    expectClosed();

    openCommandPalette();
    cy.get('#command-palette-background').click();
    expectClosed();
  });

  it('Basic navigation', () => {
    cy.contains('Cluster Details');

    // navigate to namespace
    openCommandPalette();

    cy.get('[aria-label="Remove Namespace context"]').should('not.exist');

    getQueryInput().type('ns default');

    cy.contains('default').click();

    cy.url().should('match', new RegExp('namespaces/default/details'));

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

    cy.contains('Cluster Details - Nodes').should('be.visible');

    // navigate to cluster overview
    openCommandPalette();

    getQueryInput().type('ov');

    getQueryInput().trigger('keydown', { key: 'Enter' });

    cy.contains('API Server Address').should('be.visible');

    // navigate to generic CR
    openCommandPalette();

    getQueryInput().type('verticalpodautoscalercheckpoints');

    getQueryInput().trigger('keydown', { key: 'Enter' });

    cy.contains('VerticalPodAutoscalerCheckpoints').should('be.visible');
  });

  it('History', () => {
    openCommandPalette();

    getQueryInput().type('ov');
    getQueryInput().trigger('keydown', { key: 'Enter' });

    openCommandPalette();
    // switch to history
    getQueryInput().type('{uparrow}');

    // search from previous case
    cy.get('[placeholder^="overview"]')
      .should('be.visible')
      // back to normal mode

      .type('{downarrow}');

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
    getQueryInput().type('podz');

    cy.contains('Did you mean: pod').should('be.visible');

    cy.contains('List of Pods').should('not.exist');

    getQueryInput().trigger('keydown', { key: 'Tab' });

    cy.contains('List of Pods').should('be.visible');
    closeCommandPalette();
  });

  it('Autocompletion', () => {
    openCommandPalette();

    getQueryInput().type('pref');

    // autocomplete
    getQueryInput().trigger('keydown', { key: 'Tab' });

    getQueryInput().trigger('keydown', { key: 'Enter' });

    cy.contains('Cluster interaction').should('be.visible');

    cy.contains('Close').click();
  });

  it('Disables Command Palette if a modal is present', () => {
    openCommandPalette();

    getQueryInput().type('deploy');
    getQueryInput().trigger('keydown', { key: 'Enter' });

    cy.contains('Create Deployment').click();

    openCommandPalette();

    getQueryInput().should('not.exist');
  });
});
