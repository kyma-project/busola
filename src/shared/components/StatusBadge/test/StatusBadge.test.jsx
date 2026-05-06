import { act, cloneElement } from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@ui5/webcomponents-react', () => {
  return {
    ObjectStatus: (props) => <div role={props.role}>{props.children}</div>,
    Popover: (props) => (
      <div ref={props.ref}>{props.open ? props.children : null}</div>
    ),
    Text: (props) => <span>{props.children}</span>,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => (Array.isArray(key) ? key[0] : key),
    i18n: {
      changeLanguage: () => new Promise(() => {}),
      options: {},
      exists: () => true,
    },
  }),
  Trans: ({ defaults, components }) => {
    if (!components?.length) return <>{defaults}</>;
    const parts = defaults.split(/(<\d+>.*?<\/\d+>)/);
    return (
      <>
        {parts.map((part, i) => {
          const match = part.match(/^<(\d+)>(.*?)<\/\1>$/);
          if (match) {
            return cloneElement(components[parseInt(match[1])], {
              key: i,
              children: match[2],
            });
          }
          return part;
        })}
      </>
    );
  },
}));

vi.mock('shared/components/ExternalLink/ExternalLink', () => ({
  ExternalLink: ({ url, children }) => <a href={url}>{children || url}</a>,
}));

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

describe('StatusBadge tooltipContent link detection', () => {
  it('renders a plain-text tooltip without links as-is', async () => {
    render(
      <StatusBadge tooltipContent="No link here" type="Negative">
        Error
      </StatusBadge>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('No link here')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('converts a raw URL in tooltipContent to a link', async () => {
    render(
      <StatusBadge
        tooltipContent="See https://example.com for details"
        type="Negative"
      >
        Error
      </StatusBadge>,
    );

    await userEvent.click(screen.getByRole('button'));

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('converts a markdown link in tooltipContent to a link', async () => {
    render(
      <StatusBadge
        tooltipContent="See [docs](https://example.com)"
        type="Negative"
      >
        Error
      </StatusBadge>,
    );

    await userEvent.click(screen.getByRole('button'));

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveTextContent('docs');
  });

  it('skips link detection when disableLinkDetection is true', async () => {
    render(
      <StatusBadge
        tooltipContent="https://example.com"
        type="Negative"
        disableLinkDetection={true}
      >
        Error
      </StatusBadge>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('skips link detection when tooltipContent is a JSX node', async () => {
    render(
      <StatusBadge tooltipContent={<span>custom content</span>} type="Negative">
        Error
      </StatusBadge>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('custom content')).toBeInTheDocument();
  });
});
