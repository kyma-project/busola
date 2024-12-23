/* global cy */
import { HelmReleaseData } from '../HelmReleaseData';

describe('HelmReleaseData.cy.jsx', () => {
  it('renders nothing for invalid release data', () => {
    it('Renders nothing for invalid release data', () => {
      const release = null;

      cy.mount(<HelmReleaseData encodedRelease={release} />);

      cy.contains('helm-releases.headers.release-manifest').should('not.exist');
      cy.contains('helm-releases.headers.chart-files').should('not.exist');
    });
  });

  it('Renders release data for valid Helm release', () => {
    const release = {
      config: {},
      chart: { metadata: {} },
      info: {
        first_deployed: new Date().toISOString(),
        last_deployed: new Date().toISOString(),
      },
    };

    cy.mount(<HelmReleaseData release={release} />);

    cy.contains('helm-releases.headers.release-manifest').should('exist');
    cy.contains('helm-releases.headers.chart-files').should('exist');
  });
});
