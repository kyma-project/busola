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

jest.mock('react-shared', () => ({
  ...jest.requireActual('react-shared'),
  MonacoEditor: () => "MonacoEditor mock cause Monaco won't work in tests",
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

describe('HelmReleaseData', () => {
  const PANEL_TITLE = 'releases.helm.data-title';

  it('Renders nothing for invalid release data', () => {
    // use original implementation
    mockDecodeHelmRelease.mockImplementationOnce(
      originalDecodeHelmRelease.decodeHelmRelease,
    );

    const release = null;
    const { queryByText } = render(<HelmReleaseData {...release} />);

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
    const { queryByText } = render(<HelmReleaseData {...release} />);

    expect(queryByText(PANEL_TITLE)).toBeInTheDocument();
    expect(queryByText('releases.helm.release-config')).toBeInTheDocument();
    expect(queryByText('releases.helm.chart-files')).toBeInTheDocument();
  });
});
