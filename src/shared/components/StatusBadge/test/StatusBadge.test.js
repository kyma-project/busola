import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('StatusBadge', () => {
  it('renders status text with proper role', () => {
    const { queryByRole } = render(
      <ThemeProvider>
        <StatusBadge>INITIAL</StatusBadge>
      </ThemeProvider>,
    );

    const status = queryByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent('common.statuses.initial');
  });

  it('displays warning when autoResolveType is set and "children" is a node', () => {
    console.warn = jest.fn();

    render(
      <ThemeProvider>
        <StatusBadge autoResolveType>
          <small>Status</small>
        </StatusBadge>
      </ThemeProvider>,
    );

    expect(console.warn.mock.calls[0]).toMatchSnapshot();
  });

  it('renders status text with DEFAULT_STATUSES_PATH', () => {
    const DEFAULT_STATUSES_PATH = 'common.statuses.initial';
    // 'common.statuses.initial,common.statuses.initial,fallback';
    const { queryByRole } = render(
      <ThemeProvider>
        <StatusBadge>Initial</StatusBadge>
      </ThemeProvider>,
    );
    const status = queryByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent(DEFAULT_STATUSES_PATH);
  });

  it('renders status text with RESOURCE_STATUSES_PATH', () => {
    const RESOURCE_KIND = 'resource';
    const RESOURCE_STATUSES_PATH = 'resource.statuses.initial';
    const { queryByRole } = render(
      <ThemeProvider>
        <StatusBadge resourceKind={RESOURCE_KIND}>Initial</StatusBadge>
      </ThemeProvider>,
    );
    const status = queryByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent(RESOURCE_STATUSES_PATH);
  });

  it('renders status text without tooltip', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <StatusBadge noTooltip>Initial</StatusBadge>
      </ThemeProvider>,
    );
    const status = getByTestId('no-tooltip');
    expect(status).toBeInTheDocument();
  });

  it('renders status text with tooltip', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <StatusBadge>Initial</StatusBadge>
      </ThemeProvider>,
    );
    const status = getByTestId('has-tooltip');
    expect(status).toBeInTheDocument();
  });
});
