/// <reference types="cypress" />

context('Preferences - Restore Dismissed Banners', () => {
  Cypress.skipAfterFail();

  beforeEach(() => {
    cy.loginAndSelectCluster();
  });

  it('should disable restore button when no banners are dismissed', () => {
    // Ensure we're on cluster overview
    cy.goToClusterOverview();

    // Clear any dismissed banners from localStorage
    cy.window().then((win) => {
      win.localStorage.removeItem('busola.dismissedBanners');
    });
    cy.reload();

    // Open Preferences through the header menu
    cy.openSettingsMenu();

    // Navigate to General tab using the database icon (3rd vertical tab)
    cy.get('ui5-list')
      .find('ui5-li-custom')
      .then((items) => {
        cy.wrap(items).eq(2).click();
      });

    // Navigate to "Other" tab
    cy.get('ui5-tab-container').find('ui5-tab').contains('Other').click();

    // Restore button should be disabled
    cy.contains('ui5-button', 'Restore all').should('be.disabled');
  });

  it('should enable restore button when banners are dismissed', () => {
    // Ensure we're on cluster overview
    cy.goToClusterOverview();

    // Dismiss a banner by clicking the decline button
    cy.get('ui5-button.decline-button').first().click();

    // Verify it's in localStorage
    cy.window().then((win) => {
      const dismissed = JSON.parse(
        win.localStorage.getItem('busola.dismissedBanners') || '[]',
      );
      expect(dismissed.length).to.be.greaterThan(0);
    });

    // Open Preferences through the header menu
    cy.openSettingsMenu();

    // Navigate to General tab using the database icon (3rd vertical tab)
    cy.get('ui5-list')
      .find('ui5-li-custom')
      .then((items) => {
        cy.wrap(items).eq(2).click();
      });

    // Navigate to "Other" tab
    cy.get('ui5-tab-container').find('ui5-tab').contains('Other').click();

    // Restore button should be enabled
    cy.contains('ui5-button', 'Restore all').should('not.be.disabled');
  });

  it('should restore all dismissed banners when restore button is clicked', () => {
    // Ensure we're on cluster overview
    cy.goToClusterOverview();

    // Dismiss a banner
    cy.get('ui5-button.decline-button').first().click();

    // Verify banner is dismissed
    cy.get('ui5-button.decline-button').should('have.length', 0);

    // Open Preferences through the header menu
    cy.openSettingsMenu();

    // Navigate to General tab
    cy.get('ui5-list')
      .find('ui5-li-custom')
      .then((items) => {
        cy.wrap(items).eq(2).click();
      });

    // Navigate to "Other" tab
    cy.get('ui5-tab-container').find('ui5-tab').contains('Other').click();

    // Click restore button
    cy.contains('ui5-button', 'Restore all').click();

    // Close preferences
    cy.contains('ui5-button', 'Close').click();

    // Reload to see the restored banner
    cy.reload();

    // Banner should reappear
    cy.get('ui5-button.decline-button').should('have.length.greaterThan', 0);

    // localStorage should be cleared
    cy.window().then((win) => {
      const dismissed = JSON.parse(
        win.localStorage.getItem('busola.dismissedBanners') || '[]',
      );
      expect(dismissed).to.deep.equal([]);
    });
  });

  it('should restore button become disabled after restoring', () => {
    // Ensure we're on cluster overview
    cy.goToClusterOverview();

    // Dismiss a banner
    cy.get('ui5-button.decline-button').first().click();

    // Open Preferences through the header menu
    cy.openSettingsMenu();

    // Navigate to General tab
    cy.get('ui5-list')
      .find('ui5-li-custom')
      .then((items) => {
        cy.wrap(items).eq(2).click();
      });

    // Navigate to "Other" tab
    cy.get('ui5-tab-container').find('ui5-tab').contains('Other').click();

    // Button should be enabled
    cy.contains('ui5-button', 'Restore all').should('not.be.disabled');

    // Click restore button
    cy.contains('ui5-button', 'Restore all').click();

    // Button should now be disabled
    cy.contains('ui5-button', 'Restore all').should('be.disabled');
  });
});
