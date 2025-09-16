/* global cy */
import NamespaceSettings from '../NamespaceSettings';

describe('NamespaceSettings', () => {
  it('Check ui5 switch checked', () => {
    cy.mount(<NamespaceSettings />);

    cy.get('ui5-switch').should('have.attr', 'checked');
  });
});
