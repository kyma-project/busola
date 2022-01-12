/// <reference types="cypress" />

function openCompass() {
  cy.get('body').type(
    `${Cypress.platform === 'darwin' ? '{cmd}k' : '{ctrl}k'}`,
  );
}

function closeCompass() {
  cy.get('body').type('{esc}');
}

function getQueryInput() {
  return cy.getIframeBody().find('[placeholder^="Type"]');
}

context('Test Compass navigation', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Opening and closing Compass from both main frame and inner frame', () => {
    const expectOpened = () => getQueryInput().should('be.visible');
    const expectClosed = () => getQueryInput().should('not.exist');

    // main frame
    openCompass();
    expectOpened();

    closeCompass();
    expectClosed();

    // inner frame
    cy.getIframeBody().type(
      `${Cypress.platform === 'darwin' ? '{cmd}k' : '{ctrl}k'}`,
    );
    expectOpened();

    cy.getIframeBody().type('{esc}');
    expectClosed();

    // any frame, but click on background to close
    openCompass();
    cy.getIframeBody()
      .find('#background')
      .click();
    expectClosed();
  });

  it('Basic navigation', () => {
    // reloading seems to fix the strange issue where Luigi navigates us back to previous page
    cy.reload();
    cy.getIframeBody().contains('Cluster Overview');

    // navigate to namespace
    openCompass();

    cy.getIframeBody()
      .find('[aria-label="Remove Namespace context"]')
      .should('not.exist');

    getQueryInput().type('ns ' + Cypress.env('NAMESPACE_NAME'));

    cy.getIframeBody()
      .contains('Namespace ' + Cypress.env('NAMESPACE_NAME'))
      .click();

    cy.url().should(
      'match',
      new RegExp(`namespaces/${Cypress.env('NAMESPACE_NAME')}/details`),
    );

    // navigate to pod details
    openCompass();

    cy.getIframeBody()
      .find('[aria-label="Remove Namespace context"]')
      .should('be.visible');

    getQueryInput().type('pods ');

    cy.getIframeBody()
      .contains('Pod ')
      .first()
      .click();

    cy.url().should('match', new RegExp(`/pods/details/`));

    // navigate to list of cluster role bindings
    openCompass();

    getQueryInput().type('crb');

    cy.getIframeBody()
      .contains('List of Cluster Role Bindings')
      .click();

    cy.url().should('match', new RegExp(`/clusterrolebindings`));

    // navigate to nodes
    openCompass();

    getQueryInput().type('nodes ');

    cy.getIframeBody()
      .contains('Node ')
      .first()
      .click();

    cy.getIframeBody()
      .contains('Cluster Overview - Nodes')
      .should('be.visible');

    // navigate to cluster overview
    openCompass();

    getQueryInput().type('ov');

    getQueryInput().trigger('keydown', { key: 'Enter' });

    cy.getIframeBody()
      .contains('API server address')
      .should('be.visible');
  });

  it('History', () => {
    openCompass();

    // switch to history
    getQueryInput().type('{uparrow}');

    // search from previous case
    cy.getIframeBody()
      .find('[placeholder^="overview"]')
      .should('be.visible')
      // back to normal mode

      .type('{downarrow}');

    getQueryInput().should('be.visible');
    closeCompass();
  });

  it('DidYouMean', () => {
    openCompass();

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
    closeCompass();
  });

  it('Autocompletion', () => {
    openCompass();

    getQueryInput().type('pref');

    // autocomplete
    getQueryInput().trigger('keydown', { key: 'Tab' });

    getQueryInput().trigger('keydown', { key: 'Enter' });

    cy.getModalIframeBody().should('be.visible');
  });
});
