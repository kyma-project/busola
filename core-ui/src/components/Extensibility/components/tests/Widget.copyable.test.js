import { fireEvent, render } from '@testing-library/react';
import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';
import { act } from 'react-dom/test-utils';
import copyToClipboard from 'copy-to-clipboard';

// those tests are in separate file as we need to mock the `widgets` collection from `./../index.js`...
// ... which originals in turn are required in other `Widget.test.js`

jest.mock('components/Extensibility/ExtensibilityCreate', () => null);

const MockWidget = ({ value }) => value;
jest.doMock('./../index', () => {
  return {
    widgets: { CopyableMockWidget: MockWidget },
    valuePreprocessors: [],
  };
});

jest.mock('copy-to-clipboard');

describe('Widget.copyable', () => {
  it('Render copy button', async () => {
    const { Widget } = await import('../Widget');
    MockWidget.copyable = true;
    MockWidget.inline = true;

    const { getByRole } = render(
      <DataSourcesContextProvider value={{}} dataSources={{}}>
        <Widget
          structure={{
            source: '"test-value"',
            widget: 'CopyableMockWidget',
            copyable: true,
          }}
        />
      </DataSourcesContextProvider>,
    );

    // wait is added because `useJsonata` in `Widget` doesn't return immediately
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve));

      // find copy button
      const button = getByRole('button');

      fireEvent.click(button);

      expect(copyToClipboard).toHaveBeenCalledWith('test-value');
    });
  });

  it('Widget.Inline, !Widget.copyable, schema.copyable => do not render copy button', async () => {
    const { Widget } = await import('../Widget');
    MockWidget.copyable = false;
    MockWidget.inline = true;

    const { queryByRole } = render(
      <DataSourcesContextProvider value={{}} dataSources={{}}>
        <Widget structure={{ widget: 'CopyableMockWidget', copyable: true }} />
      </DataSourcesContextProvider>,
    );

    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('!Widget.Inline, Widget.copyable, schema.copyable => do not render copy button', async () => {
    const { Widget } = await import('../Widget');
    MockWidget.copyable = true;
    MockWidget.inline = false;

    const { queryByRole } = render(
      <DataSourcesContextProvider value={{}} dataSources={{}}>
        <Widget structure={{ widget: 'CopyableMockWidget', copyable: true }} />
      </DataSourcesContextProvider>,
    );

    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('Widget.Inline, Widget.copyable, !schema.copyable => do not render copy button', async () => {
    const { Widget } = await import('../Widget');
    MockWidget.copyable = true;
    MockWidget.inline = false;

    const { queryByRole } = render(
      <DataSourcesContextProvider value={{}} dataSources={{}}>
        <Widget structure={{ widget: 'CopyableMockWidget', copyable: false }} />
      </DataSourcesContextProvider>,
    );

    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('Custom copy function', async () => {
    const { Widget } = await import('../Widget');
    MockWidget.copyable = true;
    MockWidget.inline = true;
    MockWidget.copyFunction = ({ value }) => 'this is ' + value;

    const { getByRole } = render(
      <DataSourcesContextProvider value={{}} dataSources={{}}>
        <Widget
          structure={{
            source: '"test-value"',
            widget: 'CopyableMockWidget',
            copyable: true,
          }}
        />
      </DataSourcesContextProvider>,
    );

    // wait is added because `useJsonata` in `Widget` doesn't return immediately
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve));

      // find copy button
      const button = getByRole('button');

      fireEvent.click(button);

      expect(copyToClipboard).toHaveBeenCalledWith('this is test-value');
    });
  });
});
