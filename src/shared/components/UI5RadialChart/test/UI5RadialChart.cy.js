/* global cy */
import { UI5RadialChart } from '../UI5RadialChart';

describe('UI5RadialChart', () => {
  it('Renders valid UI5RadialChart', () => {
    cy.mount(
      <UI5RadialChart value={33.33} max={100} additionalInfo="33.33m / 100m" />,
    );

    cy.get('.radial-chart').should('exist');
    cy.contains('33%').should('exist');
    cy.contains('33.33m / 100m').should('exist');
  });
});
