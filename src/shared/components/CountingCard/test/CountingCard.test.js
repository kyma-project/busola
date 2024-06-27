import { render } from '@testing-library/react';
import { Button, ThemeProvider } from '@ui5/webcomponents-react';
import { MemoryRouter } from 'react-router-dom';
import { CountingCard } from '../CountingCard';

describe('CountingCard', () => {
  it('Renders valid CountingCard', async () => {
    const { container, queryByText } = render(
      <MemoryRouter>
        <ThemeProvider>
          <CountingCard
            className="test123"
            value={123}
            title="Test CountingCard Title"
            subTitle="Test CountingCard Subtitle"
            resourceUrl="pods"
            isClusterResource={false}
            allNamespaceURL={true}
            extraInfo={[
              {
                title: 'ExtraInfo1',
                value: 111,
              },
              {
                title: 'ExtraInfo2',
                value: 222,
              },
            ]}
            additionalContent={<Button>Nice Button</Button>}
          />
        </ThemeProvider>
      </MemoryRouter>,
    );

    const countingCard = container.querySelector(
      'ui5-card.counting-card.test123',
    );
    expect(countingCard).toBeInTheDocument();
    expect(queryByText('Test CountingCard Title')).toBeInTheDocument();
    expect(queryByText('Test CountingCard Subtitle')).toBeInTheDocument();
    expect(queryByText(123)).toBeInTheDocument();
    expect(queryByText('ExtraInfo1')).toBeInTheDocument();
    expect(queryByText(111)).toBeInTheDocument();
    expect(queryByText('ExtraInfo2')).toBeInTheDocument();
    expect(queryByText(222)).toBeInTheDocument();
    expect(
      countingCard.querySelector('ui5-link.counting-card__link'),
    ).toBeInTheDocument();
    expect(countingCard.querySelector('ui5-button')).toHaveTextContent(
      'Nice Button',
    );
  });

  it('Does not render link', async () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <CountingCard
            className="test123"
            value={123}
            title="Test CountingCard Title"
            subTitle="Test CountingCard Subtitle"
            extraInfo={[
              {
                title: 'ExtraInfo1',
                value: 111,
              },
              {
                title: 'ExtraInfo2',
                value: 222,
              },
            ]}
          />
        </ThemeProvider>
      </MemoryRouter>,
    );

    const countingCard = container.querySelector(
      'ui5-card.counting-card.test123',
    );

    expect(
      countingCard.querySelector('ui5-link.counting-card__link'),
    ).not.toBeInTheDocument();
  });
});
