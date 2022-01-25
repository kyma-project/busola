import React from 'react';
import { render } from '@testing-library/react';
import { HelmReleaseData } from '../HelmReleaseData';

const mockDecodeHelmRelease = jest.fn();
jest.mock('../decodeHelmRelease', () => ({
  decodeHelmRelease: release => mockDecodeHelmRelease(release),
}));
const originalDecodeHelmRelease = jest.requireActual('../decodeHelmRelease');

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
  const PANEL_TITLE = 'secrets.helm.data-title';

  it('Renders nothing for non Helm release secret', () => {
    const secret = {};
    const { queryByText } = render(<HelmReleaseData {...secret} />);

    expect(queryByText(PANEL_TITLE)).not.toBeInTheDocument();
  });

  it('Renders nothing for invalid release data', () => {
    // use original implementation
    mockDecodeHelmRelease.mockImplementationOnce(
      originalDecodeHelmRelease.decodeHelmRelease,
    );

    const secret = { type: 'helm.sh/release.v1', data: {} };
    const { queryByText } = render(<HelmReleaseData {...secret} />);

    expect(queryByText(PANEL_TITLE)).not.toBeInTheDocument();
  });

  it('Renders release data for valid Helm secret', () => {
    const mockRelease = {
      config: {},
      chart: { metadata: {} },
      info: {
        first_deployed: new Date().toISOString(),
        last_deployed: new Date().toISOString(),
      },
    };
    mockDecodeHelmRelease.mockImplementationOnce(() => mockRelease);

    const secret = { type: 'helm.sh/release.v1', data: {} };
    const { queryByText } = render(<HelmReleaseData {...secret} />);

    expect(queryByText(PANEL_TITLE)).toBeInTheDocument();
    expect(queryByText('secrets.helm.release-config')).toBeInTheDocument();
    expect(queryByText('secrets.helm.chart-files')).toBeInTheDocument();
  });
});
