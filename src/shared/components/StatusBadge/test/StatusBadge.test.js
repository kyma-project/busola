import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { act, render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('StatusBadge', () => {
  it('renders status text with proper role', async () => {
    const { queryByRole } = render(
      <ThemeProvider>
        <StatusBadge>Initial</StatusBadge>
      </ThemeProvider>,
    );

    await waitFor(async () => {
      await act(async () => {
        const status = queryByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent('common.statuses.initial');
      });
    });
  });

  it('displays warning when autoResolveType is set and "children" is a node', async () => {
    console.warn = jest.fn();

    render(
      <ThemeProvider>
        <StatusBadge autoResolveType>
          <small>Status</small>
        </StatusBadge>
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(console.warn.mock.calls[0]).toMatchSnapshot();
      });
    });
  });

  it('renders status text with DEFAULT_STATUSES_PATH', async () => {
    const DEFAULT_STATUSES_PATH = 'common.statuses.initial';
    // 'common.statuses.initial,common.statuses.initial,fallback';
    const { queryByRole } = render(
      <ThemeProvider>
        <StatusBadge>Initial</StatusBadge>
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        const status = queryByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent(DEFAULT_STATUSES_PATH);
      });
    });
  });

  it('renders status text with RESOURCE_STATUSES_PATH', async () => {
    const RESOURCE_KIND = 'resource';
    const RESOURCE_STATUSES_PATH = 'resource.statuses.initial';
    const { queryByRole } = render(
      <ThemeProvider>
        <StatusBadge resourceKind={RESOURCE_KIND}>Initial</StatusBadge>
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        const status = queryByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent(RESOURCE_STATUSES_PATH);
      });
    });
  });

  it('renders status text without tooltip', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <StatusBadge noTooltip>Initial</StatusBadge>
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        const status = getByTestId('no-tooltip');
        expect(status).toBeInTheDocument();
      });
    });
  });

  it('renders status text with tooltip', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <StatusBadge>Initial</StatusBadge>
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        const status = getByTestId('has-tooltip');
        expect(status).toBeInTheDocument();
      });
    });
  });
});
