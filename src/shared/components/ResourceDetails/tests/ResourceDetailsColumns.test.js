import { Suspense } from 'react';
import { render, waitFor } from 'testing/reactTestingUtils';
import { ResourceDetails } from '../ResourceDetails';
import { ThemeProvider } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons.js';

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

describe('ResourceDetails Columns', () => {
  it('Renders basic column', async () => {
    const { queryByText } = render(
      <ThemeProvider>
        <Suspense fallback="loading">
          <ResourceDetails
            resourceUrl="test-resource-url"
            resourceType="test-resource-type"
            customColumns={[
              {
                header: 'some-header',
                value: resource =>
                  resource.metadata.name + ' | ' + resource.metadata.namespace,
              },
            ]}
          />
        </Suspense>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(queryByText('some-header')).toBeInTheDocument();
      expect(
        queryByText('test-resource-name | test-resource-namespace'),
      ).toBeInTheDocument();
    });
  }, 10000);
});
