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
  return cy.getIframeBody().find('[aria-label=command-palette-search]');
}

context('Test Command Palette navigation', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Opening and closing Command Palette from both main frame and inner frame', () => {
    const expectOpened = () => getQueryInput().should('be.visible');
    const expectClosed = () => getQueryInput().should('not.exist');

    // main frame
    openCommandPalette();
    expectOpened();

    closeCommandPalette();
    expectClosed();

    // inner frame
    cy.getIframeBody().type(
      `${Cypress.platform === 'darwin' ? '{cmd}k' : '{ctrl}k'}`,
    );
    expectOpened();

    cy.getIframeBody().type('{esc}');
    expectClosed();

    // any frame, but click on background to close
    openCommandPalette();
    cy.getIframeBody()
      .find('#command-palette-background')
      .click();
    expectClosed();
  });

  it('Basic navigation', () => {
    // reloading seems to fix the strange issue where Luigi navigates us back to previous page
    cy.reload();
    cy.getIframeBody().contains('Cluster Details');

    // navigate to namespace
    openCommandPalette();

    cy.getIframeBody()
      .find('[aria-label="Remove Namespace context"]')
      .should('not.exist');

    getQueryInput().type('ns default');

    cy.getIframeBody()
      .contains('default')
      .click();

    cy.url().should('match', new RegExp('namespaces/default/details'));

    // navigate to pod details
    openCommandPalette();

    cy.getIframeBody()
      .find('[aria-label="Remove Namespace context"]')
      .should('be.visible');

    getQueryInput().type('applications ');

    cy.getIframeBody()
      .contains(Cypress.env('APP_NAME'))
      .click();

    cy.url().should('match', new RegExp(`/applications/details/`));

    // navigate to list of cluster role bindings
    openCommandPalette();

    getQueryInput().type('crb');

    cy.getIframeBody()
      .contains('List of Cluster Role Bindings')
      .click();

    cy.url().should('match', new RegExp(`/clusterrolebindings`));

    // navigate to nodes
    openCommandPalette();

    getQueryInput().type('nodes ');

    cy.getIframeBody()
      .contains('Cluster Details > Nodes')
      .first()
      .click();

    cy.getIframeBody()
      .contains('Cluster Details - Nodes')
      .should('be.visible');

    // navigate to cluster overview
    openCommandPalette();

    getQueryInput().type('ov');

    getQueryInput().trigger('keydown', { key: 'Enter' });

    cy.getIframeBody()
      .contains('API Server Address')
      .should('be.visible');
  });

  it('History', () => {
    openCommandPalette();

    getQueryInput().type('ov');
    getQueryInput().trigger('keydown', { key: 'Enter' });

    openCommandPalette();
    // switch to history
    getQueryInput().type('{uparrow}');

    // search from previous case
    cy.getIframeBody()
      .find('[placeholder^="overview"]')
      .should('be.visible')
      // back to normal mode

      .type('{downarrow}');

    getQueryInput().should('be.visible');
  });

  it('Help', () => {
    getQueryInput().type('?');

    cy.getIframeBody()
      .contains('to navigate between results')
      .should('be.visible');

    getQueryInput().clear();
    getQueryInput().type('help');

    cy.getIframeBody()
      .contains('to navigate between results')
      .should('be.visible');

    getQueryInput().clear();
  });

  it('DidYouMean', () => {
    getQueryInput().type('podz');

    cy.getIframeBody()
      .contains('Did you mean: pods')
      .should('be.visible');

    cy.getIframeBody()
      .contains('List of Pods')
      .should('not.exist');

    getQueryInput().trigger('keydown', { key: 'Tab' });

    cy.getIframeBody()
      .contains('List of Pods')
      .should('be.visible');
    closeCommandPalette();
  });

  it('Autocompletion', () => {
    openCommandPalette();

    getQueryInput().type('pref');

    // autocomplete
    getQueryInput().trigger('keydown', { key: 'Tab' });

    getQueryInput().trigger('keydown', { key: 'Enter' });

    cy.getModalIframeBody().should('be.visible');
  });

  it('Disables Command Palette if a modal is present', () => {
    openCommandPalette();

    cy.getModalIframeBody()
      .find('[aria-label=command-palette-search]')
      .should('not.exist');

    // nav is broken again
    cy.reload();
    cy.getIframeBody().contains('Cluster Details');

    openCommandPalette();

    getQueryInput().type('deploy');
    getQueryInput().trigger('keydown', { key: 'Enter' });

    cy.getIframeBody()
      .contains('Create Deployment')
      .click();

    openCommandPalette();

    getQueryInput().should('not.exist');
  });
});
