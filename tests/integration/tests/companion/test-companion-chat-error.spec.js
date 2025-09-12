/// <reference types="cypress" />

context('Test Companion Chat Error Handling', () => {
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

  it('error handling of followups', () => {
    cy.intercept('POST', '/backend/ai-chat/followup', (req) => {
      req.reply({
        statusCode: 500,
        body: {
          error: 'Internal Server Error',
        },
      });
    }).as('getFollowUpSuggestions');

    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');
    cy.wait('@getPromptSuggestions');

    cy.clickSuggestion(0);

    cy.wait('@getChatResponse');
    cy.wait('@getFollowUpSuggestions');
    cy.wait(1000);

    cy.get('@companion')
      .find('.chat-list > .context-group')
      .should('have.length', 1)
      .eq(0)
      .find('.message-context > .message-container')
      .should('have.length', 3)
      .eq(2)
      .find('.message-error')
      .should('be.visible')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'No suggestions available')
      .find('ui5-icon[name="error"]')
      .should('be.visible');

    cy.sendPrompt('Test');

    cy.wait('@getChatResponse');
    cy.wait('@getFollowUpSuggestions');
    cy.wait(1000);

    cy.get('@companion')
      .find('.chat-list > .context-group')
      .should('have.length', 1)
      .eq(0)
      .find('.message-context > .message-container')
      .should('have.length', 5)
      .eq(2)
      .find('.message-error')
      .should('not.exist');
  });

  it('error handling of messages', () => {
    cy.intercept('POST', '/backend/ai-chat/messages', (req) => {
      req.reply({
        statusCode: 500,
        body: {
          error: 'Internal Server Error',
        },
      });
    }).as('getChatResponse');
    cy.get('.kyma-companion').as('companion');

    cy.resetCompanion();
    cy.wait('@getPromptSuggestions');
    cy.wait(1000);

    cy.sendPrompt('Test');

    cy.wait('@getChatResponse');

    cy.wait(4000);

    cy.testChatLength(3);

    cy.get('@companion')
      .find('.chat-list > .context-group')
      .eq(0)
      .find('.message-container')
      .should('contain.text', `Response status code is 500. Retrying 3/3.`);

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .should(
        'contain.text',
        `Couldn't fetch response from Joule because of network errors.`,
      )
      .should('be.visible')
      .find('ui5-button[design="Emphasized"]')
      .should('not.exist');

    cy.mockChatResponse();

    cy.sendPrompt('Test');

    cy.get('@companion').find('.message-error').should('have.length', 1);
    cy.get('@companion')
      .find('.chat-list > .context-group')
      .should('have.length', 1)
      .eq(0)
      .find('.message-context > .message-container')
      .should('have.length', 4)
      .eq(1)
      .find('.message-error')
      .should('be.visible')
      .should('have.class', 'right-aligned')
      .should('contain.text', 'An error occurred')
      .find('ui5-icon[name="error"]')
      .should('be.visible');

    cy.intercept('POST', '/backend/ai-chat/messages', (req) => {
      const mockResponse =
        JSON.stringify({
          data: {
            answer: {
              content: 'This is a custom error message',
              tasks: [
                {
                  task_id: 0,
                  task_name: 'Performing step 1',
                  status: 'error',
                  agent: 'agent1',
                },
              ],
              next: '__end__',
            },
            error: 'error',
          },
        }) + '\n';

      req.reply({
        delay: 100,
        body: mockResponse,
      });
    }).as('getChatResponse');
    cy.resetCompanion();
    cy.wait('@getPromptSuggestions');
    cy.wait(1000);

    cy.sendPrompt('Test');

    cy.wait('@getChatResponse');
    cy.wait(1000);

    cy.testChatLength(2);

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .should('contain.text', 'This is a custom error message')
      .should('be.visible')
      .find('ui5-button[design="Emphasized"]')
      .should('contain.text', 'Retry')
      .should('be.visible');

    cy.intercept('POST', '/backend/ai-chat/messages', (req) => {
      const mockResponse =
        JSON.stringify({
          data: {
            answer: {
              content: 'This is a custom error message',
              tasks: [
                {
                  task_id: 0,
                  task_name: 'Performing step 1',
                  status: 'error',
                  agent: 'agent1',
                },
                {
                  task_id: 1,
                  task_name: 'Performing step 2',
                  status: 'error',
                  agent: 'agent2',
                },
              ],
              next: '__end__',
            },
            error: null,
          },
        }) + '\n';

      req.reply({
        delay: 100,
        body: mockResponse,
      });
    }).as('getChatResponse');
    cy.resetCompanion();
    cy.wait('@getPromptSuggestions');
    cy.wait(1000);

    cy.sendPrompt('Test');

    cy.wait('@getChatResponse');
    cy.wait(1000);

    cy.testChatLength(2);

    cy.mockChatResponse();

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .should('contain.text', 'This is a custom error message')
      .should('be.visible')
      .find('ui5-button[design="Emphasized"]')
      .should('contain.text', 'Retry')
      .click();

    cy.wait('@getChatResponse').then((interception) => {
      expect(interception.request.body.query).to.equal('Test');
    });
    cy.wait(1000);

    cy.testChatLength(3);

    cy.get('@companion')
      .find('.chat-list > .context-group')
      .should('have.length', 1)
      .eq(0)
      .find('.message-context > .message-container')
      .eq(1)
      .should('be.visible')
      .should('have.class', 'message-container')
      .should('have.class', 'right-aligned')
      .should('contain.text', 'Test');

    cy.get('@companion')
      .find('.chat-list > *')
      .eq(1)
      .find('.message-context > .message-container')
      .eq(2)
      .should('be.visible')
      .should('have.class', 'left-aligned')
      .should('contain.text', 'Hello, this is an AI response');

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .should('not.exist');
  });

  it('check error status code handling message', () => {
    // Test for 401 Unauthorized.
    cy.intercept('POST', '/backend/ai-chat/messages', (req) => {
      req.reply({
        statusCode: 401,
        body: {
          error: 'Unauthorized',
          message: 'Authentication failed',
        },
      });
    }).as('getChatResponse');
    cy.get('.kyma-companion').as('companion');

    cy.resetCompanion();
    cy.wait('@getPromptSuggestions');
    cy.wait(1000);

    cy.sendPrompt('Test');

    cy.wait('@getChatResponse');

    cy.wait(4000);

    cy.testChatLength(3);

    cy.get('@companion')
      .find('.chat-list > .context-group')
      .eq(0)
      .find('.message-container')
      .should('contain.text', `Response status code is 401`);

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .find('ui5-title')
      .should('contain.text', `Unauthorized`)
      .should('be.visible');

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .should('contain.text', `Authentication failed`)
      .should('be.visible');

    // Test for 429 Too Many Requests.
    cy.intercept('POST', '/backend/ai-chat/messages', (req) => {
      req.reply({
        statusCode: 429,
        body: {
          error: 'Token usage limit exceeded',
          message:
            'To ensure fair usage, Joule controls the number of requests a cluster can make within 24 hours.',
        },
      });
    }).as('getChatResponse');
    cy.get('.kyma-companion').as('companion');

    cy.resetCompanion();
    cy.wait('@getPromptSuggestions');
    cy.wait(1000);

    cy.sendPrompt('Test');

    cy.wait('@getChatResponse');

    cy.wait(4000);

    cy.testChatLength(3);

    cy.get('@companion')
      .find('.chat-list > .context-group')
      .eq(0)
      .find('.message-container')
      .should('contain.text', `Response status code is 429`);

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .find('ui5-title')
      .should('contain.text', `Token usage limit exceeded`)
      .should('be.visible');

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .should(
        'contain.text',
        `To ensure fair usage, Joule controls the number of requests a cluster can make within 24 hours`,
      )
      .should('be.visible');

    // Test for 422 Validation error.
    cy.intercept('POST', '/backend/ai-chat/messages', (req) => {
      req.reply({
        statusCode: 422,
        body: {
          error: 'Validation error',
          message: 'Request validation failed',
        },
      });
    }).as('getChatResponse');
    cy.get('.kyma-companion').as('companion');

    cy.resetCompanion();
    cy.wait('@getPromptSuggestions');
    cy.wait(1000);

    cy.sendPrompt('Test');

    cy.wait('@getChatResponse');

    cy.wait(4000);

    cy.testChatLength(3);

    cy.get('@companion')
      .find('.chat-list > .context-group')
      .eq(0)
      .find('.message-container')
      .should('contain.text', `Response status code is 422`);

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .find('ui5-title')
      .should('contain.text', `Validation error`)
      .should('be.visible');

    cy.get('@companion')
      .find('.chat-list')
      .find('ui5-illustrated-message')
      .should('contain.text', `Request validation failed`)
      .should('be.visible');
  });

  it('error handling of partial AI task failures', () => {
    // Mock a response where some tasks succeed and some fail
    cy.intercept('POST', '/backend/ai-chat/messages', (req) => {
      const mockResponse =
        JSON.stringify({
          data: {
            answer: {
              content:
                'Here are the results, though some tasks encountered issues.',
              tasks: [
                {
                  task_id: 0,
                  task_name: 'Performing step 1',
                  status: 'completed',
                  agent: 'agent1',
                },
                {
                  task_id: 1,
                  task_name: 'Performing step 2',
                  status: 'error',
                  agent: 'agent2',
                },
                {
                  task_id: 2,
                  task_name: 'Performing step 3',
                  status: 'completed',
                  agent: 'agent3',
                },
                {
                  task_id: 3,
                  task_name: 'Performing step 4',
                  status: 'completed',
                  agent: 'agent4',
                },
              ],
              next: '__end__',
            },
            error: null,
          },
        }) + '\n';

      req.reply({
        delay: 100,
        body: mockResponse,
      });
    }).as('getChatResponse');

    cy.resetCompanion();
    cy.get('.kyma-companion').as('companion');
    cy.wait('@getPromptSuggestions');

    cy.sendPrompt('Test partial failure');

    cy.wait('@getChatResponse');
    cy.wait('@getFollowUpSuggestions');
    cy.wait(1000);

    // Verify the message content is being displayed despite partial failure
    cy.get('@companion')
      .find('.chat-list')
      .find('.message-container')
      .contains('Here are the results, though some tasks encountered issues.')
      .should('be.visible');

    // Verify the partial failure error message is displayed correctly
    cy.get('@companion')
      .find('.chat-list > .context-group')
      .should('have.length', 1)
      .eq(0)
      .find('.message-context > .message-container')
      .should('have.length', 3)
      .eq(2)
      .find('.message-error')
      .should('be.visible')
      .should('have.class', 'left-aligned')
      .should(
        'contain.text',
        'Some tasks encountered errors. The results might be incomplete or not fully actionable.',
      )
      .find('ui5-icon[name="error"]')
      .should('be.visible');

    // Verify follow-up suggestions are displayed despite the partial failure
    cy.get('@companion')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .should('be.visible');

    // Send another message to verify the error notice persists
    cy.mockChatResponse();
    cy.sendPrompt('Test');

    cy.wait('@getChatResponse');
    cy.wait('@getFollowUpSuggestions');
    cy.wait(1000);

    cy.get('@companion')
      .find('.message-context > .message-container')
      .should('have.length', 5)
      .eq(2)
      .find('.message-error')
      .should('exist');

    // Verify the partial failure error message is not displayed for regular responses
    cy.get('@companion')
      .find('.message-context > .message-container')
      .eq(4)
      .find('.message-error')
      .should('not.exist');
  });

  it('token count validation - warning and error', () => {
    const mockConfig = {
      data: {
        config: JSON.stringify({
          config: {
            features: {
              KYMA_COMPANION: {
                isEnabled: true,
                config: {
                  model: 'gpt-4.1',
                  queryMaxTokens: 8,
                },
              },
            },
          },
        }),
      },
    };

    const configRequest = {
      method: 'GET',
      url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
    };
    cy.intercept(configRequest, mockConfig);

    cy.reload();
    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');
    cy.wait('@getPromptSuggestions');

    // test valid token count & able to submit input
    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule..."]')
      .find('textarea')
      .should('be.visible')
      .type(`Test success!`);
    cy.wait(1000);

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule..."]')
      .should('have.attr', 'value-state', 'None');

    cy.get('@companion')
      .find('.query-input-actions > ui5-button[id="submit-icon"]')
      .should('not.be.disabled')
      .click();

    cy.wait('@getChatResponse');
    cy.get('@getChatResponse.all').should('have.length', 1);
    cy.wait('@getFollowUpSuggestions');
    cy.wait(1000);

    cy.get('@companion')
      .find('.chat-list')
      .find('.message-container')
      .contains('Test success!')
      .should('be.visible');

    // test warning threshold & able to submit input
    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule..."]')
      .find('textarea')
      .should('be.visible')
      .type(`This prompt will test the warning!`);
    cy.wait(1000);

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule..."]')
      .should('have.attr', 'value-state', 'Critical')
      .should('contain.text', 'Approaching per-query token limit');

    cy.get('@companion')
      .find('.query-input-actions > ui5-button[id="submit-icon"]')
      .should('not.be.disabled')
      .click();

    cy.wait('@getChatResponse');
    cy.get('@getChatResponse.all').should('have.length', 2);
    cy.wait('@getFollowUpSuggestions');
    cy.wait(1000);

    cy.get('@companion')
      .find('.chat-list')
      .find('.message-container')
      .contains('This prompt will test the warning!')
      .should('be.visible');

    // test error & NOT able to submit input
    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule..."]')
      .find('textarea')
      .should('be.visible')
      .type(
        `This prompt will exceed the token limit and cause an error indication!`,
      );
    cy.wait(1000);

    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule..."]')
      .should('have.attr', 'value-state', 'Negative')
      .should('contain.text', 'Message exceeds per-query token limit');

    cy.get('@companion')
      .find('.query-input-actions > ui5-button[id="submit-icon"]')
      .should('be.disabled');
    cy.get('@companion')
      .find('ui5-textarea[placeholder="Message Joule..."]')
      .find('textarea')
      .type(`{enter}`);

    cy.wait(1000);
    cy.get('@getChatResponse.all').should('have.length', 2);

    cy.get('@companion')
      .find('.chat-list')
      .find('.message-container')
      .contains(
        'This prompt will exceed the token limit and cause an error indication!',
      )
      .should('not.exist');
  });
});
