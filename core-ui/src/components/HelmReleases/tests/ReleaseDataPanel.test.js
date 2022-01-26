import React from 'react';
import { render } from '@testing-library/react';
import { ReleaseDataPanel } from '../ReleaseDataPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

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
    const { queryByText } = render(<ReleaseDataPanel release={release} />);

    expect(queryByText('mock-chart-name')).toBeInTheDocument();
    expect(queryByText('mock-chart-description')).toBeInTheDocument();
    expect(queryByText('mock-chart-version')).toBeInTheDocument();
  });
});
