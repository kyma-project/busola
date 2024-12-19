import { act, render, screen } from '@testing-library/react';
import { Badge } from '../Badge';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { PopoverBadge } from 'shared/components/PopoverBadge/PopoverBadge';
import { ThemeProvider } from '@ui5/webcomponents-react';

vi.mock('../../hooks/useJsonata', () => ({
  useJsonata: () => {
    return structure => [structure];
  },
}));

vi.mock('shared/components/StatusBadge/StatusBadge', async () => {
  const StatusBadgeMock = (
    await vi.importActual('shared/components/StatusBadge/StatusBadge')
  ).StatusBadge;
  return {
    StatusBadge: vi.fn(props => <StatusBadgeMock {...props} />),
  };
});

vi.mock('shared/components/PopoverBadge/PopoverBadge', async () => {
  const PopoverBadgeMock = (
    await vi.importActual('shared/components/PopoverBadge/PopoverBadge')
  ).PopoverBadge;
  return {
    PopoverBadge: vi.fn(props => <PopoverBadgeMock {...props} />),
  };
});

describe('Badge', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Renders a badge with a default type', () => {
    const value = 'Unknown';
    const structure = {};

    render(
      <ThemeProvider>
        <Badge value={value} structure={structure} />
      </ThemeProvider>,
    );

    expect(StatusBadge).toHaveBeenCalledWith(
      expect.objectContaining({
        type: null,
        autoResolveType: true,
      }),
      {},
    );

    const status = screen.getAllByRole('status');
    expect(status).toHaveLength(1);
  });

  it('Renders a badge with success type for custom highlights', () => {
    const value = 'yes';
    const structure = {
      highlights: {
        success: ['yes', 'ok'],
      },
    };

    render(
      <ThemeProvider>
        <Badge value={value} structure={structure} />
      </ThemeProvider>,
    );

    expect(StatusBadge).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'Success',
        autoResolveType: false,
      }),
      {},
    );

    const status = screen.getAllByRole('status');
    expect(status).toHaveLength(1);
  });

  it('Renders a badge with error type for custom highlights', () => {
    const value = -2;
    const structure = {
      highlights: {
        critical: 'data < 0',
      },
    };

    render(
      <ThemeProvider>
        <Badge value={value} structure={structure} />
      </ThemeProvider>,
    );
    expect(StatusBadge).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'Error',
        autoResolveType: false,
      }),
      {},
    );

    const status = screen.getAllByRole('status');
    expect(status).toHaveLength(1);
  });

  it('Renders a custom empty placeholder for empty values', () => {
    const value = null;
    const structure = {
      placeholder: 'empty',
    };

    const { getByText } = render(
      <ThemeProvider>
        <Badge value={value} structure={structure} />
      </ThemeProvider>,
    );

    expect(getByText('extensibility::empty')).toBeVisible();
  });

  it('Renders a default placeholder for empty values', () => {
    const value = null;
    const structure = {};

    const { getByText } = render(
      <ThemeProvider>
        <Badge value={value} structure={structure} />
      </ThemeProvider>,
    );

    expect(getByText('-')).toBeVisible();
  });

  it('Renders a badge with a popover', () => {
    const value = 'yes';
    const structure = {
      description: 'popover',
    };

    act(() => {
      render(
        <ThemeProvider>
          <Badge value={value} structure={structure} />
        </ThemeProvider>,
      );
    });

    expect(PopoverBadge).toHaveBeenCalledWith(
      expect.objectContaining({
        tooltipContent: 'popover',
      }),
      {},
    );

    const popoverBadge = screen.getAllByTestId('has-tooltip');
    expect(popoverBadge).toHaveLength(1);
  });
});
