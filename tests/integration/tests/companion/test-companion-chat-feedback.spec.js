/// <reference types="cypress" />

context('Test Companion Chat Error Handling', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('KYMA_COMPANION', true);
    cy.loginAndSelectCluster();
  });

  it('Feedback response handling', () => {
    cy.intercept('POST', '/backend/ai-chat/messages', req => {
      req.reply({
        delay: 750,
        body: {
          data: {
            answer: {
              content: 'Hello, this is an AI feedback response',
              next: '__end__',
              is_feedback: true,
            },
          },
        },
      });
    }).as('getChatFeedbackResponse');

    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');
    cy.sendPrompt('Thanks');
    cy.wait('@getChatFeedbackResponse');

    cy.get('@companion')
      .find('ui5-card')
      .contains('Tell us about your experience with Joule in Kyma dashboard')
      .should('be.visible')
      .get('ui5-button')
      .contains('Give Feedback')
      .should('be.visible');
  });
});
