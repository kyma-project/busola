import { render } from '@testing-library/react';
import { HelmReleaseData } from '../HelmReleaseData';

const mockDecodeHelmRelease = vi.fn();
vi.mock('components/HelmReleases/decodeHelmRelease', () => ({
  default: release => mockDecodeHelmRelease(release),
  decodeHelmRelease: release => mockDecodeHelmRelease(release),
}));

const originalDecodeHelmRelease = vi.importActual(
  'components/HelmReleases/decodeHelmRelease',
);

vi.mock('shared/components/ReadonlyEditorPanel', () => ({
  default: 'mock',
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
      <HelmReleaseData encodedRelease={release} />,
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
      <HelmReleaseData encodedRelease={release} />,
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
