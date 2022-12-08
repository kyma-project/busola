import { fireEvent, render, act, waitFor } from 'testing/reactTestingUtils';
import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';
import copyToClipboard from 'copy-to-clipboard';
import { Suspense } from 'react';

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

const TestWrapper = ({ children }) => (
  <Suspense fallback="loading">
    <DataSourcesContextProvider value={{}} dataSources={{}}>
      {children}
    </DataSourcesContextProvider>
  </Suspense>
);

// Widget needs to be imported in each test so that mocking './../index' works
describe('Widget.copyable', () => {
  it('Render copy button', async () => {
    const { Widget } = await import('../Widget');
    CopyableMockWidget.copyable = true;
    CopyableMockWidget.inline = true;

    const { getByRole } = render(
      <TestWrapper>
        <Widget
          structure={{
            source: '"test-value"',
            widget: 'CopyableMockWidget',
            copyable: true,
          }}
        />
        ,
      </TestWrapper>,
    );

    await waitFor(async () => {
      await act(async () => {
        await new Promise(setTimeout);

        // find copy button
        const button = getByRole('button');

        fireEvent.click(button);

        expect(copyToClipboard).toHaveBeenCalledWith('test-value');
      });
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
        <TestWrapper>
          <Widget
            structure={{
              widget: 'CopyableMockWidget',
              copyable: schemaCopyable,
            }}
          />
        </TestWrapper>,
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
      <TestWrapper>
        <Widget
          structure={{
            source: '"test-value"',
            widget: 'CopyableMockWidget',
            copyable: true,
          }}
        />
      </TestWrapper>,
    );

    await waitFor(async () => {
      await act(async () => {
        await new Promise(setTimeout);

        // find copy button
        const button = getByRole('button');

        fireEvent.click(button);

        expect(copyToClipboard).toHaveBeenCalledWith('this is test-value');
      });
    });
  });
});
