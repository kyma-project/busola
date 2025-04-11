/* global cy */
import Bubbles from './Bubbles';

describe('Bubbles Component', () => {
  it('Displays a busy indicator when isLoading is true', () => {
    cy.mount(
      <Bubbles
        suggestions={undefined}
        isLoading={true}
        onClick={cy.stub().as('onClickStub')}
      />,
    );

    cy.get('.ai-busy-indicator').should('exist');
    cy.get('ui5-busy-indicator').should('have.attr', 'active');
    cy.get('ui5-busy-indicator').should('have.attr', 'size', 'M');
    cy.get('ui5-busy-indicator').should('have.attr', 'delay', '0');
  });

  it('Renders nothing when isLoading is false and suggestions is undefined', () => {
    cy.mount(
      <Bubbles
        suggestions={undefined}
        isLoading={false}
        onClick={cy.stub().as('onClickStub')}
      />,
    );

    cy.get('.bubbles-container').should('not.exist');
    cy.get('.ai-busy-indicator').should('not.exist');
  });

  it('Renders suggestion buttons when isLoading is false and suggestions are provided', () => {
    const suggestions = ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'];
    cy.mount(
      <Bubbles
        suggestions={suggestions}
        isLoading={false}
        onClick={cy.stub().as('onClickStub')}
      />,
    );

    cy.get('.bubbles-container').should('exist');
    cy.get('.bubble-button').should('have.length', suggestions.length);

    suggestions.forEach(suggestion => {
      cy.contains('.bubble-button', suggestion).should('exist');
    });
  });

  it('should call onClick function with correct suggestion when a button is clicked', () => {
    const suggestions = ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'];
    cy.mount(
      <Bubbles
        suggestions={suggestions}
        isLoading={false}
        onClick={cy.stub().as('onClickStub')}
      />,
    );

    cy.contains('.bubble-button', 'Suggestion 2').click();
    cy.get('@onClickStub').should('have.been.calledWith', 'Suggestion 2');
  });

  it('should handle suggestions as an empty array', () => {
    cy.mount(
      <Bubbles
        suggestions={[]}
        isLoading={false}
        onClick={cy.stub().as('onClickStub')}
      />,
    );

    cy.get('.bubbles-container').should('not.exist');
    cy.get('.bubble-button').should('not.exist');
  });

  it('should apply correct CSS classes to components', () => {
    const suggestions = ['Suggestion 1', 'Suggestion 2'];
    cy.mount(
      <Bubbles
        suggestions={suggestions}
        isLoading={false}
        onClick={cy.stub().as('onClickStub')}
      />,
    );

    cy.get('.bubbles-container').should('have.class', 'sap-margin-begin-tiny');
    cy.get('.bubbles-container').should('have.class', 'sap-margin-bottom-tiny');
    cy.get('.bubbles-container').should('have.css', 'flex-wrap', 'wrap');
    cy.get('.bubbles-container').should(
      'have.css',
      'justify-content',
      'flex-start',
    );

    cy.get('.bubble-button').each($btn => {
      cy.wrap($btn).should('have.attr', 'design', 'Default');
    });
  });
});
