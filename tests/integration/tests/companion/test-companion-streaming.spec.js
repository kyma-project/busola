/// <reference types="cypress" />

context('Test Companion Streaming Behavior', () => {
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

  it('two pending tasks', () => {
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

    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');
    cy.wait('@getPromptSuggestions');

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
