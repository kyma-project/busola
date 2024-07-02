import { render } from '@testing-library/react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { UI5RadialChart } from '../UI5RadialChart';

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
});

describe('UI5RadialChart', () => {
  it('Renders valid UI5RadialChart', () => {
    const { container, queryByText } = render(
      <ThemeProvider>
        <UI5RadialChart
          value={33.33}
          max={100}
          additionalInfo={`${33.33}m / ${100}m`}
        />
      </ThemeProvider>,
    );

    const radialChart = container.querySelector('.radial-chart');
    expect(radialChart).toBeInTheDocument();
    expect(queryByText('33.33m / 100m')).toBeInTheDocument();
  });
});
