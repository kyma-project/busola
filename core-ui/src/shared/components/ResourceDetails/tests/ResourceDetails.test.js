import { Suspense } from 'react';
import { render, waitFor } from 'testing/reactTestingUtils';
import { ResourceDetails } from '../ResourceDetails';

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
}));

describe('ResourceDetails', () => {
  describe('Columns', () => {
    it('Renders basic column', async () => {
      const { queryByText } = render(
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
          ,
        </Suspense>,
      );

      await waitFor(() => {
        expect(queryByText('some-header')).toBeInTheDocument();
        expect(
          queryByText('test-resource-name | test-resource-namespace'),
        ).toBeInTheDocument();
      });
    });

    it('Column visibility', async () => {
      const { queryByText } = render(
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
        </Suspense>,
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
    });
  });
});
