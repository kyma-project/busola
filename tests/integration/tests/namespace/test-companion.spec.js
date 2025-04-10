/// <reference types="cypress" />

context('Test Companion', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('correctly updates initial suggestions', () => {
    let callCount = 0;
    cy.intercept('POST', '/backend/ai-chat/suggestions', req => {
      callCount++;
      req.reply({
        delay: 1000,
        body: {
          promptSuggestions: [
            `suggestion${callCount}.1`,
            `suggestion${callCount}.2`,
            `suggestion${callCount}.3`,
            `suggestion${callCount}.4`,
            `suggestion${callCount}.5`,
          ],
          conversationId: '0123456789',
        },
      });
    }).as('getInitialSuggestions');

    cy.get('ui5-shellbar')
      .find('ui5-button[icon="da"]')
      .should('be.visible')
      .click();

    cy.get('.kyma-companion').as('companion');

    cy.get('@companion')
      .find('.chat-list')
      .find('.bubbles-container')
      .should('not.exist');
    cy.get('@companion')
      .find('.chat-list')
      .find('.suggestions-loading-indicator')
      .should('be.visible');

    cy.wait('@getInitialSuggestions');

    cy.get('@companion')
      .find('.chat-list')
      .find('.suggestions-loading-indicator')
      .should('not.exist');
    cy.get('@companion')
      .find('.chat-list')
      .find('.bubbles-container')
      .should('be.visible')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .each((button, index) => {
        cy.wrap(button)
          .should('contain.text', `suggestion1.${index + 1}`)
          .should('be.visible');
      });

    cy.get('@companion')
      .find('.kyma-companion__header')
      .find('ui5-button[tooltip="Reset"]')
      .should('be.visible')
      .click();

    cy.get('@companion')
      .find('.chat-list')
      .find('.bubbles-container')
      .should('not.exist');
    cy.get('@companion')
      .find('.chat-list')
      .find('.suggestions-loading-indicator')
      .should('be.visible');

    cy.wait('@getInitialSuggestions');

    cy.get('@companion')
      .find('.chat-list')
      .find('.suggestions-loading-indicator')
      .should('not.exist');
    cy.get('@companion')
      .find('.chat-list')
      .find('.bubbles-container')
      .should('be.visible')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .each((button, index) => {
        cy.wrap(button)
          .should('contain.text', `suggestion2.${index + 1}`)
          .should('be.visible');
      });

    cy.navigateTo('Workloads', 'Deployments');

    cy.get('@companion')
      .find('.chat-list')
      .find('.bubbles-container')
      .should('not.exist');
    cy.get('@companion')
      .find('.chat-list')
      .find('.suggestions-loading-indicator')
      .should('be.visible');

    cy.wait('@getInitialSuggestions');

    cy.get('@companion')
      .find('.chat-list')
      .find('.suggestions-loading-indicator')
      .should('not.exist');
    cy.get('@companion')
      .find('.chat-list')
      .find('.bubbles-container')
      .should('be.visible')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .each((button, index) => {
        cy.wrap(button)
          .should('contain.text', `suggestion3.${index + 1}`)
          .should('be.visible');
      });

    cy.go('back');

    cy.get('@companion')
      .find('.chat-list')
      .find('.bubbles-container')
      .should('not.exist');
    cy.get('@companion')
      .find('.chat-list')
      .find('.suggestions-loading-indicator')
      .should('be.visible');

    cy.wait('@getInitialSuggestions');

    cy.get('@companion')
      .find('.chat-list')
      .find('.suggestions-loading-indicator')
      .should('not.exist');
    cy.get('@companion')
      .find('.chat-list')
      .find('.bubbles-container')
      .should('be.visible')
      .find('ui5-button.bubble-button')
      .should('have.length', 5)
      .each((button, index) => {
        cy.wrap(button)
          .should('contain.text', `suggestion4.${index + 1}`)
          .should('be.visible');
      });
  });

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
    cy.wait(500);

    cy.get('@shellbar')
      .find('ui5-button[icon="da"]')
      .should('not.exist');
  });
});
