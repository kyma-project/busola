/// <reference types="cypress" />

context('Test Companion Chat Behavior', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('KYMA_COMPANION', true);
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails('default');
  });

  beforeEach(() => {
    cy.mockPromptSuggestions();
    cy.mockChatResponse();
    cy.mockFollowups();
  });

  it('core chat functionality works correctly', () => {
    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 2)
      .eq(1)
      .should('be.visible')
      .should('have.class', 'ai-busy-indicator');

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 2)
      .eq(0)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'Hi, I am your Kyma assistant!');

    cy.wait('@getPromptSuggestions').then(interception => {
      expect(interception.request.body).to.deep.equal({
        resourceName: 'default',
        resourceType: 'Namespace',
        groupVersion: 'v1',
        namespace: '',
      });
    });
    cy.wait(1000);

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 2)
      .eq(0)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'Hi, I am your Kyma assistant!');

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 2)
      .eq(1)
      .should('have.class', 'bubbles-container')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .each((button, index) => {
        cy.wrap(button)
          .should('be.visible')
          .should('contain.text', `suggestion${index + 1}`);
      });

    cy.clickSuggestion(0);

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 3)
      .eq(1)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'right-aligned')
      .should('contain.text', 'suggestion1');

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 3)
      .eq(2)
      .should('be.visible')
      .should('have.class', 'tasks-list');

    cy.wait('@getChatResponse').then(interception => {
      expect(interception.request.body).to.deep.equal({
        resourceName: 'default',
        resourceType: 'Namespace',
        groupVersion: 'v1',
        namespace: '',
        query: 'suggestion1',
      });
      expect(interception.request.headers['session-id']).to.equal('test-id');
    });
    cy.wait(250);

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 4)
      .eq(3)
      .should('be.visible')
      .should('have.class', 'ai-busy-indicator');

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 4)
      .eq(2)
      .should('be.visible')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'Hello, this is an AI response');

    cy.wait('@getFollowUpSuggestions').then(interception => {
      expect(interception.request.headers['session-id']).to.equal('test-id');
    });
    cy.wait(2500);

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 4)
      .eq(3)
      .should('have.class', 'bubbles-container')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .each((button, index) => {
        cy.wrap(button)
          .should('be.visible')
          .should('contain.text', `followup${index + 1}`);
      });

    cy.clickSuggestion(2);

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 5)
      .eq(3)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'right-aligned')
      .should('contain.text', 'followup3');

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 5)
      .eq(4)
      .should('be.visible')
      .should('have.class', 'tasks-list');

    cy.wait('@getChatResponse').then(interception => {
      expect(interception.request.body).to.deep.equal({
        resourceName: 'default',
        resourceType: 'Namespace',
        groupVersion: 'v1',
        namespace: '',
        query: 'followup3',
      });
      expect(interception.request.headers['session-id']).to.equal('test-id');
    });
    cy.wait(250);

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 6)
      .eq(5)
      .should('be.visible')
      .should('have.class', 'ai-busy-indicator');

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 6)
      .eq(4)
      .should('be.visible')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'Hello, this is an AI response');

    cy.wait('@getFollowUpSuggestions').then(interception => {
      expect(interception.request.headers['session-id']).to.equal('test-id');
    });
    cy.wait(2500);

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 6)
      .eq(5)
      .should('have.class', 'bubbles-container')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .each((button, index) => {
        cy.wrap(button)
          .should('be.visible')
          .should('contain.text', `followup${index + 1}`);
      });
  });

  it('chat history remains when navigating', () => {
    cy.get('.kyma-companion').as('companion');

    cy.navigateTo('Configuration', 'Service Accounts');
    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 6);

    cy.get('@companion')
      .find('.chat-list > *')
      .eq(0)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'Hi, I am your Kyma assistant!');

    cy.get('@companion')
      .find('.chat-list > *')
      .eq(1)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'right-aligned')
      .should('contain.text', 'suggestion1');

    cy.get('@companion')
      .find('.chat-list > *')
      .eq(2)
      .should('be.visible')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'Hello, this is an AI response');

    cy.get('@companion')
      .find('.chat-list > *')
      .eq(3)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'right-aligned')
      .should('contain.text', 'followup3');

    cy.get('@companion')
      .find('.chat-list > *')
      .eq(4)
      .should('be.visible')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'Hello, this is an AI response');

    cy.get('@companion')
      .find('.chat-list > *')
      .eq(5)
      .should('have.class', 'bubbles-container')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .each((button, index) => {
        cy.wrap(button)
          .should('be.visible')
          .should('contain.text', `followup${index + 1}`);
      });
  });

  it('context of requests updates after navigation', () => {
    cy.get('.kyma-companion').as('companion');

    cy.clickSuggestion(4);

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 7)
      .eq(5)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'right-aligned')
      .should('contain.text', 'followup5');

    cy.get('@companion')
      .find('.chat-list > *')
      .eq(6)
      .should('be.visible')
      .should('have.class', 'tasks-list');

    cy.wait('@getChatResponse').then(interception => {
      expect(interception.request.body).to.deep.equal({
        resourceName: '',
        resourceType: 'ServiceAccount',
        groupVersion: 'v1',
        namespace: 'default',
        query: 'followup5',
      });
      expect(interception.request.headers['session-id']).to.equal('test-id');
    });
    cy.wait(1000);
  });

  it('resetting chat works correctly', () => {
    cy.intercept('POST', '/backend/ai-chat/suggestions', req => {
      req.reply({
        delay: 500,
        body: {
          promptSuggestions: [
            `resetSuggestion1`,
            `resetSuggestion2`,
            `resetSuggestion3`,
            `resetSuggestion4`,
            `resetSuggestion5`,
          ],
          conversationId: `reset-id`,
        },
      });
    }).as('getPromptSuggestions');

    cy.get('.kyma-companion').as('companion');
    cy.resetCompanion();

    cy.get('@companion')
      .find('.chat-list > *')
      .eq(1)
      .should('be.visible')
      .should('have.class', 'ai-busy-indicator');

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 2)
      .eq(0)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'Hi, I am your Kyma assistant!');

    cy.wait('@getPromptSuggestions').then(interception => {
      expect(interception.request.body).to.deep.equal({
        resourceName: '',
        resourceType: 'ServiceAccount',
        groupVersion: 'v1',
        namespace: 'default',
      });
    });
    cy.wait(1000);

    cy.get('@companion')
      .find('.chat-list > *')
      .should('have.length', 2)
      .eq(1)
      .should('have.class', 'bubbles-container')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .each((button, index) => {
        cy.wrap(button)
          .should('be.visible')
          .should('contain.text', `resetSuggestion${index + 1}`);
      });
  });

  it('disables input and reset button while loading', () => {
    cy.get('.kyma-companion').as('companion');
    cy.resetCompanion();

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule"]')
      .find('textarea')
      .should('be.visible')
      .should('be.disabled');

    cy.get('@companion')
      .find('ui5-button[tooltip="Reset"]')
      .should('be.visible')
      .should('be.disabled');

    cy.wait('@getPromptSuggestions');
    cy.wait(1000);

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule"]')
      .find('textarea')
      .should('be.visible')
      .should('not.be.disabled');

    cy.get('@companion')
      .find('ui5-button[tooltip="Reset"]')
      .should('be.visible')
      .should('not.be.disabled');

    cy.closeCompanion();
    cy.openCompanion();

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule"]')
      .find('textarea')
      .should('be.visible')
      .should('be.disabled');

    cy.get('@companion')
      .find('ui5-button[tooltip="Reset"]')
      .should('be.visible')
      .should('be.disabled');

    cy.wait('@getPromptSuggestions');
    cy.wait(1000);

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule"]')
      .find('textarea')
      .should('be.visible')
      .should('not.be.disabled');

    cy.get('@companion')
      .find('ui5-button[tooltip="Reset"]')
      .should('be.visible')
      .should('not.be.disabled');

    cy.clickSuggestion(3);

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule"]')
      .find('textarea')
      .should('be.visible')
      .should('be.disabled');

    cy.get('@companion')
      .find('ui5-button[tooltip="Reset"]')
      .should('be.visible')
      .should('be.disabled');

    cy.wait('@getChatResponse');
    cy.wait(250);

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule"]')
      .find('textarea')
      .should('be.visible')
      .should('be.disabled');

    cy.get('@companion')
      .find('ui5-button[tooltip="Reset"]')
      .should('be.visible')
      .should('be.disabled');

    cy.wait('@getFollowUpSuggestions');
    cy.wait(2500);

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule"]')
      .find('textarea')
      .should('be.visible')
      .should('not.be.disabled');

    cy.get('@companion')
      .find('ui5-button[tooltip="Reset"]')
      .should('be.visible')
      .should('not.be.disabled');
  });
});
