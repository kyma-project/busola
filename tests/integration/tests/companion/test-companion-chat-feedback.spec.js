/// <reference types="cypress" />

context('Test Companion Chat Error Handling', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('KYMA_COMPANION', true);
    cy.loginAndSelectCluster();
  });

  beforeEach(() => {
    cy.mockPromptSuggestions();
    cy.intercept('POST', '/backend/ai-chat/messages', req => {
      const mockResponse =
        JSON.stringify({
          data: {
            answer: {
              content: 'Hello, this is an AI feedback response',
              next: '__end__',
              is_feedback: true,
            },
          },
        }) + '\n';

      req.reply({
        delay: 750,
        body: mockResponse,
      });
    }).as('getChatFeedbackResponse');
    cy.mockFollowups();
  });

  it('Feedback response handling', () => {
    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');
    cy.sendPrompt('Thanks');
    cy.wait('@getChatFeedbackResponse');

    cy.get('@companion')
      .find('ui5-illustrated-message[name="Survey"]')
      .contains('Tell us about your experience with Joule in Kyma dashboard')
      .should('be.visible')
      .get('ui5-button')
      .contains('Give Feedback')
      .should('be.visible');
  });

  it('No feedback displayed on non-final chunks', () => {
    cy.intercept('POST', '/backend/ai-chat/messages', req => {
      const mockResponse =
        JSON.stringify({
          data: {
            answer: {
              content: 'This is some preliminary response',
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
              next: 'SomeAgent',
              is_feedback: true,
            },
          },
        }) + '\n';

      req.reply({
        delay: 750,
        body: mockResponse,
      });
    }).as('getChatFeedbackResponse');

    cy.resetCompanion();

    cy.get('.kyma-companion').as('companion');
    cy.sendPrompt('Thanks');
    cy.wait('@getChatFeedbackResponse');

    cy.get('@companion')
      .find('ui5-illustrated-message[name="Survey"]')
      .should('not.exist');
  });
});
