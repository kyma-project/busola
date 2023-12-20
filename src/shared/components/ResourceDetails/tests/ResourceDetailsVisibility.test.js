import { Suspense } from 'react';
import { render, waitFor } from 'testing/reactTestingUtils';
import { ResourceDetails } from '../ResourceDetails';
import { ThemeProvider } from '@ui5/webcomponents-react';

jest.mock('shared/hooks/BackendAPI/useGet', () => ({
  useGet: () => {
    return {
      loading: false,
      error: null,
      data: {
        kind: 'TestKind',
        metadata: {
          name: 'test-resource-name',
          namespace: 'test-resource-namespace',
        },
      },
    };
  },
  useSingleGet: () => {},
}));

jest.mock('components/Extensibility/ExtensibilityInjections', () => () => (
  <div />
));

describe('ResourceDetails visibility', () => {
  it('Column visibility', async () => {
    const { queryByText } = render(
      <ThemeProvider>
        <Suspense fallback="loading">
          <ResourceDetails
            resourceUrl="test-resource-url"
            resourceType="test-resource-type"
            customColumns={[
              {
                header: 'some-header--hidden',
                value: () => 'should not be visible',
                visibility: () => ({ visible: false }),
              },
              {
                header: 'some-header--visible',
                value: () => 'should be visible',
                visibility: () => ({ visible: true }),
              },
              {
                header: 'some-header--with-error',
                value: () => 'will be ignored',
                visibility: () => ({ error: 'error!' }),
              },
            ]}
          />
        </Suspense>
      </ThemeProvider>,
    );

    await waitFor(() => {
      // hidden
      expect(queryByText('some-header--hidden')).not.toBeInTheDocument();
      expect(queryByText('should not be visible')).not.toBeInTheDocument();

      // visible
      expect(queryByText('some-header--visible')).toBeInTheDocument();
      expect(queryByText('should be visible')).toBeInTheDocument();

      // with error
      expect(queryByText('some-header--with-error')).toBeInTheDocument();
      expect(queryByText('will be ignored')).not.toBeInTheDocument();
      expect(queryByText('common.messages.error')).toBeInTheDocument();
    });
  }, 10000);
});
