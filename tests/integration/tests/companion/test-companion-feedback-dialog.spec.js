/// <reference types="cypress" />

context('Test Companion Feedback Dialog', () => {
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
              content: 'This is some response',
              next: '__end__',
            },
          },
        }) + '\n';

      req.reply({
        delay: 750,
        body: mockResponse,
      });
    }).as('getChatFeedbackResponse');

    cy.mockFollowups();
    cy.clearLocalStorage();
  });

  it('Feedback dialog dismissal writes correct value to localStorage', () => {
    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');

    for (let i = 0; i < 5; i++) {
      cy.sendPrompt('Test');
      cy.wait('@getChatFeedbackResponse');
    }

    cy.get('.kyma-companion')
      .as('companion')
      .get('ui5-button[tooltip="Close"]')
      .click()
      .wait(500);

    cy.get('ui5-dialog[header-text="Joule Feedback"]')
      .find('ui5-button[design="Default"]')
      .contains('Close')
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);
    cy.window().then(win => {
      expect(win.localStorage.getItem('show-feedback-status')).to.eq(
        'DISMISSED_ONCE',
      );
    });
  });

  it('Second feedback dialog dismissal writes correct value to localStorage', () => {
    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');

    for (let i = 0; i < 5; i++) {
      cy.sendPrompt('Test');
      cy.wait('@getChatFeedbackResponse');
    }

    cy.get('.kyma-companion')
      .as('companion')
      .get('ui5-button[tooltip="Close"]')
      .click()
      .wait(500);

    cy.get('ui5-dialog[header-text="Joule Feedback"]')
      .find('ui5-button[design="Default"]')
      .contains('Close')
      .click({ force: true });

    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');

    for (let i = 0; i < 5; i++) {
      cy.sendPrompt('Test');
      cy.wait('@getChatFeedbackResponse');
    }

    cy.get('.kyma-companion')
      .as('companion')
      .get('ui5-button[tooltip="Close"]')
      .click()
      .wait(500);

    cy.get('ui5-dialog[header-text="Joule Feedback"]')
      .find('ui5-button[design="Default"]')
      .contains('Close')
      .click({ force: true });

    cy.wait(1000);
    cy.window().then(win => {
      expect(win.localStorage.getItem('show-feedback-status')).to.eq('NO_SHOW');
    });
  });

  it('Opening feedback survey writes correct value to localStorage', () => {
    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');

    for (let i = 0; i < 5; i++) {
      cy.sendPrompt('Test');
      cy.wait('@getChatFeedbackResponse');
    }

    cy.get('.kyma-companion')
      .as('companion')
      .get('ui5-button[tooltip="Close"]')
      .click()
      .wait(500);

    cy.get('ui5-dialog[header-text="Joule Feedback"]')
      .should('be.visible')
      .find('ui5-button[accessible-name="Give Feedback"]')
      .should('be.visible')
      .click({ force: true });

    cy.wait(1000);
    cy.window().then(win => {
      expect(win.localStorage.getItem('show-feedback-status')).to.eq('NO_SHOW');
    });
  });

  it('Dialog is not displayed when localStorage key "show-feedback-status" value is "NO_SHOW"', () => {
    window.localStorage.setItem('show-feedback-status', 'NO_SHOW');
    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');

    for (let i = 0; i < 5; i++) {
      cy.sendPrompt('Test');
      cy.wait('@getChatFeedbackResponse');
    }

    cy.get('.kyma-companion')
      .as('companion')
      .get('ui5-button[tooltip="Close"]')
      .click()
      .wait(500);

    cy.get('ui5-dialog[header-text="Joule Feedback"]').should('not.exist');
  });

  it('Dialog is displayed when there is localStorage key "show-feedback-status" value of "DISMISSED_ONCE', () => {
    window.localStorage.setItem('show-feedback-status', 'DISMISSED_ONCE');
    cy.openCompanion();
    cy.get('.kyma-companion').as('companion');

    for (let i = 0; i < 5; i++) {
      cy.sendPrompt('Test');
      cy.wait('@getChatFeedbackResponse');
    }

    cy.get('.kyma-companion')
      .as('companion')
      .get('ui5-button[tooltip="Close"]')
      .click()
      .wait(500);

    cy.get('ui5-dialog[header-text="Joule Feedback"]').should('be.visible');
  });
});
