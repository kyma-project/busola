import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { act, render, waitFor } from '@testing-library/react';

vi.mock('@ui5/webcomponents-react', () => {
  return {
    ObjectStatus: props => <div {...props}>{props.children}</div>,
    Popover: () => <></>,
  };
});

describe('StatusBadge', () => {
  it('renders status text with proper role', async () => {
    const { queryByRole } = render(<StatusBadge>Initial</StatusBadge>);

    await waitFor(async () => {
      await act(async () => {
        const status = queryByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent('common.statuses.initial');
      });
    });
  });

  it('renders status text with DEFAULT_STATUSES_PATH', async () => {
    const DEFAULT_STATUSES_PATH = 'common.statuses.initial';
    const { queryByRole } = render(<StatusBadge>Initial</StatusBadge>);
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
      <StatusBadge resourceKind={RESOURCE_KIND}>Initial</StatusBadge>,
    );
    await waitFor(async () => {
      await act(async () => {
        const status = queryByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent(RESOURCE_STATUSES_PATH);
      });
    });
  });
});
