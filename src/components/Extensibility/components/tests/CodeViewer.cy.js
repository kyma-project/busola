/* global cy */
import { CodeViewer } from '../CodeViewer';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

describe('CodeViewer Component', () => {
  it('Renders CodeViewer component and detects yaml', () => {
    const value = {
      key: 'value',
    };

    const structure = {};

    cy.mount(<CodeViewer value={value} structure={structure} />);

    cy.contains('key: value').should('be.visible');
    cy.get('ui5-panel').should('have.length', 1);
  });

  it('Renders CodeViewer component with a predefined language', () => {
    const value = {
      key: 'value',
    };
    const structure = { language: 'json' };

    cy.mount(<CodeViewer value={value} structure={structure} />);

    cy.get('ui5-panel').should('have.length', 1);
    cy.get('.view-lines')
      .contains('{')
      .should('be.visible');
    cy.get('.view-lines')
      .contains('"key": "value"')
      .should('be.visible');
    cy.get('.view-lines')
      .contains('}')
      .should('be.visible');
  });

  it('Renders CodeViewer component without an empty value', () => {
    const value = null;
    const structure = {};

    cy.mount(<CodeViewer value={value} structure={structure} />);

    cy.contains('-').should('be.visible');
    cy.get('ui5-panel').should('have.length', 1);
  });
});
