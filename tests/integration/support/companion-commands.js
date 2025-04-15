Cypress.Commands.add('openCompanion', () => {
  cy.get('ui5-shellbar')
    .find('ui5-button[icon="da"]')
    .should('be.visible')
    .click();
});

Cypress.Commands.add('closeCompanion', () => {
  cy.get('.kyma-companion')
    .find('ui5-button[tooltip="Close"]')
    .click();
});

Cypress.Commands.add('resetCompanion', () => {
  cy.get('.kyma-companion')
    .find('ui5-button[tooltip="Reset"]')
    .click();
});

Cypress.Commands.add('sendPrompt', prompt => {
  cy.get('.kyma-companion')
    .find('ui5-textarea[placeholder="Message Joule"]')
    .find('textarea')
    .should('be.visible')
    .type(`${prompt}{enter}`);
});

Cypress.Commands.add('clickSuggestion', index => {
  cy.get('.kyma-companion')
    .find('.bubbles-container')
    .find('ui5-button.bubble-button')
    .eq(index)
    .click();
});

Cypress.Commands.add('testChatLength', length => {
  cy.get('.kyma-companion')
    .find('.chat-list')
    .find('.message-container')
    .should('have.length', length);
});

Cypress.Commands.add('mockPromptSuggestions', () => {
  cy.intercept('POST', '/backend/ai-chat/suggestions', req => {
    req.reply({
      delay: 750,
      body: {
        promptSuggestions: [
          'suggestion1',
          'suggestion2',
          'suggestion3',
          'suggestion4',
          'suggestion5',
        ],
        conversationId: 'test-id',
      },
    });
  }).as('getPromptSuggestions');
});

Cypress.Commands.add('mockChatResponse', () => {
  cy.intercept('POST', '/backend/ai-chat/messages', req => {
    req.reply({
      delay: 750,
      body: {
        data: {
          answer: {
            content: 'Hello, this is an AI response',
            next: '__end__',
          },
        },
      },
    });
  }).as('getChatResponse');
});

Cypress.Commands.add('mockFollowups', () => {
  cy.intercept('POST', '/backend/ai-chat/followup', req => {
    req.reply({
      delay: 750,
      body: {
        promptSuggestions: [
          'followup1',
          'followup2',
          'followup3',
          'followup4',
          'followup5',
        ],
      },
    });
  }).as('getFollowUpSuggestions');
});
