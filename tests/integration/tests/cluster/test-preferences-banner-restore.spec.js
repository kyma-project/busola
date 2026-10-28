/// <reference types="cypress" />

context('Preferences - Restore Dismissed Banners', () => {
  Cypress.skipAfterFail();

  beforeEach(() => {
    cy.clearLocalStorage('busola.dismissedBanners');
    cy.loginAndSelectCluster();
  });

  it('should disable restore button when no banners are dismissed', () => {
    cy.goToClusterOverview();
    cy.openSettingsMenu();
    cy.get('ui5-list')
      .find('ui5-li-custom')
      .then((items) => {
        cy.wrap(items).eq(2).click();
      });
    cy.get('ui5-tab-container').find('ui5-tab').contains('Other').click();

    // Restore button should be disabled when no banners are dismissed
    cy.contains('ui5-button', 'Restore all').should('be.disabled');
  });

  it('should enable restore button when banners are dismissed', () => {
    cy.goToClusterOverview();
    cy.get('ui5-button.decline-button').first().click();
    cy.openSettingsMenu();
    cy.get('ui5-list')
      .find('ui5-li-custom')
      .then((items) => {
        cy.wrap(items).eq(2).click();
      });
    cy.get('ui5-tab-container').find('ui5-tab').contains('Other').click();

    // Restore button should be enabled when banners are dismissed
    cy.contains('ui5-button', 'Restore all').should('not.be.disabled');
  });

  it('should restore all dismissed banners when restore button is clicked', () => {
    cy.goToClusterOverview();

    cy.get('ui5-button.decline-button').first().click();

    cy.openSettingsMenu();
    cy.get('ui5-list')
      .find('ui5-li-custom')
      .then((items) => {
        cy.wrap(items).eq(2).click();
      });
    cy.get('ui5-tab-container').find('ui5-tab').contains('Other').click();

    cy.contains('ui5-button', 'Restore all').click();

    // Button should be immediately disabled (atom reactivity)
    cy.contains('ui5-button', 'Restore all').should('be.disabled');

    cy.contains('ui5-button', 'Close').click();

    // Banners should reappear without reload (atom reactivity)
    cy.get('ui5-button.decline-button').should('have.length.greaterThan', 0);

    cy.reload();

    // localStorage should be cleared after reload (atom persistence)
    cy.window().then((win) => {
      const dismissed = JSON.parse(
        win.localStorage.getItem('busola.dismissedBanners') || '[]',
      );
      expect(dismissed).to.deep.equal([]);
    });
  });
});
