/* global cy, describe, it */
import { ResourceRadialChart } from '../ResourceRadialChart';

describe('ResourceRadialChart', () => {
  it('renders "0%" and "0m / 0m" when value and max are both 0', () => {
    cy.mount(
      <ResourceRadialChart
        value={0}
        max={0}
        valueType="cpu"
        unit="m"
        titleText="CPU Usage"
        accessibleName="CPU usage chart"
      />,
    );

    cy.get('.radial-chart').should('exist');
    cy.contains('0%').should('exist');
    cy.contains('0m / 0m').should('exist');
  });

  it('renders "0%" when value is 0 and max is positive', () => {
    cy.mount(
      <ResourceRadialChart
        value={0}
        max={1000}
        valueType="cpu"
        unit="m"
        titleText="CPU Usage"
        accessibleName="CPU usage chart"
      />,
    );

    cy.get('.radial-chart').should('exist');
    cy.contains('0%').should('exist');
    cy.contains('0m / 1000000m').should('exist');
  });
});
