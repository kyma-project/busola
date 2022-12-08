import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';
import { Suspense } from 'react';
import { render, waitFor } from 'testing/reactTestingUtils';
import { Widget } from '../Widget';

jest.mock('components/Extensibility/ExtensibilityCreate', () => null);

const resource = {
  test: 'test-value',
};

const TestWrapper = ({ children }) => (
  <Suspense fallback="loading">
    <DataSourcesContextProvider value={{}} dataSources={{}}>
      {children}
    </DataSourcesContextProvider>
  </Suspense>
);

describe('Widget', () => {
  describe('structure.visible', () => {
    it('not set -> render component as usual', async () => {
      const { findByText } = render(
        <TestWrapper>
          <Widget value={resource} structure={{ source: '$.test' }} />
        </TestWrapper>,
      );

      expect(await findByText('test-value'));
    });

    it('falsy (but not boolean "false") -> render component as usual', async () => {
      const { findByText } = render(
        <TestWrapper>
          <Widget
            value={resource}
            structure={{ source: '$.test', visibility: null }}
          />
        </TestWrapper>,
      );

      expect(await findByText('test-value'));
    });

    it('Explicitly false -> hide component', async () => {
      const { queryByText } = render(
        <TestWrapper>
          <Widget
            value={resource}
            structure={{ source: '$.test', visibility: false }}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText(/loading/)).not.toBeInTheDocument();
        expect(queryByText(/test-value/)).not.toBeInTheDocument();
      });
    });

    it('jsonata error -> display error', async () => {
      console.warn = jest.fn();

      const { findByText } = render(
        <TestWrapper>
          <Widget
            value={resource}
            structure={{ source: '$.test', visibility: '$undefinedMethod()' }}
          />
        </TestWrapper>,
      );
      expect(await findByText('extensibility.configuration-error'));
    });

    it('jsonata -> control visibility', async () => {
      const { queryByText } = render(
        <TestWrapper>
          <Widget
            value={resource}
            structure={{
              source: '$.test',
              visibility: '$contains($value, "test")',
            }}
          />
          <Widget
            value={resource}
            structure={{
              source: '$.test',
              visibility: '$contains($value, "not-test")',
            }}
          />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(queryByText(/loading/)).not.toBeInTheDocument();

        // you have to use queryByText here because you expect `test-value` to be rendered only once
        // if there were more elements, it would be necessary to use `queryAllByText` and `queryByText` would fail
        expect(queryByText(/test-value/)).toBeInTheDocument();
      });
    });
  });
});
