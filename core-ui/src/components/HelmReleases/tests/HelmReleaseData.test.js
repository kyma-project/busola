import React from 'react';
import { render } from '@testing-library/react';
import { HelmReleaseData } from '../HelmReleaseData';

const mockDecodeHelmRelease = jest.fn();
jest.mock('components/HelmReleases/decodeHelmRelease', () => ({
  decodeHelmRelease: release => mockDecodeHelmRelease(release),
}));

const originalDecodeHelmRelease = jest.requireActual(
  'components/HelmReleases/decodeHelmRelease',
);

jest.mock('shared/components/ReadonlyEditorPanel', () => 'mock');

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));
describe.skip('HelmReleaseData', () => {
  const PANEL_TITLE = 'helm-releases.headers.release';

  it('Renders nothing for invalid release data', () => {
    // use original implementation
    mockDecodeHelmRelease.mockImplementationOnce(
      originalDecodeHelmRelease.decodeHelmRelease,
    );

    const release = null;
    const { queryByText } = render(
      <HelmReleaseData encodedRelease={release} simpleHeader={false} />,
    );

    expect(queryByText(PANEL_TITLE)).not.toBeInTheDocument();
  });

  it('Renders release data for valid Helm release', () => {
    const mockRelease = {
      config: {},
      chart: { metadata: {} },
      info: {
        first_deployed: new Date().toISOString(),
        last_deployed: new Date().toISOString(),
      },
    };
    mockDecodeHelmRelease.mockImplementationOnce(() => mockRelease);

    const release = {};
    const { queryByText } = render(
      <HelmReleaseData encodedRelease={release} simpleHeader={false} />,
    );

    expect(queryByText(PANEL_TITLE)).toBeInTheDocument();
    expect(
      queryByText('helm-releases.headers.release-data'),
    ).toBeInTheDocument();
    expect(
      queryByText('helm-releases.headers.chart-files'),
    ).toBeInTheDocument();
  });
});
