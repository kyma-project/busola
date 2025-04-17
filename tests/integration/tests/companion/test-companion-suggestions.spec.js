/// <reference types="cypress" />

context('Test Companion Initial Suggestions', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('KYMA_COMPANION', true);
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails('default');
  });

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
        resourceName: 'default',
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
        resourceName: 'default',
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
        resourceName: 'default',
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
        namespace: 'default',
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
        resourceName: 'default',
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
        resourceName: 'default',
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
