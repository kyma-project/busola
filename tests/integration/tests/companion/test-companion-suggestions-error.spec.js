/// <reference types="cypress" />

context('Test Companion Initial Suggestions Error Handling', () => {
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

  it('default introductory message remains the same after suggestions are fetched', () => {
    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');

    cy.get('@companion')
      .find('.chat-list')
      .find('.message-container')
      .contains(
        'Hi, I am your Kyma assistant! You can ask me any question, and I will try to help you to the best of my abilities. Meanwhile, you can check the suggested questions below; you may find them helpful!',
      )
      .should('be.visible');

    cy.wait('@getPromptSuggestions');

    cy.get('@companion')
      .find('.chat-list')
      .find('.message-container')
      .contains(
        'Hi, I am your Kyma assistant! You can ask me any question, and I will try to help you to the best of my abilities. Meanwhile, you can check the suggested questions below; you may find them helpful!',
      )
      .should('be.visible');
  });

  it('adjusts introductory message after error of fetching initial suggestions', () => {
    cy.intercept('POST', '/backend/ai-chat/suggestions', req => {
      req.reply({
        statusCode: 500,
        body: {
          error: 'Internal Server Error',
        },
      });
    }).as('getPromptSuggestions');

    cy.get('.kyma-companion').as('companion');
    cy.closeCompanion();
    cy.openCompanion();

    cy.get('@companion')
      .find('.chat-list')
      .find('.message-container')
      .contains(
        'Hi, I am your Kyma assistant! You can ask me any question, and I will try to help you to the best of my abilities. Meanwhile, you can check the suggested questions below; you may find them helpful!',
      )
      .should('be.visible');

    cy.wait('@getPromptSuggestions');

    cy.get('@companion')
      .find('.chat-list')
      .find('.message-container')
      .contains(
        "Hi, I am your Kyma assistant! You can ask me any question, and I will try to help you to the best of my abilities. While I don't have any initial suggestions for this resource, feel free to ask me anything you'd like!",
      )
      .should('be.visible');

    cy.get('@companion')
      .find('.bubbles-container')
      .should('not.exist');
  });

  it('companion remains functional after error of fetching initial suggestions', () => {
    cy.intercept('POST', '/backend/ai-chat/followup', req => {
      req.reply({
        delay: 100,
        body: {
          promptSuggestions: [],
        },
      });
    }).as('getFollowUpSuggestions');

    cy.get('.kyma-companion').as('companion');

    cy.testChatLength(1);

    cy.sendPrompt('Test');

    cy.testChatLength(2);

    cy.wait('@getChatResponse');

    cy.testChatLength(3);

    cy.closeCompanion();
  });
});
