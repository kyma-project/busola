/* global cy, describe, it */
import { ReleaseDataPanel } from '../ReleaseDataPanel';

describe('ReleaseDataPanel', () => {
  it('Renders release data', () => {
    const release = {
      name: 'mock-release',
      version: '8',
      chart: {
        metadata: {
          name: 'mock-chart-name',
          description: 'mock-chart-description',
          version: 'mock-chart-version',
        },
      },
      info: {
        first_deployed: new Date(1410, 7, 10).toISOString(),
        last_deployed: new Date(1996, 5, 30).toISOString(),
      },
    };

    cy.mount(<ReleaseDataPanel release={release} />);

    cy.contains('mock-chart-name').should('be.visible');
    cy.contains('mock-chart-description').should('be.visible');
    cy.contains('mock-chart-version').should('be.visible');
  });
});
