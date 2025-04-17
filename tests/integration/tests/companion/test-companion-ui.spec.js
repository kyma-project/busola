/// <reference types="cypress" />

context('Test Companion UI', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('KYMA_COMPANION', true);
    cy.loginAndSelectCluster();
    cy.openCompanion();
  });

  describe('fullscreen button', () => {
    it('enters fullscreen correctly', () => {
      cy.get('.kyma-companion').as('companion');

      cy.get('ui5-title')
        .contains('Cluster Details')
        .should('be.visible');
      cy.get('#companion_wrapper')
        .parent()
        .should('have.css', 'flex-basis', '30%');

      cy.get('@companion')
        .find('ui5-button[icon="full-screen"]')
        .click();

      cy.get('ui5-title')
        .contains('Cluster Details')
        .should('not.be.visible');
      cy.get('#companion_wrapper')
        .parent()
        .should('have.css', 'flex-basis', '100%');
    });

    it('exits fullscreen correctly', () => {
      cy.get('.kyma-companion').as('companion');

      cy.get('@companion')
        .find('ui5-button[icon="exit-full-screen"]')
        .click();

      cy.get('ui5-title')
        .contains('Cluster Details')
        .should('be.visible');
      cy.get('#companion_wrapper')
        .parent()
        .should('have.css', 'flex-basis', '30%');
    });
  });

  describe('availability outside of cluster context', () => {
    it('companion should not be available on cluster list', () => {
      cy.get('ui5-shellbar').as('shellbar');

      cy.get('@shellbar')
        .find('.ui5-shellbar-menu-button')
        .click();

      cy.wait(1000);

      cy.get('@shellbar')
        .find('ui5-li')
        .contains('Clusters Overview')
        .should('be.visible')
        .find('li[part="native-li"]')
        .click({ force: true });
      cy.wait(1000);

      cy.get('@shellbar')
        .find('ui5-button[icon="da"]')
        .should('not.exist');
    });
  });
});
