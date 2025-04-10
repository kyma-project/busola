/// <reference types="cypress" />

context('Test Companion', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  describe('initial suggestions behavior', () => {
    let callCount = 0;

    beforeEach(() => {
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
            conversationId: `id-${callCount}`,
          },
        });
      }).as('getPromptSuggestions');

      cy.intercept('POST', '/backend/ai-chat/messages', req => {
        req.reply({
          delay: 100,
          body: {
            data: {
              answer: {
                content: 'Hello, this is a user message',
                next: '__end__',
              },
            },
          },
        });
      }).as('getChatResponse');

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
      cy.get('ui5-shellbar')
        .find('ui5-button[icon="da"]')
        .should('be.visible')
        .click();

      cy.get('.kyma-companion').as('companion');

      cy.get('@companion')
        .find('.suggestions-loading-indicator')
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
          cy.wrap(button).should('contain.text', `suggestion1.${index + 1}`);
        });

      cy.get('@companion')
        .find('.bubbles-container')
        .find('ui5-button.bubble-button')
        .eq(0)
        .click();

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
      cy.get('@companion')
        .find('ui5-button[tooltip="Reset"]')
        .click();

      cy.get('@companion')
        .find('.suggestions-loading-indicator')
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
          cy.wrap(button).should('contain.text', `suggestion2.${index + 1}`);
        });
    });

    it('updates suggestions when navigating to Deployments', () => {
      cy.get('.kyma-companion').as('companion');
      cy.navigateTo('Workloads', 'Deployments');

      cy.get('@companion')
        .find('.suggestions-loading-indicator')
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
          cy.wrap(button).should('contain.text', `suggestion3.${index + 1}`);
        });
    });

    it('updates suggestions again when navigating back to Namespace', () => {
      cy.get('.kyma-companion').as('companion');
      cy.go('back');

      cy.get('@companion')
        .find('.suggestions-loading-indicator')
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
          cy.wrap(button).should('contain.text', `suggestion4.${index + 1}`);
        });
    });

    it('does not update suggestions if conversation has started, uses up-to-date sessionID', () => {
      cy.get('.kyma-companion').as('companion');
      cy.get('@companion')
        .find('.bubbles-container')
        .find('ui5-button.bubble-button')
        .eq(0)
        .click();

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
        .find('.suggestions-loading-indicator')
        .should('not.exist');

      cy.get('@companion')
        .find('.bubbles-container')
        .should('not.exist');

      cy.wrap(callCount).should('equal', 4);
    });
  });

  describe('initial suggestions behavior', () => {
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
});
