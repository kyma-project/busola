import React from 'react';
import { StatusBadge } from '../StatusBadge';
import { render } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

describe('StatusBadge', () => {
  it('renders status text with proper role', () => {
    const { queryByRole } = render(<StatusBadge>INITIAL</StatusBadge>);

    const status = queryByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent('INITIAL');
  });

  it('displays warning when autoResolveType is set and "children" is a node', () => {
    console.warn = jest.fn();

    render(
      <StatusBadge autoResolveType>
        <small>Status</small>
      </StatusBadge>,
    );

    expect(console.warn.mock.calls[0]).toMatchSnapshot();
  });

  it('renders status text with DEFAULT_STATUSES_PATH', () => {
    const DEFAULT_STATUSES_PATH =
      'common.statuses.initialcommon.statuses.initial';
    const { queryByRole } = render(
      <StatusBadge i18n={{ a: 'a' }}>Initial</StatusBadge>,
    );
    const status = queryByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent(DEFAULT_STATUSES_PATH);
  });

  it('renders status text with RESOURCE_STATUSES_PATH', () => {
    const RESOURCE_KIND = 'resource';
    const RESOURCE_STATUSES_PATH =
      'resource.statuses.initialcommon.statuses.initial';
    const { queryByRole } = render(
      <StatusBadge i18n={{ a: 'a' }} resourceKind={RESOURCE_KIND}>
        Initial
      </StatusBadge>,
    );
    const status = queryByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent(RESOURCE_STATUSES_PATH);
  });

  it('renders status text without tooltip', () => {
    const { getByTestId } = render(
      <StatusBadge i18n={{ a: 'a' }} noTooltip>
        Initial
      </StatusBadge>,
    );
    const status = getByTestId('no-tooltip');
    expect(status).toBeInTheDocument();
  });

  it('renders status text with tooltip', () => {
    const { getByTestId } = render(
      <StatusBadge i18n={{ a: 'a' }}>Initial</StatusBadge>,
    );
    const status = getByTestId('has-tooltip');
    expect(status).toBeInTheDocument();
  });
});
