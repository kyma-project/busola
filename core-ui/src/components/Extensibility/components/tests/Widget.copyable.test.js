import { fireEvent, render } from '@testing-library/react';
import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';
import { act } from 'react-dom/test-utils';
import copyToClipboard from 'copy-to-clipboard';

// those tests are in separate file as we need to mock the `widgets` collection from `./../index.js`...
// ... which originals in turn are required in other `Widget.test.js`

const CopyableMockWidget = ({ value }) => value;
jest.doMock('./../index', () => {
  return {
    widgets: { CopyableMockWidget },
    valuePreprocessors: [],
  };
});

jest.mock('copy-to-clipboard');

const environmentMock = ({ children }) => (
  <DataSourcesContextProvider value={{}} dataSources={{}}>
    {children}
  </DataSourcesContextProvider>
);

// Widget needs to be imported in each test so that mocking './../index' works
describe('Widget.copyable', () => {
  it('Render copy button', async () => {
    const { Widget } = await import('../Widget');
    CopyableMockWidget.copyable = true;
    CopyableMockWidget.inline = true;

    const { getByRole } = render(
      <Widget
        structure={{
          source: '"test-value"',
          widget: 'CopyableMockWidget',
          copyable: true,
        }}
      />,
      { wrapper: environmentMock },
    );

    // wait is added because `useJsonata` in `Widget` doesn't return immediately
    await act(async () => {
      await new Promise(setTimeout);

      // find copy button
      const button = getByRole('button');

      fireEvent.click(button);

      expect(copyToClipboard).toHaveBeenCalledWith('test-value');
    });
  });

  test.each([
    [false, true, true],
    [true, false, true],
    [true, true, false],
  ])(
    'Widget.Inline=%s, Widget.copyable=%s, schema.copyable=%s => do not render copy button',
    async (widgetInline, widgetCopyable, schemaCopyable) => {
      const { Widget } = await import('../Widget');
      CopyableMockWidget.inline = widgetInline;
      CopyableMockWidget.copyable = widgetCopyable;

      const { queryByRole } = render(
        <Widget
          structure={{ widget: 'CopyableMockWidget', copyable: schemaCopyable }}
        />,
        { wrapper: environmentMock },
      );

      expect(queryByRole('button')).not.toBeInTheDocument();
    },
  );

  it('Custom copy function', async () => {
    const { Widget } = await import('../Widget');
    CopyableMockWidget.copyable = true;
    CopyableMockWidget.inline = true;
    CopyableMockWidget.copyFunction = ({ value }) => 'this is ' + value;

    const { getByRole } = render(
      <Widget
        structure={{
          source: '"test-value"',
          widget: 'CopyableMockWidget',
          copyable: true,
        }}
      />,
      { wrapper: environmentMock },
    );

    // wait is added because `useJsonata` in `Widget` doesn't return immediately
    await act(async () => {
      await new Promise(setTimeout);

      // find copy button
      const button = getByRole('button');

      fireEvent.click(button);

      expect(copyToClipboard).toHaveBeenCalledWith('this is test-value');
    });
  });
});
