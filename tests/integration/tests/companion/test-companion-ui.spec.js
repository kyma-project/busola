/// <reference types="cypress" />

context('Test Companion UI', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('KYMA_COMPANION', true);
    cy.loginAndSelectCluster();
  });

  beforeEach(() => {
    cy.mockPromptSuggestions();
    cy.mockChatResponse();
    cy.mockFollowups();
  });

  describe('Test Welcome screen', () => {
    it('Initial loading screen should appear on first open', () => {
      cy.openCompanion();

      cy.get('.kyma-companion').as('companion');

      cy.get('@companion')
        .find('.chat-loading-screen')
        .find('.chat-loading-indicator')
        .should('be.visible');

      cy.closeCompanion();
    });

    it('Welcome screen should be visible on first open', () => {
      cy.openCompanion();
      cy.wait(3000);
      cy.get('.kyma-companion').as('companion');

      cy.wait('@getPromptSuggestions');
      cy.wait(1000);

      cy.get('@companion')
        .find('.chat-initial-screen')
        .contains('Hello')
        .should('be.visible');

      cy.closeCompanion();
    });

    it('Loading screen should not be visible after reset', () => {
      cy.openCompanion();
      cy.get('.kyma-companion').as('companion');

      cy.clickSuggestion(0);

      cy.get('@companion').find('.chat-initial-screen').should('not.exist');

      cy.resetCompanion();

      cy.get('@companion').find('.chat-loading-screen').should('not.exist');

      cy.get('@companion').find('.ai-busy-indicator').should('be.visible');

      cy.closeCompanion();
    });

    it('Welcome screen should be visible after reset', () => {
      cy.openCompanion();
      cy.get('.kyma-companion').as('companion');

      cy.clickSuggestion(0);

      cy.get('@companion').find('.chat-initial-screen').should('not.exist');

      cy.resetCompanion();

      cy.get('@companion')
        .find('.chat-initial-screen')
        .contains('Hello')
        .should('be.visible');

      cy.closeCompanion();
    });
  });

  describe('Fullscreen button', () => {
    it('Enters fullscreen correctly', () => {
      cy.openCompanion();

      cy.get('.kyma-companion').as('companion');

      cy.get('ui5-title').contains('Cluster Overview').should('be.visible');
      cy.get('#companion_wrapper')
        .parent()
        .should('have.css', 'flex-basis', '30%');

      cy.get('@companion').find('ui5-button[icon="full-screen"]').click();

      cy.get('ui5-title').contains('Cluster Overview').should('not.be.visible');
      cy.get('#companion_wrapper')
        .parent()
        .should('have.css', 'flex-basis', '100%');
    });

    it('exits fullscreen correctly', () => {
      cy.get('.kyma-companion').as('companion');

      cy.get('@companion').find('ui5-button[icon="exit-full-screen"]').click();

      cy.get('ui5-title').contains('Cluster Overview').should('be.visible');
      cy.get('#companion_wrapper')
        .parent()
        .should('have.css', 'flex-basis', '30%');
    });
  });

  describe('AI Announcement banner', () => {
    it('AI Banner should be visible when feature is enabled', () => {
      cy.get('ui5-card').as('featurecard');

      cy.get('@featurecard').contains('Meet Joule').should('be.visible');

      cy.get('@featurecard').contains('ui5-button', 'Try Out Joule').click();

      cy.get('.kyma-companion').as('companion');

      cy.wait(100);

      cy.get('@companion')
        .contains('Hi, I am your Kyma assistant! ')
        .should('be.visible');
    });

    it('AI Banner should NOT be visible when feature is disabled', () => {
      cy.setBusolaFeature('KYMA_COMPANION', false);
      cy.reload();

      cy.get('ui5-card').as('featurecard');

      cy.get('@featurecard').contains('Meet Joule').should('not.exist');
    });
  });

  describe('Availability outside of cluster context', () => {
    it('Companion should not be available on cluster list', () => {
      cy.setBusolaFeature('KYMA_COMPANION', false);
      cy.reload();
      cy.get('ui5-shellbar').as('shellbar');

      cy.get('@shellbar').find('#clusterSwitcherOpener').click();

      cy.wait(500);

      cy.get('ui5-popover#cluster-switcher-popover')
        .find('ui5-li')
        .contains('Clusters Overview')
        .should('be.visible')
        .find('li[part="native-li"]')
        .click({ force: true });

      cy.wait(1000);

      cy.get('@shellbar')
        .find('ui5-toggle-button[icon="da"]')
        .should('not.exist');
    });
  });
});
