/// <reference types="cypress" />
import 'cypress-file-upload';

const LIMIT_NAME = `${Cypress.env('NAMESPACE_NAME')}-limits`;
const QUOTA_NAME = `${Cypress.env('NAMESPACE_NAME')}-quotas`;
const NEW_LIMIT_NAME = `new-limit`;

context(
  'Check the namespace overview for limit ranges and resourcequotas',
  () => {
    before(() => {
      cy.loginAndSelectCluster();
      cy.goToNamespaceDetails();
    });

    it('Check sections of namespace details', () => {
      cy.getIframeBody()
        .contains('b', LIMIT_NAME, { timeout: 7000 })
        .should('be.visible');

      cy.getIframeBody()
        .contains('b', QUOTA_NAME, { timeout: 7000 })
        .should('be.visible');

      cy.getIframeBody()
        .contains('Healthy Resources')
        .should('be.visible');

      cy.getIframeBody()
        .contains('Resource Consumption')
        .should('be.visible');

      cy.getIframeBody()
        .contains('Events')
        .should('be.visible');
    });

    it('Add a new limit range', () => {
      cy.getIframeBody()
        .contains('Create Limit Range')
        .click();

      cy.getIframeBody()
        .find('[role="presentation"],[class="view-lines"]')
        .first()
        .click({ force: true })
        .type(
          `{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}{leftarrow}{leftarrow}${NEW_LIMIT_NAME}`,
        );

      cy.getIframeBody()
        .contains('button', /^Create$/)
        .click();

      cy.getIframeBody()
        .contains('b', NEW_LIMIT_NAME, { timeout: 7000 })
        .should('be.visible');
    });

    it('Delete all limits and quotas', () => {
      cy.getIframeBody()
        .contains('.fd-table__row', LIMIT_NAME)
        .find('button[data-testid="delete"]')
        .click();

      cy.getIframeBody()
        .find('[data-testid="delete-confirmation"]')
        .click();

      cy.getIframeBody()
        .contains('.fd-table__row', NEW_LIMIT_NAME)
        .find('button[data-testid="delete"]')
        .click();

      cy.getIframeBody()
        .find('[data-testid="delete-confirmation"]', { timeout: 5000 })
        .click();

      cy.getIframeBody()
        .contains('.fd-table__row', QUOTA_NAME)
        .find('button[data-testid="delete"]')
        .click();

      cy.getIframeBody()
        .find('[data-testid="delete-confirmation"]', { timeout: 5000 })
        .click();
    });

    it('Check if limit ranges and resource quota exist', () => {
      cy.getIframeBody()
        .contains('b', LIMIT_NAME)
        .should('not.exist');

      cy.getIframeBody()
        .contains('b', NEW_LIMIT_NAME)
        .should('not.exist');

      cy.getIframeBody()
        .contains('b', QUOTA_NAME)
        .should('not.exist');
    });
  },
);
