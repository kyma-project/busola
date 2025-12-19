/* global cy, describe, it */
import { Labels } from '../Labels';

describe('<Labels />', () => {
  it('renders', () => {
    cy.mount(<Labels labels={{ testLabel: 'testValue' }} />);
    cy.contains('testLabel=testValue').should('be.visible');
  });
});
