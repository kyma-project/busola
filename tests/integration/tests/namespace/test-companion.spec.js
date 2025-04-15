/// <reference types="cypress" />

context('Test Companion', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('KYMA_COMPANION', true);
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  describe('initial suggestions behavior', () => {
    let callCount = 0;

    beforeEach(() => {
      cy.intercept('POST', '/backend/ai-chat/suggestions', req => {
        callCount++;
        req.reply({
          delay: 500,
          body: {
            promptSuggestions: [
              `suggestion${callCount}.1`,
              `suggestion${callCount}.2`,
              `suggestion${callCount}.3`,
              `suggestion${callCount}.4`,
              `suggestion${callCount}.5`,
            ],
            conversationId: `id-${callCount}`,
          },
        });
      }).as('getPromptSuggestions');

      cy.mockChatResponse();

      cy.intercept('POST', '/backend/ai-chat/followup', req => {
        req.reply({
          delay: 100,
          body: {
            promptSuggestions: [],
          },
        });
      }).as('getFollowUpSuggestions');
    });

    it('loads initial suggestions and sessionID correctly', () => {
      cy.openCompanion();
      cy.get('.kyma-companion').as('companion');

      cy.get('@companion')
        .find('.ai-busy-indicator')
        .should('be.visible');

      cy.wait('@getPromptSuggestions').then(interception => {
        expect(interception.request.body).to.deep.equal({
          resourceName: Cypress.env('NAMESPACE_NAME'),
          resourceType: 'Namespace',
          groupVersion: 'v1',
          namespace: '',
        });
      });

      cy.get('@companion')
        .find('.bubbles-container')
        .find('ui5-button.bubble-button')
        .should('have.length', 5)
        .each((button, index) => {
          cy.wrap(button)
            .should('be.visible')
            .should('contain.text', `suggestion1.${index + 1}`);
        });

      cy.clickSuggestion(0);

      cy.wait('@getChatResponse').then(interception => {
        expect(interception.request.body).to.deep.equal({
          resourceName: Cypress.env('NAMESPACE_NAME'),
          resourceType: 'Namespace',
          groupVersion: 'v1',
          namespace: '',
          query: 'suggestion1.1',
        });
        expect(interception.request.headers['session-id']).to.equal('id-1');
      });
    });

    it('reloads suggestions after reset', () => {
      cy.get('.kyma-companion').as('companion');
      cy.resetCompanion();

      cy.get('@companion')
        .find('.ai-busy-indicator')
        .should('be.visible');

      cy.wait('@getPromptSuggestions').then(interception => {
        expect(interception.request.body).to.deep.equal({
          resourceName: Cypress.env('NAMESPACE_NAME'),
          resourceType: 'Namespace',
          groupVersion: 'v1',
          namespace: '',
        });
      });

      cy.get('@companion')
        .find('.bubbles-container')
        .find('ui5-button.bubble-button')
        .should('have.length', 5)
        .each((button, index) => {
          cy.wrap(button)
            .should('be.visible')
            .should('contain.text', `suggestion2.${index + 1}`);
        });
    });

    it('updates suggestions when navigating to Deployments', () => {
      cy.get('.kyma-companion').as('companion');
      cy.navigateTo('Workloads', 'Deployments');

      cy.get('@companion')
        .find('.ai-busy-indicator')
        .should('be.visible');

      cy.wait('@getPromptSuggestions').then(interception => {
        expect(interception.request.body).to.deep.equal({
          resourceName: '',
          resourceType: 'Deployment',
          groupVersion: 'apps/v1',
          namespace: Cypress.env('NAMESPACE_NAME'),
        });
      });

      cy.get('@companion')
        .find('.bubbles-container')
        .find('ui5-button.bubble-button')
        .should('have.length', 5)
        .each((button, index) => {
          cy.wrap(button)
            .should('be.visible')
            .should('contain.text', `suggestion3.${index + 1}`);
        });
    });

    it('updates suggestions again when navigating back to Namespace', () => {
      cy.get('.kyma-companion').as('companion');
      cy.go('back');

      cy.get('@companion')
        .find('.ai-busy-indicator')
        .should('be.visible');

      cy.wait('@getPromptSuggestions').then(interception => {
        expect(interception.request.body).to.deep.equal({
          resourceName: Cypress.env('NAMESPACE_NAME'),
          resourceType: 'Namespace',
          groupVersion: 'v1',
          namespace: '',
        });
      });

      cy.get('@companion')
        .find('.bubbles-container')
        .find('ui5-button.bubble-button')
        .should('have.length', 5)
        .each((button, index) => {
          cy.wrap(button)
            .should('be.visible')
            .should('contain.text', `suggestion4.${index + 1}`);
        });
    });

    it('does not update suggestions if conversation has started, uses up-to-date sessionID', () => {
      cy.get('.kyma-companion').as('companion');
      cy.clickSuggestion(0);

      cy.wait('@getChatResponse').then(interception => {
        expect(interception.request.body).to.deep.equal({
          resourceName: Cypress.env('NAMESPACE_NAME'),
          resourceType: 'Namespace',
          groupVersion: 'v1',
          namespace: '',
          query: 'suggestion4.1',
        });
        expect(interception.request.headers['session-id']).to.equal('id-4');
      });

      cy.navigateTo('Workloads', 'Deployments');

      cy.get('@companion')
        .find('.ai-busy-indicator')
        .should('not.exist');

      cy.get('@companion')
        .find('.bubbles-container')
        .should('not.exist');

      cy.wrap(callCount).should('equal', 4);
    });
  });

  describe('error handling of initial suggestions', () => {
    it('default introductory message remains the same after suggestions are fetched', () => {
      cy.mockPromptSuggestions();
      cy.closeCompanion();
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
      cy.mockChatResponse();
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

  describe('default chat behavior', () => {
    it('core chat functionality works correctly', () => {
      cy.mockPromptSuggestions();
      cy.mockChatResponse();
      cy.mockFollowups();

      cy.navigateTo('Namespace Overview');
      cy.get('ui5-dynamic-page-title')
        .contains(Cypress.env('NAMESPACE_NAME'))
        .should('be.visible');

      cy.openCompanion();
      cy.get('.kyma-companion').as('companion');

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
        .should('be.visible')
        .should('have.class', 'ai-busy-indicator');

      cy.wait('@getPromptSuggestions').then(interception => {
        expect(interception.request.body).to.deep.equal({
          resourceName: Cypress.env('NAMESPACE_NAME'),
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
          resourceName: Cypress.env('NAMESPACE_NAME'),
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
        .eq(2)
        .should('be.visible')
        .should('have.class', 'left-aligned')
        .should('contain.text', 'Hello, this is an AI response');

      cy.get('@companion')
        .find('.chat-list > *')
        .should('have.length', 4)
        .eq(3)
        .should('be.visible')
        .should('have.class', 'ai-busy-indicator');

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
          resourceName: Cypress.env('NAMESPACE_NAME'),
          resourceType: 'Namespace',
          groupVersion: 'v1',
          namespace: '',
          query: 'followup3',
        });
        expect(interception.request.headers['session-id']).to.equal('test-id');
      });
      cy.wait(1000);

      cy.get('@companion')
        .find('.chat-list > *')
        .should('have.length', 6)
        .eq(4)
        .should('be.visible')
        .should('have.class', 'left-aligned')
        .should('contain.text', 'Hello, this is an AI response');

      cy.get('@companion')
        .find('.chat-list > *')
        .should('have.length', 6)
        .eq(5)
        .should('be.visible')
        .should('have.class', 'ai-busy-indicator');

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
      cy.mockChatResponse();
      cy.mockFollowups();
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
      cy.mockChatResponse();
      cy.mockFollowups();
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
          namespace: Cypress.env('NAMESPACE_NAME'),
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
        .should('have.length', 2)
        .eq(0)
        .should('be.visible')
        .should('have.class', 'message-container')
        .should('have.class', 'left-aligned')
        .should('contain.text', 'Hi, I am your Kyma assistant!');

      cy.get('@companion')
        .find('.chat-list > *')
        .eq(1)
        .should('be.visible')
        .should('have.class', 'ai-busy-indicator');

      cy.wait('@getPromptSuggestions').then(interception => {
        expect(interception.request.body).to.deep.equal({
          resourceName: '',
          resourceType: 'ServiceAccount',
          groupVersion: 'v1',
          namespace: Cypress.env('NAMESPACE_NAME'),
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
      cy.mockPromptSuggestions();
      cy.mockChatResponse();
      cy.mockFollowups();

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
      cy.wait(1000);

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

  describe('streaming behavior', () => {
    it('two pending tasks', () => {
      cy.mockPromptSuggestions();
      cy.intercept('POST', '/backend/ai-chat/messages', req => {
        req.reply({
          delay: 500,
          body: {
            event: 'agent_action',
            data: {
              answer: {
                content: '',
                tasks: [
                  {
                    task_id: 0,
                    task_name: 'Performing step 1',
                    status: 'pending',
                    agent: 'agent1',
                  },
                  {
                    task_id: 1,
                    task_name: 'Performing step 2',
                    status: 'pending',
                    agent: 'agent2',
                  },
                ],
                next: 'agent1',
              },
            },
          },
        });
      }).as('getChatResponse');
      let followupCallCount = 0;
      cy.intercept('POST', '/backend/ai-chat/followup', req => {
        followupCallCount++;
        req.reply({
          delay: 500,
          body: {
            promptSuggestions: ['followup1', 'followup2', 'followup3'],
          },
        });
      }).as('getFollowUpSuggestions');
      cy.get('.kyma-companion').as('companion');

      cy.clickSuggestion(0);

      cy.get('@companion')
        .find('.tasks-list')
        .find('.ai-busy-indicator')
        .should('be.visible');

      cy.wait('@getChatResponse');
      cy.wait(1000);

      cy.get('@companion')
        .find('.tasks-list')
        .find('.ai-busy-indicator')
        .should('not.exist');

      cy.get('@companion')
        .find('.tasks-list > .loading-item')
        .should('have.length', 2)
        .each((task, index) => {
          cy.wrap(task)
            .should('be.visible')
            .should('contain.text', `Performing step ${index + 1}`)
            .find('.ai-steps-loader')
            .should('be.visible');
        });

      cy.wrap(followupCallCount).should('eq', 0);

      cy.closeCompanion();
      cy.openCompanion();

      cy.wait('@getPromptSuggestions');
      cy.wait(1000);
    });

    it('one pending task, one completed task', () => {
      cy.mockPromptSuggestions();
      cy.intercept('POST', '/backend/ai-chat/messages', req => {
        req.reply({
          delay: 500,
          body: {
            event: 'agent_action',
            data: {
              answer: {
                content: '',
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
                    status: 'pending',
                    agent: 'agent2',
                  },
                ],
                next: 'agent2',
              },
            },
          },
        });
      }).as('getChatResponse');
      let followupCallCount = 0;
      cy.intercept('POST', '/backend/ai-chat/followup', req => {
        followupCallCount++;
        req.reply({
          delay: 500,
          body: {
            promptSuggestions: ['followup1', 'followup2', 'followup3'],
          },
        });
      }).as('getFollowUpSuggestions');
      cy.get('.kyma-companion').as('companion');

      cy.clickSuggestion(0);

      cy.get('@companion')
        .find('.tasks-list')
        .find('.ai-busy-indicator')
        .should('be.visible');

      cy.wait('@getChatResponse');
      cy.wait(1000);

      cy.get('@companion')
        .find('.tasks-list')
        .find('.ai-busy-indicator')
        .should('not.exist');

      cy.get('@companion')
        .find('.tasks-list > .loading-item')
        .should('have.length', 2)
        .eq(0)
        .should('contain.text', `Performing step 1`)
        .find('div')
        .should('exist')
        .and('have.attr', 'class')
        .and('match', /objectStatus.*positive.*large/);

      cy.get('@companion')
        .find('.tasks-list > .loading-item')
        .eq(1)
        .should('be.visible')
        .should('contain.text', `Performing step 2`)
        .find('.ai-steps-loader')
        .should('be.visible');

      cy.wrap(followupCallCount).should('eq', 0);

      cy.closeCompanion();
      cy.openCompanion();

      cy.wait('@getPromptSuggestions');
      cy.wait(1000);
    });

    it('two completed tasks', () => {
      cy.mockPromptSuggestions();
      cy.intercept('POST', '/backend/ai-chat/messages', req => {
        req.reply({
          delay: 500,
          body: {
            event: 'agent_action',
            data: {
              answer: {
                content: '',
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
                    status: 'completed',
                    agent: 'agent2',
                  },
                ],
                next: 'agent2',
              },
            },
          },
        });
      }).as('getChatResponse');
      let followupCallCount = 0;
      cy.intercept('POST', '/backend/ai-chat/followup', req => {
        followupCallCount++;
        req.reply({
          delay: 500,
          body: {
            promptSuggestions: ['followup1', 'followup2', 'followup3'],
          },
        });
      }).as('getFollowUpSuggestions');
      cy.get('.kyma-companion').as('companion');

      cy.clickSuggestion(0);

      cy.get('@companion')
        .find('.tasks-list')
        .find('.ai-busy-indicator')
        .should('be.visible');

      cy.wait('@getChatResponse');
      cy.wait(1000);

      cy.get('@companion')
        .find('.tasks-list')
        .find('.ai-busy-indicator')
        .should('not.exist');

      cy.get('@companion')
        .find('.tasks-list > .loading-item')
        .should('have.length', 3)
        .eq(0)
        .should('contain.text', `Performing step 1`)
        .find('div')
        .should('exist')
        .and('have.attr', 'class')
        .and('match', /objectStatus.*positive.*large/);

      cy.get('@companion')
        .find('.tasks-list > .loading-item')
        .eq(1)
        .should('contain.text', `Performing step 2`)
        .find('div')
        .should('exist')
        .and('have.attr', 'class')
        .and('match', /objectStatus.*positive.*large/);

      cy.get('@companion')
        .find('.tasks-list > .loading-item')
        .eq(2)
        .should('be.visible')
        .should('contain.text', `Preparing the final answer`)
        .find('.ai-steps-loader')
        .should('be.visible');

      cy.wrap(followupCallCount).should('eq', 0);
    });
  });

  describe('error handling of messages and followups', () => {
    it('error handling of followups', () => {
      cy.mockPromptSuggestions();
      cy.mockChatResponse();
      cy.intercept('POST', '/backend/ai-chat/followup', req => {
        req.reply({
          statusCode: 500,
          body: {
            error: 'Internal Server Error',
          },
        });
      }).as('getFollowUpSuggestions');
      cy.get('.kyma-companion').as('companion');

      cy.closeCompanion();
      cy.openCompanion();
      cy.wait('@getPromptSuggestions');

      cy.clickSuggestion(0);

      cy.wait('@getChatResponse');
      cy.wait('@getFollowUpSuggestions');
      cy.wait(1000);

      cy.get('@companion')
        .find('.chat-list > .message-container')
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
        .find('.chat-list > .message-container')
        .should('have.length', 5)
        .eq(2)
        .find('.message-error')
        .should('not.exist');
    });

    it('error handling of messages', () => {
      cy.mockPromptSuggestions();
      cy.intercept('POST', '/backend/ai-chat/messages', req => {
        req.reply({
          statusCode: 500,
          body: {
            error: 'Internal Server Error',
          },
        });
      }).as('getChatResponse');
      cy.mockFollowups();
      cy.get('.kyma-companion').as('companion');

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
        .should(
          'contain.text',
          'A temporary interruption occured. Please try again.',
        )
        .should('be.visible')
        .find('ui5-button[design="Emphasized"]')
        .should('not.exist');

      cy.mockChatResponse();

      cy.sendPrompt('Test');

      cy.get('@companion')
        .find('.message-error')
        .should('have.length', 1);
      cy.get('@companion')
        .find('.chat-list > .message-container')
        .should('have.length', 4)
        .eq(1)
        .find('.message-error')
        .should('be.visible')
        .should('have.class', 'right-aligned')
        .should('contain.text', 'An error occurred')
        .find('ui5-icon[name="error"]')
        .should('be.visible');

      cy.intercept('POST', '/backend/ai-chat/messages', req => {
        req.reply({
          delay: 100,
          body: {
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
          },
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

      cy.intercept('POST', '/backend/ai-chat/messages', req => {
        req.reply({
          delay: 100,
          body: {
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
          },
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

      cy.wait('@getChatResponse').then(interception => {
        expect(interception.request.body.query).to.equal('Test');
      });
      cy.wait(1000);

      cy.testChatLength(3);

      cy.get('@companion')
        .find('.chat-list > .message-container')
        .eq(1)
        .should('be.visible')
        .should('have.class', 'message-container')
        .should('have.class', 'right-aligned')
        .should('contain.text', 'Test');

      cy.get('@companion')
        .find('.chat-list > *')
        .eq(2)
        .should('be.visible')
        .should('have.class', 'left-aligned')
        .should('contain.text', 'Hello, this is an AI response');

      cy.get('@companion')
        .find('.chat-list')
        .find('ui5-illustrated-message')
        .should('not.exist');
    });
  });

  describe('fullscreen button', () => {
    it('enters fullscreen correctly', () => {
      cy.get('.kyma-companion').as('companion');

      cy.navigateTo('Namespace Overview');

      cy.get('ui5-dynamic-page-title')
        .contains(Cypress.env('NAMESPACE_NAME'))
        .should('be.visible');
      cy.get('#companion_wrapper')
        .parent()
        .should('have.css', 'flex-basis', '30%');

      cy.get('@companion')
        .find('ui5-button[icon="full-screen"]')
        .click();

      cy.get('ui5-dynamic-page-title')
        .contains(Cypress.env('NAMESPACE_NAME'))
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

      cy.get('ui5-dynamic-page-title')
        .contains(Cypress.env('NAMESPACE_NAME'))
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
