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

  it('renders "50%" and "512Mi / 1024Mi" for bytes with unit Mi', () => {
    cy.mount(
      <ResourceRadialChart
        value={512 * 2 ** 20}
        max={1024 * 2 ** 20}
        valueType="bytes"
        unit="Mi"
        titleText="Memory Usage"
        accessibleName="Memory usage chart"
      />,
    );

    cy.get('.radial-chart').should('exist');
    cy.contains('50%').should('exist');
    cy.contains('512Mi / 1024Mi').should('exist');
  });

  it('renders "0%" and "0Gi / 4Gi" for bytes with unit Gi when value is 0', () => {
    cy.mount(
      <ResourceRadialChart
        value={0}
        max={4 * 2 ** 30}
        valueType="bytes"
        unit="Gi"
        titleText="Memory Usage"
        accessibleName="Memory usage chart"
      />,
    );

    cy.get('.radial-chart').should('exist');
    cy.contains('0%').should('exist');
    cy.contains('0Gi / 4Gi').should('exist');
  });

  it('renders "25%" and "2Gi / 8Gi" for bytes with unit Gi', () => {
    cy.mount(
      <ResourceRadialChart
        value={2 * 2 ** 30}
        max={8 * 2 ** 30}
        valueType="bytes"
        unit="Gi"
        titleText="Memory Usage"
        accessibleName="Memory usage chart"
      />,
    );

    cy.get('.radial-chart').should('exist');
    cy.contains('25%').should('exist');
    cy.contains('2Gi / 8Gi').should('exist');
  });
});
