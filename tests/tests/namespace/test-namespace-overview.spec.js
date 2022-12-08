/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

const LIMIT_NAME = `${Cypress.env('NAMESPACE_NAME')}-limits`;
const QUOTA_NAME = `${Cypress.env('NAMESPACE_NAME')}-quotas`;
const NEW_LIMIT_NAME = `new-limit`;

context(
  'Check the namespace overview for limit ranges and resourcequotas',
  () => {
    Cypress.skipAfterFail();

    before(() => {
      cy.loginAndSelectCluster();
      cy.goToNamespaceDetails();
    });

    it('Check sections of namespace details', () => {
      cy.contains('b', LIMIT_NAME).should('be.visible');

      cy.contains('b', QUOTA_NAME).should('be.visible');

      cy.contains('Healthy Resources').should('be.visible');

      cy.contains('Resource Consumption').should('be.visible');

      cy.contains('Events').should('be.visible');
    });

    it('Add a new limit range', () => {
      cy.contains('Create Limit Range').click();

      cy.wrap(loadFile('test-limit-ranges.yaml')).then(LR_CONFIG => {
        const LR = JSON.stringify(LR_CONFIG);
        cy.pasteToMonaco(LR);
      });

      cy.contains('button', /^Create$/).click();

      cy.contains('b', NEW_LIMIT_NAME).should('be.visible');
    });

    it('Check limit range', () => {
      cy.contains('1100Mi').should('be.visible');

      cy.contains('32Mi').should('be.visible');

      cy.contains('512Mi').should('be.visible');
    });

    it('Delete all limits and quotas', () => {
      cy.contains('.fd-table__row', LIMIT_NAME)
        .find('button[data-testid="delete"]')
        .click();

      cy.get('[data-testid="delete-confirmation"]').click();

      cy.contains('.fd-table__row', NEW_LIMIT_NAME)
        .find('button[data-testid="delete"]')
        .click();

      cy.get('[data-testid="delete-confirmation"]').click();

      cy.contains('.fd-table__row', QUOTA_NAME)
        .find('button[data-testid="delete"]')
        .click();

      cy.get('[data-testid="delete-confirmation"]').click();
    });

    it('Check if limit ranges and resource quota exist', () => {
      cy.contains('b', LIMIT_NAME).should('not.exist');

      cy.contains('b', NEW_LIMIT_NAME).should('not.exist');

      cy.contains('b', QUOTA_NAME).should('not.exist');
    });
  },
);
