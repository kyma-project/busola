/* global cy */
import { t } from 'i18next';
import ErrorMessage from './ErrorMessage';
import '@ui5/webcomponents-fiori/dist/illustrations/Connection.js';

describe('ErrorMessage Component', () => {
  it('renders the error message correctly with custom message and without retry button', () => {
    const errorMessage = 'Something went wrong with the connection';

    cy.mount(
      <ErrorMessage
        errorMessage={errorMessage}
        displayRetry={false}
        retryPrompt={cy.stub().as('retryStub')}
      />,
    );

    cy.get('ui5-card').should('exist');
    cy.get('ui5-illustrated-message').should('exist');
    cy.get('ui5-illustrated-message').should('have.attr', 'name', 'Connection');
    cy.get('ui5-illustrated-message').should('have.attr', 'design', 'Spot');
    cy.get('ui5-illustrated-message').should(
      'have.attr',
      'title-text',
      t('kyma-companion.error.title'),
    );

    cy.contains(errorMessage).should('exist');
    cy.get('ui5-button').should('not.exist');
  });

  it('displays the retry button correctly when displayRetry is true', () => {
    const errorMessage = 'Network error occurred';

    cy.mount(
      <ErrorMessage
        errorMessage={errorMessage}
        displayRetry={true}
        retryPrompt={cy.stub().as('retryStub')}
      />,
    );

    cy.get('ui5-button').should('exist');
    cy.get('ui5-button').should('have.text', t('common.buttons.retry'));
    cy.get('ui5-button').should('have.attr', 'design', 'Emphasized');
    cy.get('ui5-button').should('have.class', 'sap-margin-bottom-tiny');
  });

  it('calls retryPrompt function when retry button is clicked', () => {
    const errorMessage = 'Failed to load data';

    cy.mount(
      <ErrorMessage
        errorMessage={errorMessage}
        displayRetry={true}
        retryPrompt={cy.stub().as('retryStub')}
      />,
    );

    // Click the retry button and check that the retryPrompt function was called
    cy.get('ui5-button').click();
    cy.get('@retryStub').should('have.been.calledOnce');
  });

  it('displays different error messages correctly', () => {
    const errorMessage1 = 'Error message 1';
    const errorMessage2 = 'A different error occurred';

    // Mount with first error message
    cy.mount(
      <ErrorMessage
        errorMessage={errorMessage1}
        displayRetry={false}
        retryPrompt={cy.stub()}
      />,
    );

    cy.contains(errorMessage1).should('exist');
    cy.contains(errorMessage2).should('not.exist');

    // Re-mount with second error message
    cy.mount(
      <ErrorMessage
        errorMessage={errorMessage2}
        displayRetry={false}
        retryPrompt={cy.stub()}
      />,
    );

    cy.contains(errorMessage1).should('not.exist');
    cy.contains(errorMessage2).should('exist');
  });

  it('handles long error messages', () => {
    const longErrorMessage =
      'This is a very long error message that describes in detail what went wrong with the application. It provides comprehensive information about the error that occurred and potentially how to fix it or what the user should do next.';

    cy.mount(
      <ErrorMessage
        errorMessage={longErrorMessage}
        displayRetry={true}
        retryPrompt={cy.stub()}
      />,
    );

    cy.contains(longErrorMessage).should('exist');
  });
});
